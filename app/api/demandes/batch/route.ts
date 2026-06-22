import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { notifyUser } from "@/lib/notifications";
import { renderRequestTemplate } from "@/lib/request-template";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  const body = await request.json();
  const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
  const action = String(body.action || "generate");

  if (ids.length === 0) {
    return NextResponse.json({ message: "Aucune demande sélectionnée" }, { status: 400 });
  }

  const requests = await prisma.citizenRequest.findMany({
    where: {
      id: { in: ids },
      ...(session.user.role === "AGENT" ? { assignedToId: session.user.id } : {}),
    },
    include: { requestType: true },
  });

  if (requests.length === 0) {
    return NextResponse.json({ message: "Aucune demande accessible" }, { status: 403 });
  }

  const requestTypeIds = new Set(requests.map((item) => item.requestTypeId || item.type));
  if (requestTypeIds.size > 1) {
    return NextResponse.json({ message: "Regroupez uniquement des demandes du même type" }, { status: 400 });
  }

  const createdDocuments = [];
  for (const item of requests) {
    const content = renderRequestTemplate(item.requestType?.templateData, item);
    const document = await prisma.documentRecord.create({
      data: {
        title: `Publipostage - ${item.reference}`,
        type: "Publipostage",
        category: item.type,
        content,
        requestId: item.id,
        createdById: session.user.id,
      },
    });
    createdDocuments.push(document);

    if (action === "complete") {
      await prisma.citizenRequest.update({
        where: { id: item.id },
        data: {
          status: "COMPLETED",
          signedDocumentName: `dossier-signe-${item.reference}.pdf`,
          signedDocumentContent: content,
          signedAt: new Date(),
          processedAt: new Date(),
          downloadEnabled: item.withdrawalMethod !== "COUNTER",
          events: {
            create: {
              action: "Traitement groupé",
              actorId: session.user.id,
              actorName: session.user.name || session.user.email || "Agent",
              note: "Document généré par publipostage.",
            },
          },
        },
      });
      await notifyUser({
        userId: item.citizenId,
        title: item.withdrawalMethod === "COUNTER" ? "Dossier prêt au guichet" : "Dossier disponible",
        message: `${item.reference} est terminé.`,
        type: "STATUS",
        href: "/demandes/suivi",
      });
    }
  }

  return NextResponse.json({ documents: createdDocuments, count: createdDocuments.length });
}
