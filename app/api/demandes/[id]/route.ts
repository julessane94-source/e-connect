import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { notifyUser } from "@/lib/notifications";
import { renderRequestTemplate } from "@/lib/request-template";

export const dynamic = "force-dynamic";

const actions: Record<string, { status?: "IN_PROGRESS" | "APPROVED" | "REJECTED" | "COMPLETED"; label: string }> = {
  start: { status: "IN_PROGRESS", label: "Prise en charge" },
  approve: { status: "APPROVED", label: "Validation" },
  reject: { status: "REJECTED", label: "Rejet" },
  complete: { status: "COMPLETED", label: "Clôture" },
  assign: { label: "Assignation" },
  transfer: { label: "Transfert de dossier" },
  markPaid: { label: "Paiement confirmé" },
  sign: { status: "COMPLETED", label: "Dossier signé disponible" },
  archive: { label: "Archivage du dossier" },
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
  const actionName = String(body.action || "");
  const action = actions[actionName];

  if (!action) {
    return NextResponse.json({ message: "Action invalide" }, { status: 400 });
  }

  const existing = await prisma.citizenRequest.findUnique({
    where: { id: params.id },
    include: { requestType: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Demande introuvable" }, { status: 404 });
  }

  if (actionName === "assign" && body.agentId) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Assignation réservée à l'admin" }, { status: 403 });
    }

    const agent = await prisma.user.findFirst({
      where: { id: String(body.agentId), role: { name: { in: ["AGENT", "MANAGER"] } }, isActive: true },
    });

    if (!agent) {
      return NextResponse.json({ message: "Agent invalide" }, { status: 400 });
    }

    const assigned = await prisma.citizenRequest.update({
      where: { id: params.id },
      data: {
        assignedToId: agent.id,
        events: {
          create: {
            action: "Assignation à un agent",
            actorId: session.user.id,
            actorName: session.user.name || session.user.email || "Admin",
            note: body.note ? String(body.note) : `Assigné à ${agent.firstName} ${agent.lastName}`,
          },
        },
      },
    });
    await notifyUser({
      userId: agent.id,
      title: "Demande assignée",
      message: `${existing.reference} vous a été assignée.`,
      type: "ASSIGNMENT",
      href: "/demandes",
    });
    return NextResponse.json({ request: assigned });
  }

  if (session.user.role === "AGENT" && existing.assignedToId !== session.user.id) {
    return NextResponse.json({ message: "Cette demande n'est pas assignée à cet agent" }, { status: 403 });
  }

  if (actionName === "transfer" && body.agentId) {
    const agent = await prisma.user.findFirst({
      where: { id: String(body.agentId), role: { name: { in: ["AGENT", "MANAGER"] } }, isActive: true },
    });

    if (!agent) {
      return NextResponse.json({ message: "Agent destinataire invalide" }, { status: 400 });
    }

    const transferred = await prisma.citizenRequest.update({
      where: { id: params.id },
      data: {
        assignedToId: agent.id,
        status: existing.status === "PENDING" ? "IN_PROGRESS" : existing.status,
        events: {
          create: {
            action: "Transfert de dossier",
            actorId: session.user.id,
            actorName: session.user.name || session.user.email || "Agent",
            note: body.note ? String(body.note) : `Transféré à ${agent.firstName} ${agent.lastName}`,
          },
        },
      },
    });

    await notifyUser({
      userId: agent.id,
      title: "Dossier transféré",
      message: `${existing.reference} vous a été transféré.`,
      type: "TRANSFER",
      href: "/demandes",
    });

    return NextResponse.json({ request: transferred });
  }

  if (actionName === "markPaid") {
    const paid = await prisma.citizenRequest.update({
      where: { id: params.id },
      data: {
        paymentStatus: "PAID",
        events: {
          create: {
            action: "Paiement confirmé",
            actorId: session.user.id,
            actorName: session.user.name || session.user.email || "Agent",
            note: existing.paymentMethod === "COUNTER" ? "Paiement reçu au guichet." : "Paiement à distance confirmé.",
          },
        },
      },
    });
    await notifyUser({
      userId: existing.citizenId,
      title: "Paiement confirmé",
      message: `Paiement confirmé pour ${existing.reference}.`,
      type: "PAYMENT",
      href: "/demandes/suivi",
    });
    return NextResponse.json({ request: paid });
  }

  if (actionName === "sign") {
    const signedContent = String(body.signedDocumentContent || renderRequestTemplate(existing.requestType?.templateData, existing));
    const signedName = body.signedDocumentName ? String(body.signedDocumentName) : `dossier-signe-${existing.reference}.pdf`;
    const downloadable = existing.withdrawalMethod !== "COUNTER";

    const signed = await prisma.citizenRequest.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        assignedToId: existing.assignedToId || session.user.id,
        processedAt: new Date(),
        signedAt: new Date(),
        signedDocumentName: signedName,
        signedDocumentContent: signedContent,
        downloadEnabled: downloadable,
        events: {
          create: {
            action: "Dossier signé",
            actorId: session.user.id,
            actorName: session.user.name || session.user.email || "Agent",
            note: downloadable ? "Le citoyen peut télécharger son dossier signé." : "Le dossier signé est prêt pour retrait au guichet.",
          },
        },
      },
    });

    await prisma.documentRecord.create({
      data: {
        title: signedName,
        type: "Dossier signé",
        category: existing.type,
        content: signedContent,
        requestId: existing.id,
        createdById: session.user.id,
      },
    });
    await notifyUser({
      userId: existing.citizenId,
      title: downloadable ? "Dossier disponible" : "Dossier prêt au guichet",
      message: `${existing.reference} est terminé.`,
      type: "STATUS",
      href: "/demandes/suivi",
    });

    return NextResponse.json({ request: signed });
  }

  if (actionName === "archive") {
    await prisma.documentRecord.updateMany({
      where: { requestId: params.id },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    });

    const archived = await prisma.citizenRequest.update({
      where: { id: params.id },
      data: {
        events: {
          create: {
            action: "Archivage du dossier",
            actorId: session.user.id,
            actorName: session.user.name || session.user.email || "Agent",
            note: "Les documents liés à la demande ont été archivés.",
          },
        },
      },
    });

    return NextResponse.json({ request: archived });
  }

  if (!action.status) {
    return NextResponse.json({ message: "Action incomplète" }, { status: 400 });
  }

  const updated = await prisma.citizenRequest.update({
    where: { id: params.id },
    data: {
      status: action.status,
      assignedToId: existing.assignedToId || session.user.id,
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

  await notifyUser({
    userId: existing.citizenId,
    title: "Statut mis à jour",
    message: `${existing.reference} : ${action.label}.`,
    type: "STATUS",
    href: "/demandes/suivi",
  });

  return NextResponse.json({ request: updated });
}
