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

  if (
    ["markPaid", "archive"].includes(actionName) &&
    !["ADMIN", "MANAGER"].includes(session.user.role)
  ) {
    return NextResponse.json(
      { message: actionName === "markPaid"
        ? "La confirmation des paiements est réservée à l'administration et à la coordination."
        : "L'archivage est réservé à l'administration et à la coordination." },
      { status: 403 }
    );
  }

  const existing = await prisma.citizenRequest.findUnique({
    where: { id: params.id },
    include: {
      citizen: { select: { commune: true } },
      requestType: true,
    },
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

  if (
    session.user.role === "AGENT" &&
    existing.assignedToId !== session.user.id &&
    (!session.user.commune || existing.commune !== session.user.commune)
  ) {
    return NextResponse.json({ message: "Cette demande n'est pas assignée à cet agent" }, { status: 403 });
  }

  if (actionName === "transfer" && body.agentId) {
    const agent = await prisma.user.findFirst({
      where: { id: String(body.agentId), role: { name: { in: ["AGENT", "MANAGER"] } }, isActive: true },
    });

    if (!agent) {
      return NextResponse.json({ message: "Agent destinataire invalide" }, { status: 400 });
    }

    if (!agent.commune || !existing.citizen.commune || agent.commune !== existing.citizen.commune) {
      return NextResponse.json(
        { message: "Un dossier ne peut être transféré qu'à la commune du citoyen" },
        { status: 400 }
      );
    }

    const transferred = await prisma.citizenRequest.update({
      where: { id: params.id },
      data: {
        assignedToId: agent.id,
        commune: agent.commune || existing.commune,
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

    await notifyUser({
      userId: existing.citizenId,
      title: "Dossier transféré",
      message: agent.commune
        ? `${existing.reference} a été transféré à la mairie de ${agent.commune}.`
        : `${existing.reference} a été transféré à ${agent.firstName} ${agent.lastName}.`,
      type: "TRANSFER",
      href: "/demandes/suivi",
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

  if (["sign", "complete"].includes(actionName)) {
    if (existing.paymentStatus !== "PAID") {
      return NextResponse.json(
        { message: "Confirmez le paiement avant de traiter et signer le document." },
        { status: 409 }
      );
    }

    const municipality = await prisma.municipalityProfile.findUnique({
      where: { key: "default" },
      select: { mayorSignatureData: true },
    });
    const mayorSignatureData = municipality?.mayorSignatureData;
    if (!mayorSignatureData || !/^data:image\/(png|jpeg);base64,/.test(mayorSignatureData)) {
      return NextResponse.json(
        { message: "La signature électronique du maire doit être ajoutée dans les paramètres de la mairie avant le traitement." },
        { status: 409 }
      );
    }

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
        signedSignatureData: mayorSignatureData,
        downloadEnabled: downloadable,
        events: {
          create: {
            action: "Dossier traité et signé",
            actorId: session.user.id,
            actorName: session.user.name || session.user.email || "Agent",
            note: downloadable ? "Paiement confirmé. Le dossier signé peut être téléchargé." : "Paiement confirmé. Le dossier signé est prêt pour retrait au guichet.",
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
      message: `${existing.reference} a été traité et signé.`,
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

  const shouldPublishCompletedDocument = action.status === "COMPLETED";
  const completedDocumentContent = shouldPublishCompletedDocument
    ? existing.signedDocumentContent || renderRequestTemplate(existing.requestType?.templateData, existing)
    : undefined;
  const completedDocumentName = shouldPublishCompletedDocument
    ? existing.signedDocumentName || `dossier-signe-${existing.reference}.pdf`
    : undefined;
  const downloadableCompletedDocument = shouldPublishCompletedDocument
    ? existing.withdrawalMethod !== "COUNTER"
    : undefined;

  const updated = await prisma.citizenRequest.update({
    where: { id: params.id },
    data: {
      status: action.status,
      assignedToId: existing.assignedToId || session.user.id,
      processedAt: ["APPROVED", "REJECTED", "COMPLETED"].includes(action.status) ? new Date() : undefined,
      signedAt: shouldPublishCompletedDocument ? existing.signedAt || new Date() : undefined,
      signedDocumentName: completedDocumentName,
      signedDocumentContent: completedDocumentContent,
      downloadEnabled: downloadableCompletedDocument,
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

  if (shouldPublishCompletedDocument && completedDocumentContent && !existing.signedDocumentContent) {
    await prisma.documentRecord.create({
      data: {
        title: completedDocumentName || `dossier-signe-${existing.reference}.pdf`,
        type: "Dossier signé",
        category: existing.type,
        content: completedDocumentContent,
        requestId: existing.id,
        createdById: session.user.id,
      },
    });
  }

  await notifyUser({
    userId: existing.citizenId,
    title: "Statut mis à jour",
    message: `${existing.reference} : ${action.label}.`,
    type: "STATUS",
    href: "/demandes/suivi",
  });

  return NextResponse.json({ request: updated });
}
