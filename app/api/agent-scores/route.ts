import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const periods = ["DAILY", "WEEKLY", "MONTHLY"] as const;
type Period = typeof periods[number];

async function getVisibleAgentIds(userId: string, role: string) {
  if (role === "ADMIN") {
    const agents = await prisma.user.findMany({
      where: { role: { name: "AGENT" }, isActive: true, status: "ACTIVE" },
      select: { id: true },
    });
    return agents.map((agent) => agent.id);
  }

  const manager = await prisma.user.findUnique({ where: { id: userId }, select: { departmentId: true } });
  const departments = await prisma.department.findMany({
    where: {
      OR: [
        { managerId: userId },
        ...(manager?.departmentId ? [{ id: manager.departmentId }] : []),
      ],
    },
    select: { id: true },
  });
  if (!departments.length) return [];

  const agents = await prisma.user.findMany({
    where: {
      role: { name: "AGENT" },
      departmentId: { in: departments.map((department) => department.id) },
      isActive: true,
      status: "ACTIVE",
    },
    select: { id: true },
  });
  return agents.map((agent) => agent.id);
}

function parsePeriod(value: string | null): Period | null {
  return periods.includes(value as Period) ? value as Period : null;
}

function getPeriodStart(period: Period, value: string | null) {
  const dateString = value || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateString) return null;

  if (period === "DAILY") return date;
  if (period === "WEEKLY") {
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - daysSinceMonday);
    return date;
  }
  date.setUTCDate(1);
  return date;
}

function authorizedRole(role: string | null | undefined) {
  return role === "ADMIN" || role === "MANAGER";
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !authorizedRole(session.user.role)) {
    return NextResponse.json({ message: "Accès réservé à l'administration et aux managers." }, { status: 403 });
  }

  const url = new URL(request.url);
  const period = parsePeriod(url.searchParams.get("period") || "DAILY");
  if (!period) return NextResponse.json({ message: "Période invalide." }, { status: 400 });
  const periodStart = getPeriodStart(period, url.searchParams.get("date"));
  if (!periodStart) return NextResponse.json({ message: "Date invalide." }, { status: 400 });

  const agentIds = await getVisibleAgentIds(session.user.id, session.user.role || "");
  const agents = agentIds.length
    ? await prisma.user.findMany({
        where: { id: { in: agentIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: { select: { name: true } },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      })
    : [];
  const [scores, history] = agentIds.length
    ? await Promise.all([
        prisma.agentScore.findMany({ where: { agentId: { in: agentIds }, period, periodStart } }),
        prisma.agentScore.findMany({
          where: { agentId: { in: agentIds } },
          include: { agent: { select: { firstName: true, lastName: true } } },
          orderBy: [{ periodStart: "desc" }, { updatedAt: "desc" }],
          take: 120,
        }),
      ])
    : [[], []];

  return NextResponse.json({
    period,
    periodStart: periodStart.toISOString().slice(0, 10),
    agents: agents.map((agent) => ({
      ...agent,
      name: `${agent.firstName} ${agent.lastName}`,
      department: agent.department?.name || "Service non renseigné",
    })),
    scores: scores.map((score) => ({ agentId: score.agentId, score: score.score, note: score.note || "" })),
    history: history.map((score) => ({
      id: score.id,
      agentId: score.agentId,
      agentName: `${score.agent.firstName} ${score.agent.lastName}`,
      period: score.period,
      periodStart: score.periodStart.toISOString().slice(0, 10),
      score: score.score,
      note: score.note || "",
      updatedAt: score.updatedAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !authorizedRole(session.user.role)) {
    return NextResponse.json({ message: "Accès réservé à l'administration et aux managers." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  }

  const agentId = typeof body.agentId === "string" ? body.agentId : "";
  const period = parsePeriod(typeof body.period === "string" ? body.period : null);
  const periodStart = period
    ? getPeriodStart(period, typeof body.date === "string" ? body.date : null)
    : null;
  const score = body.score;
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (!agentId || !period || !periodStart || !Number.isInteger(score) || Number(score) < 0 || Number(score) > 100) {
    return NextResponse.json({ message: "Choisissez un agent, une période et une note comprise entre 0 et 100 %." }, { status: 400 });
  }
  if (note.length > 500) {
    return NextResponse.json({ message: "La remarque ne peut pas dépasser 500 caractères." }, { status: 400 });
  }

  const visibleAgentIds = await getVisibleAgentIds(session.user.id, session.user.role || "");
  if (!visibleAgentIds.includes(agentId)) {
    return NextResponse.json({ message: "Cet agent n'appartient pas à votre périmètre de suivi." }, { status: 403 });
  }

  const saved = await prisma.agentScore.upsert({
    where: { agentId_period_periodStart: { agentId, period, periodStart } },
    update: { managerId: session.user.id, score: Number(score), note: note || null },
    create: { agentId, managerId: session.user.id, period, periodStart, score: Number(score), note: note || null },
  });

  return NextResponse.json({
    message: "Évaluation enregistrée.",
    score: {
      id: saved.id,
      agentId: saved.agentId,
      period: saved.period,
      periodStart: saved.periodStart.toISOString().slice(0, 10),
      score: saved.score,
      note: saved.note || "",
    },
  });
}

