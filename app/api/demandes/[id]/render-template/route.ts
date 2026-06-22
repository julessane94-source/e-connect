import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { renderRequestTemplate } from "@/lib/request-template";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  const citizenRequest = await prisma.citizenRequest.findUnique({
    where: { id: params.id },
    include: { requestType: true },
  });

  if (!citizenRequest) {
    return NextResponse.json({ message: "Demande introuvable" }, { status: 404 });
  }

  if (session.user.role === "AGENT" && citizenRequest.assignedToId !== session.user.id) {
    return NextResponse.json({ message: "Cette demande n'est pas assignée à cet agent" }, { status: 403 });
  }

  return NextResponse.json({
    content: renderRequestTemplate(citizenRequest.requestType?.templateData, citizenRequest),
    templateName: citizenRequest.requestType?.templateName || "Modèle standard",
  });
}
