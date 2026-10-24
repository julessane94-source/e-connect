import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { defaultRequestTypes } from "@/lib/request-types";

export const dynamic = "force-dynamic";

async function ensureDefaultTypes() {
  const count = await prisma.requestType.count();
  if (count > 0) return;

  for (const type of defaultRequestTypes) {
    await prisma.requestType.upsert({
      where: { code: type.code },
      update: type,
      create: type,
    });
  }
}

export async function GET() {
  await ensureDefaultTypes();
  const types = await prisma.requestType.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ types });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  const body = await request.json();
  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin) {
    return NextResponse.json({ message: "Seul l’admin peut configurer les modèles et pièces à fournir" }, { status: 403 });
  }
  const hasTemplatePayload =
    body.templateName !== undefined ||
    body.templateMimeType !== undefined ||
    body.templateSize !== undefined ||
    body.templateData !== undefined;
  const hasRequirements = body.requiredDocuments !== undefined;
  const templateName = body.templateName ? String(body.templateName).trim() : null;
  const templateSize = Number(body.templateSize);
  const templateData = body.templateData ? String(body.templateData) : null;

  if (templateName && !/\.docx$/i.test(templateName)) {
    return NextResponse.json({ message: "Le modèle doit être un fichier Word .docx pour préserver sa mise en page" }, { status: 400 });
  }
  if (Number.isFinite(templateSize) && templateSize > 2 * 1024 * 1024) {
    return NextResponse.json({ message: "Le modèle Word ne doit pas dépasser 2 Mo" }, { status: 400 });
  }
  if (templateData && templateData.length > 2800000) {
    return NextResponse.json({ message: "Le modèle Word dépasse la taille autorisée" }, { status: 413 });
  }

  const type = await prisma.requestType.update({
    where: { id: String(body.id) },
    data: {
      name: body.name ? String(body.name) : undefined,
      category: body.category ? String(body.category) : undefined,
      price: Number.isFinite(Number(body.price)) ? Number(body.price) : undefined,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
      ...(hasTemplatePayload
        ? {
            templateName,
            templateMimeType: body.templateMimeType ? String(body.templateMimeType) : null,
            templateSize: Number.isFinite(templateSize) ? templateSize : null,
            templateData,
          }
        : {}),
      ...(hasRequirements
        ? { requiredDocuments: String(body.requiredDocuments || "").slice(0, 5000) }
        : {}),
    },
  });

  return NextResponse.json({ type });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Accès réservé à l'admin" }, { status: 403 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const category = String(body.category || "Administration").trim();
  const price = Number.isFinite(Number(body.price)) ? Number(body.price) : 0;

  if (!name) {
    return NextResponse.json({ message: "Libellé requis" }, { status: 400 });
  }

  const codeBase = String(body.code || name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  const code = `${codeBase || "DEMANDE"}_${Date.now().toString().slice(-5)}`;

  const type = await prisma.requestType.create({
    data: {
      code,
      name,
      category,
      price,
      isActive: true,
    },
  });

  return NextResponse.json({ type }, { status: 201 });
}
