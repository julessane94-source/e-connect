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

  const [requests, users, documents] = await Promise.all([
    prisma.citizenRequest.findMany({
      include: { assignedTo: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ include: { role: true, department: true }, orderBy: { createdAt: "desc" } }),
    prisma.documentRecord.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  const summary = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((item) => item.status === "PENDING").length,
    inProgressRequests: requests.filter((item) => item.status === "IN_PROGRESS").length,
    completedRequests: requests.filter((item) => ["APPROVED", "COMPLETED"].includes(item.status)).length,
    rejectedRequests: requests.filter((item) => item.status === "REJECTED").length,
    totalUsers: users.length,
    citizens: users.filter((item) => !item.role).length,
    agents: users.filter((item) => item.role).length,
    activeDocuments: documents.filter((item) => item.status === "ACTIVE").length,
    archivedDocuments: documents.filter((item) => item.status === "ARCHIVED").length,
  };

  if (format !== "csv") {
    return NextResponse.json({ summary, requests, users, documents });
  }

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
    },
  });
}
