import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En traitement",
  APPROVED: "Validée",
  REJECTED: "Rejetée",
  COMPLETED: "Terminée",
};

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const isStaff = Boolean(session.user.role);
  const requests = await prisma.citizenRequest.findMany({
    where: isStaff ? undefined : { citizenId: session.user.id },
    include: {
      events: { orderBy: { createdAt: "desc" } },
      assignedTo: { select: { firstName: true, lastName: true, email: true } },
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
  const reference = `DEM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  const [firstName = "", ...lastNameParts] = session.user.name.split(" ");

  const created = await prisma.citizenRequest.create({
    data: {
      reference,
      type: String(body.type || ""),
      subject: String(body.subject || ""),
      description: String(body.description || ""),
      urgency: body.urgency === "urgent" ? "URGENT" : body.urgency === "tres-urgent" ? "HIGH" : "NORMAL",
      citizenId: session.user.id,
      citizenName: session.user.name,
      citizenEmail: session.user.email,
      citizenPhone: String(body.citizenPhone || ""),
      events: {
        create: {
          action: "Dépôt de la demande",
          actorId: session.user.id,
          actorName: `${firstName} ${lastNameParts.join(" ")}`.trim() || session.user.email,
          note: "Demande enregistrée depuis l'espace citoyen.",
        },
      },
    },
  });

  return NextResponse.json({ request: created }, { status: 201 });
}
