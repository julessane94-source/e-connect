import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sedhiouCommunes } from "@/lib/sedhiou";
import { notifyStaff } from "@/lib/notifications";
import { buildExtractedInfo, extractAttachmentText } from "@/lib/request-template";
import type { Prisma } from "@prisma/client";

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En traitement",
  APPROVED: "Validée",
  REJECTED: "Rejetée",
  COMPLETED: "Terminée",
};

const paymentLabels: Record<string, string> = {
  REMOTE: "Paiement à distance",
  COUNTER: "Paiement au guichet",
};

const withdrawalLabels: Record<string, string> = {
  DOWNLOAD: "Téléchargement",
  COUNTER: "Retrait au guichet",
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const isStaff = Boolean(session.user.role);
  const isCoordination = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  const archiveView = isCoordination && new URL(request.url).searchParams.get("archived") === "true";
  const accessWhere: Prisma.CitizenRequestWhereInput = !isStaff
    ? { citizenId: session.user.id }
    : isCoordination
      ? {}
      : session.user.commune
        ? {
            OR: [
              { assignedToId: session.user.id },
              { commune: session.user.commune },
            ],
          }
        : { assignedToId: session.user.id };
  const where: Prisma.CitizenRequestWhereInput = {
    ...accessWhere,
    archivedAt: archiveView ? { not: null } : null,
  };
  const requests = await prisma.citizenRequest.findMany({
    where,
    include: {
      events: { orderBy: { createdAt: "desc" } },
      assignedTo: { select: { firstName: true, lastName: true, email: true } },
      citizen: { select: { commune: true } },
      requestType: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((request) => request.status === "PENDING").length,
    inProgress: requests.filter((request) => request.status === "IN_PROGRESS").length,
    approved: requests.filter((request) => request.status === "APPROVED").length,
    rejected: requests.filter((request) => request.status === "REJECTED").length,
    completed: requests.filter((request) => request.status === "COMPLETED").length,
  };

  return NextResponse.json({
    requests: requests.map(({ citizen, ...request }) => {
      const canViewSignedDocument =
        request.status === "COMPLETED" &&
        request.paymentStatus === "PAID" &&
        request.downloadEnabled;
      return {
        ...request,
        signedDocumentName: canViewSignedDocument ? request.signedDocumentName : null,
        signedDocumentContent: canViewSignedDocument ? request.signedDocumentContent : null,
        signedSignatureData: canViewSignedDocument ? request.signedSignatureData : null,
        downloadEnabled: canViewSignedDocument,
        citizenCommune: citizen.commune,
        statusLabel: statusLabels[request.status] ?? request.status,
        paymentLabel: paymentLabels[request.paymentMethod] ?? request.paymentMethod,
        withdrawalLabel: withdrawalLabels[request.withdrawalMethod] ?? request.withdrawalMethod,
      };
    }),
    stats,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email || !session.user.name) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 8 * 1024 * 1024) {
    return NextResponse.json({ message: "La demande ou sa pièce jointe dépasse la taille autorisée (5 Mo)." }, { status: 413 });
  }

  const body = await request.json();
  const subject = String(body.subject || "").trim();
  const description = String(body.description || "").trim();

  if (!subject || !description || subject.length > 200 || description.length > 5000) {
    return NextResponse.json({ message: "Le sujet (200 caractères maximum) et une description (5 000 caractères maximum) sont requis." }, { status: 400 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!currentUser) {
    return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  }

  const requestedCommune = body.commune ? String(body.commune) : "";
  const effectiveCommune = requestedCommune || currentUser.commune || "";

  if (!effectiveCommune || !sedhiouCommunes.some((commune) => commune.name === effectiveCommune)) {
    return NextResponse.json({ message: "La commune de Sédhiou est requise" }, { status: 400 });
  }

  const reference = `DEM-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const [firstName = "", ...lastNameParts] = session.user.name.split(" ");
  const requestType = body.requestTypeId
    ? await prisma.requestType.findFirst({ where: { id: String(body.requestTypeId), isActive: true } })
    : null;
  if (!requestType) {
    return NextResponse.json({ message: "Choisissez un type de demande actif dans la liste des services." }, { status: 400 });
  }

  const attachmentSize = Number(body.attachmentSize);
  const attachmentData = body.attachmentData ? String(body.attachmentData) : undefined;
  const attachmentName = body.attachmentName ? String(body.attachmentName).trim() : undefined;
  const attachmentMimeType = body.attachmentMimeType ? String(body.attachmentMimeType).slice(0, 120) : undefined;
  if (
    (attachmentData && attachmentData.length > 7 * 1024 * 1024) ||
    (attachmentSize && (!Number.isInteger(attachmentSize) || attachmentSize < 0 || attachmentSize > 5 * 1024 * 1024)) ||
    (attachmentData && !attachmentSize) ||
    (attachmentName && attachmentName.length > 255)
  ) {
    return NextResponse.json({ message: "La pièce jointe doit être valide et ne pas dépasser 5 Mo." }, { status: 413 });
  }

  const paymentMethod = String(body.paymentMethod) === "COUNTER" ? "COUNTER" : "REMOTE";
  const withdrawalMethod = String(body.withdrawalMethod) === "COUNTER" ? "COUNTER" : "DOWNLOAD";
  const depositNote = currentUser.commune && currentUser.commune !== effectiveCommune
    ? `${paymentLabels[paymentMethod]} ; ${withdrawalLabels[withdrawalMethod]}. Commune du citoyen : ${currentUser.commune}.`
    : `${paymentLabels[paymentMethod]} ; ${withdrawalLabels[withdrawalMethod]}.`;
  const attachmentExtractedText = extractAttachmentText(attachmentData, attachmentMimeType, attachmentName);
  const extractedInfo = buildExtractedInfo(attachmentExtractedText);

  const created = await prisma.citizenRequest.create({
    data: {
      reference,
      type: requestType.name,
      requestTypeId: requestType.id,
      subject,
      description,
      urgency: body.urgency === "urgent" ? "URGENT" : body.urgency === "tres-urgent" ? "HIGH" : "NORMAL",
      citizenId: currentUser.id,
      citizenName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      citizenEmail: currentUser.email,
      citizenPhone: currentUser.phone || String(body.citizenPhone || ""),
      commune: effectiveCommune,
      price: requestType.price,
      paymentMethod,
      paymentStatus: requestType.price ? "PENDING" : "PAID",
      withdrawalMethod,
      attachmentName,
      attachmentMimeType,
      attachmentSize: attachmentData && Number.isFinite(attachmentSize) ? attachmentSize : undefined,
      attachmentData,
      attachmentExtractedText: attachmentExtractedText || undefined,
      extractedInfo: extractedInfo || undefined,
      events: {
        create: {
          action: "Dépôt de la demande",
          actorId: currentUser.id,
          actorName: `${firstName} ${lastNameParts.join(" ")}`.trim() || currentUser.email,
          note: depositNote,
        },
      },
    },
  });

  await notifyStaff({
    title: "Nouvelle demande",
    message: `${created.reference} - ${created.subject}`,
    type: "REQUEST",
    href: "/demandes",
  });

  return NextResponse.json({ request: created }, { status: 201 });
}

