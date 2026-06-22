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
  const hasTemplatePayload =
    body.templateName !== undefined ||
    body.templateMimeType !== undefined ||
    body.templateSize !== undefined ||
    body.templateData !== undefined;

  if (!isAdmin && !hasTemplatePayload) {
    return NextResponse.json({ message: "Seul l'admin peut modifier les tarifs et libellés" }, { status: 403 });
  }

  const type = await prisma.requestType.update({
    where: { id: String(body.id) },
    data: {
      ...(isAdmin
        ? {
            name: body.name ? String(body.name) : undefined,
            category: body.category ? String(body.category) : undefined,
            price: Number.isFinite(Number(body.price)) ? Number(body.price) : undefined,
            isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
          }
        : {}),
      ...(hasTemplatePayload
        ? {
            templateName: body.templateName ? String(body.templateName) : null,
            templateMimeType: body.templateMimeType ? String(body.templateMimeType) : null,
            templateSize: Number.isFinite(Number(body.templateSize)) ? Number(body.templateSize) : null,
            templateData: body.templateData ? String(body.templateData) : null,
          }
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
