import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  const isCoordination = ["ADMIN", "MANAGER"].includes(session.user.role);
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const status = url.searchParams.get("status") === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";
  const category = url.searchParams.get("category") || "all";
  const requestId = isCoordination ? url.searchParams.get("requestId") || "" : "";
  const where: Prisma.DocumentRecordWhereInput = {
    status,
    ...(isCoordination ? {} : { requestId: null }),
    ...(requestId ? { requestId } : {}),
    ...(category !== "all" ? { category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { type: { contains: q, mode: "insensitive" } },
            { fileName: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const documents = await prisma.documentRecord.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  const [total, active, archived] = await Promise.all([
    prisma.documentRecord.count({ where: isCoordination ? {} : { requestId: null } }),
    prisma.documentRecord.count({ where: { ...(!isCoordination ? { requestId: null } : {}), status: "ACTIVE" } }),
    prisma.documentRecord.count({ where: { ...(!isCoordination ? { requestId: null } : {}), status: "ARCHIVED" } }),
  ]);

  return NextResponse.json({
    documents,
    stats: {
      total,
      active,
      archived,
      recent: documents.filter((document) => Date.now() - new Date(document.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7).length,
    },
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role || "")) {
    return NextResponse.json({ message: "Création réservée à l'administration et à la coordination." }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title || body.fileName || "Document").trim();
  const type = String(body.type || "Document").trim();
  const category = String(body.category || "Général").trim();

  if (!title) {
    return NextResponse.json({ message: "Titre requis" }, { status: 400 });
  }

  const document = await prisma.documentRecord.create({
    data: {
      title,
      type,
      category,
      content: body.content ? String(body.content) : undefined,
      fileName: body.fileName ? String(body.fileName) : undefined,
      mimeType: body.mimeType ? String(body.mimeType) : undefined,
      size: Number.isFinite(Number(body.size)) ? Number(body.size) : undefined,
      requestId: body.requestId ? String(body.requestId) : undefined,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
