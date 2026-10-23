import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "json";
  const dataset = url.searchParams.get("dataset") || "summary";
  const canExportSensitiveData = ["ADMIN", "MANAGER"].includes(session.user.role);

  if (format === "csv" && !canExportSensitiveData) {
    return NextResponse.json(
      { message: "L'export nominatif est réservé à l'administration et à la coordination." },
      { status: 403 }
    );
  }

  const [
    totalRequests,
    pendingRequests,
    inProgressRequests,
    completedRequests,
    rejectedRequests,
    totalUsers,
    citizens,
    agents,
    activeDocuments,
    archivedDocuments,
  ] = await Promise.all([
    prisma.citizenRequest.count(),
    prisma.citizenRequest.count({ where: { status: "PENDING" } }),
    prisma.citizenRequest.count({ where: { status: "IN_PROGRESS" } }),
    prisma.citizenRequest.count({ where: { status: { in: ["APPROVED", "COMPLETED"] } } }),
    prisma.citizenRequest.count({ where: { status: "REJECTED" } }),
    prisma.user.count(),
    prisma.user.count({ where: { roleId: null } }),
    prisma.user.count({ where: { roleId: { not: null } } }),
    prisma.documentRecord.count({ where: { status: "ACTIVE" } }),
    prisma.documentRecord.count({ where: { status: "ARCHIVED" } }),
  ]);

  const summary = {
    totalRequests,
    pendingRequests,
    inProgressRequests,
    completedRequests,
    rejectedRequests,
    totalUsers,
    citizens,
    agents,
    activeDocuments,
    archivedDocuments,
  };

  if (format !== "csv") {
    return NextResponse.json({ summary });
  }

  if (!["requests", "users", "documents"].includes(dataset)) {
    return NextResponse.json({ message: "Type d'export invalide" }, { status: 400 });
  }

  const [requests, users, documents] = await Promise.all([
    dataset === "requests"
      ? prisma.citizenRequest.findMany({
          include: { assignedTo: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    dataset === "users"
      ? prisma.user.findMany({ include: { role: true, department: true }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    dataset === "documents"
      ? prisma.documentRecord.findMany({ orderBy: { updatedAt: "desc" } })
      : Promise.resolve([]),
  ]);

  const rows =
    dataset === "users"
      ? [
          ["Nom", "Email", "Téléphone", "Rôle", "Service", "Commune", "Statut", "Créé le"],
          ...users.map((user) => [
            `${user.firstName} ${user.lastName}`,
            user.email,
            user.phone || "",
            user.role?.name || "CITOYEN",
            user.department?.name || "",
            user.commune || "",
            user.status,
            user.createdAt.toISOString(),
          ]),
        ]
      : dataset === "documents"
        ? [
            ["Titre", "Type", "Catégorie", "Statut", "Fichier", "Créé le", "Mis à jour"],
            ...documents.map((document) => [
              document.title,
              document.type,
              document.category,
              document.status,
              document.fileName || "",
              document.createdAt.toISOString(),
              document.updatedAt.toISOString(),
            ]),
          ]
        : [
            ["Référence", "Type", "Objet", "Citoyen", "Commune", "Prix", "Paiement", "Retrait", "Statut", "Agent", "Créé le"],
            ...requests.map((item) => [
              item.reference,
              item.type,
              item.subject,
              item.citizenName,
              item.commune || "",
              item.price,
              item.paymentMethod,
              item.withdrawalMethod,
              item.status,
              item.assignedTo ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}` : "",
              item.createdAt.toISOString(),
            ]),
          ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const filename = `agent-connect-${dataset}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
