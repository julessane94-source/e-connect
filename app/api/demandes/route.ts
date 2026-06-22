import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sedhiouCommunes } from "@/lib/sedhiou";

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

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const isStaff = Boolean(session.user.role);
  const where = !isStaff
    ? { citizenId: session.user.id }
    : session.user.role === "ADMIN" || session.user.role === "MANAGER"
      ? undefined
      : { assignedToId: session.user.id };
  const requests = await prisma.citizenRequest.findMany({
    where,
    include: {
      events: { orderBy: { createdAt: "desc" } },
      assignedTo: { select: { firstName: true, lastName: true, email: true } },
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
    requests: requests.map((request) => ({
      ...request,
      statusLabel: statusLabels[request.status] ?? request.status,
      paymentLabel: paymentLabels[request.paymentMethod] ?? request.paymentMethod,
      withdrawalLabel: withdrawalLabels[request.withdrawalMethod] ?? request.withdrawalMethod,
    })),
    stats,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email || !session.user.name) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const subject = String(body.subject || "").trim();
  const description = String(body.description || "").trim();

  if (!subject || !description) {
    return NextResponse.json({ message: "Le sujet et la description sont requis" }, { status: 400 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!currentUser) {
    return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  }

  const isStaff = Boolean(currentUser.role);
  const requestedCommune = body.commune ? String(body.commune) : "";
  const effectiveCommune = isStaff ? requestedCommune : currentUser.commune || requestedCommune;

  if (!effectiveCommune || !sedhiouCommunes.some((commune) => commune.name === effectiveCommune)) {
    return NextResponse.json({ message: "La commune de Sédhiou est requise" }, { status: 400 });
  }

  if (!isStaff && currentUser.commune && requestedCommune && requestedCommune !== currentUser.commune) {
    return NextResponse.json(
      { message: "Votre compte ne peut déposer des demandes que pour votre commune" },
      { status: 403 }
    );
  }

  const reference = `DEM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  const [firstName = "", ...lastNameParts] = session.user.name.split(" ");
  const requestType = body.requestTypeId
    ? await prisma.requestType.findFirst({ where: { id: String(body.requestTypeId), isActive: true } })
    : null;
  const fallbackType = String(body.type || "").trim();

  if (!requestType && !fallbackType) {
    return NextResponse.json({ message: "Le type de demande est requis" }, { status: 400 });
  }

  const attachmentSize = Number(body.attachmentSize);
  if (Number.isFinite(attachmentSize) && attachmentSize > 5 * 1024 * 1024) {
    return NextResponse.json({ message: "La pièce jointe ne doit pas dépasser 5 Mo" }, { status: 400 });
  }

  const paymentMethod = String(body.paymentMethod) === "COUNTER" ? "COUNTER" : "REMOTE";
  const withdrawalMethod = String(body.withdrawalMethod) === "COUNTER" ? "COUNTER" : "DOWNLOAD";

  const created = await prisma.citizenRequest.create({
    data: {
      reference,
      type: requestType?.name ?? fallbackType,
      requestTypeId: requestType?.id,
      subject,
      description,
      urgency: body.urgency === "urgent" ? "URGENT" : body.urgency === "tres-urgent" ? "HIGH" : "NORMAL",
      citizenId: currentUser.id,
      citizenName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      citizenEmail: currentUser.email,
      citizenPhone: currentUser.phone || String(body.citizenPhone || ""),
      commune: effectiveCommune,
      price: requestType?.price ?? 0,
      paymentMethod,
      paymentStatus: requestType?.price ? "PENDING" : "PAID",
      withdrawalMethod,
      attachmentName: body.attachmentName ? String(body.attachmentName) : undefined,
      attachmentMimeType: body.attachmentMimeType ? String(body.attachmentMimeType) : undefined,
      attachmentSize: Number.isFinite(attachmentSize) ? attachmentSize : undefined,
      attachmentData: body.attachmentData ? String(body.attachmentData) : undefined,
      events: {
        create: {
          action: "Dépôt de la demande",
          actorId: currentUser.id,
          actorName: `${firstName} ${lastNameParts.join(" ")}`.trim() || currentUser.email,
          note: `${paymentLabels[paymentMethod]} ; ${withdrawalLabels[withdrawalMethod]}.`,
        },
      },
    },
  });

  return NextResponse.json({ request: created }, { status: 201 });
}
