import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const actions: Record<string, { status?: "IN_PROGRESS" | "APPROVED" | "REJECTED" | "COMPLETED"; label: string }> = {
  start: { status: "IN_PROGRESS", label: "Prise en charge" },
  approve: { status: "APPROVED", label: "Validation" },
  reject: { status: "REJECTED", label: "Rejet" },
  complete: { status: "COMPLETED", label: "Clôture" },
  assign: { label: "Assignation" },
  sign: { status: "COMPLETED", label: "Dossier signé disponible" },
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

  if (String(body.action) === "assign" && body.agentId) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Assignation réservée à l'admin" }, { status: 403 });
    }

    const assigned = await prisma.citizenRequest.update({
      where: { id: params.id },
      data: {
        assignedToId: String(body.agentId),
        events: {
          create: {
            action: "Assignation à un agent",
            actorId: session.user.id,
            actorName: session.user.name || session.user.email || "Admin",
            note: body.note ? String(body.note) : undefined,
          },
        },
      },
    });
    return NextResponse.json({ request: assigned });
  }

  if (String(body.action) === "sign") {
    const existing = await prisma.citizenRequest.findUnique({ where: { id: params.id } });
    const signedContent = String(
      body.signedDocumentContent ||
        `Dossier signé\n\nRéférence : ${existing?.reference}\nDemande : ${existing?.subject}\nCitoyen : ${existing?.citizenName}\nCommune : ${existing?.commune || "-"}\n\nValidé par ${session.user.name || session.user.email}.`
    );

    const signed = await prisma.citizenRequest.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        assignedToId: session.user.id,
        processedAt: new Date(),
        signedAt: new Date(),
        signedDocumentName: body.signedDocumentName ? String(body.signedDocumentName) : `dossier-signe-${existing?.reference}.pdf`,
        signedDocumentContent: signedContent,
        downloadEnabled: true,
        events: {
          create: {
            action: "Dossier signé rendu disponible",
            actorId: session.user.id,
            actorName: session.user.name || session.user.email || "Agent",
            note: "Le citoyen peut maintenant télécharger son dossier signé.",
          },
        },
      },
    });

    return NextResponse.json({ request: signed });
  }

  if (!action.status) {
    return NextResponse.json({ message: "Action incomplète" }, { status: 400 });
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
