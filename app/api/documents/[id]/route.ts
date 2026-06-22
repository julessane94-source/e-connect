import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  const body = await request.json();
  const action = String(body.action || "update");

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
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  await prisma.documentRecord.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
