import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function canManageDocuments(role?: string | null) {
  return role === "ADMIN" || role === "MANAGER";
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !canManageDocuments(session.user.role)) {
    return NextResponse.json({ message: "Modification réservée à l'administration et à la coordination." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Données invalides." }, { status: 400 });
  }
  const action = String(body.action || "update");
  if (!["archive", "restore", "update"].includes(action)) {
    return NextResponse.json({ message: "Action invalide." }, { status: 400 });
  }

  const existing = await prisma.documentRecord.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ message: "Document introuvable." }, { status: 404 });
  }
  if (action === "archive" && existing.status === "ARCHIVED") {
    return NextResponse.json({ message: "Ce document est déjà archivé." }, { status: 409 });
  }
  if (action === "restore" && existing.status !== "ARCHIVED") {
    return NextResponse.json({ message: "Ce document n'est pas archivé." }, { status: 409 });
  }
  if (action === "update" && existing.status === "ARCHIVED") {
    return NextResponse.json({ message: "Restaurez le document avant de le modifier." }, { status: 409 });
  }

  const document = await prisma.documentRecord.update({
    where: { id: params.id },
    data:
      action === "archive"
        ? { status: "ARCHIVED", archivedAt: new Date() }
        : action === "restore"
          ? { status: "ACTIVE", archivedAt: null }
          : {
              title: body.title ? String(body.title) : undefined,
              type: body.type ? String(body.type) : undefined,
              category: body.category ? String(body.category) : undefined,
              content: body.content !== undefined ? String(body.content) : undefined,
            },
  });

  return NextResponse.json({ document });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !canManageDocuments(session.user.role)) {
    return NextResponse.json({ message: "Suppression réservée à l'administration et à la coordination." }, { status: 403 });
  }

  await prisma.documentRecord.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

