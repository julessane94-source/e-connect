import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { notifyUser } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  const [agents, messages, requests] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        isActive: true,
        role: { name: { in: ["ADMIN", "MANAGER", "AGENT"] } },
      },
      include: { role: true, department: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
    prisma.agentMessage.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { recipientId: session.user.id }],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        recipient: { select: { id: true, firstName: true, lastName: true, email: true } },
        request: { select: { id: true, reference: true, subject: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    }),
    prisma.citizenRequest.findMany({
      where: session.user.role === "AGENT" ? { assignedToId: session.user.id } : undefined,
      select: { id: true, reference: true, subject: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({
    agents: agents.map((agent) => ({
      id: agent.id,
      name: `${agent.firstName} ${agent.lastName}`.trim(),
      email: agent.email,
      role: agent.role?.name || "AGENT",
      department: agent.department?.name || "-",
    })),
    messages,
    requests,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  const body = await request.json();
  const recipientId = String(body.recipientId || "");
  const message = String(body.message || "").trim();
  const requestId = body.requestId ? String(body.requestId) : undefined;
  const fileName = body.fileName ? String(body.fileName) : undefined;
  const mimeType = body.mimeType ? String(body.mimeType) : undefined;
  const fileData = body.fileData ? String(body.fileData) : undefined;

  if (!recipientId || (!message && !fileData)) {
    return NextResponse.json({ message: "Destinataire et message ou document requis" }, { status: 400 });
  }

  const recipient = await prisma.user.findFirst({
    where: { id: recipientId, isActive: true, role: { name: { in: ["ADMIN", "MANAGER", "AGENT"] } } },
  });

  if (!recipient) {
    return NextResponse.json({ message: "Destinataire invalide" }, { status: 400 });
  }

  const created = await prisma.agentMessage.create({
    data: {
      senderId: session.user.id,
      recipientId,
      message: message || "Document partagé",
      requestId,
      fileName,
      mimeType,
      fileData,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, email: true } },
      recipient: { select: { id: true, firstName: true, lastName: true, email: true } },
      request: { select: { id: true, reference: true, subject: true } },
    },
  });

  await notifyUser({
    userId: recipientId,
    title: "Nouveau message agent",
    message: `${session.user.name || session.user.email} vous a envoyé un message.`,
    type: "MESSAGE",
    href: "/messagerie",
  });

  return NextResponse.json({ message: created }, { status: 201 });
}
