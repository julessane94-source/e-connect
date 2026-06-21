import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const actions: Record<string, { status: "IN_PROGRESS" | "APPROVED" | "REJECTED" | "COMPLETED"; label: string }> = {
  start: { status: "IN_PROGRESS", label: "Prise en charge" },
  approve: { status: "APPROVED", label: "Validation" },
  reject: { status: "REJECTED", label: "Rejet" },
  complete: { status: "COMPLETED", label: "Clôture" },
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  const body = await request.json();
  const action = actions[String(body.action || "")];

  if (!action) {
    return NextResponse.json({ message: "Action invalide" }, { status: 400 });
  }

  const updated = await prisma.citizenRequest.update({
    where: { id: params.id },
    data: {
      status: action.status,
      assignedToId: session.user.id,
      processedAt: ["APPROVED", "REJECTED", "COMPLETED"].includes(action.status) ? new Date() : undefined,
      events: {
        create: {
          action: action.label,
          actorId: session.user.id,
          actorName: session.user.name || session.user.email || "Agent",
          note: body.note ? String(body.note) : undefined,
        },
      },
    },
  });

  return NextResponse.json({ request: updated });
}
