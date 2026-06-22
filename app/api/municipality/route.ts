import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getProfile() {
  return prisma.municipalityProfile.upsert({
    where: { key: "default" },
    update: {},
    create: { key: "default" },
  });
}

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Accès réservé à l'admin" }, { status: 403 });
  }

  const body = await request.json();
  const profile = await prisma.municipalityProfile.upsert({
    where: { key: "default" },
    update: {
      name: body.name ? String(body.name) : undefined,
      region: body.region ? String(body.region) : undefined,
      address: body.address ? String(body.address) : undefined,
      phone: body.phone !== undefined ? String(body.phone) : undefined,
      email: body.email ? String(body.email) : undefined,
      website: body.website !== undefined ? String(body.website) : undefined,
      mayorName: body.mayorName !== undefined ? String(body.mayorName) : undefined,
      openingHours: body.openingHours ? String(body.openingHours) : undefined,
    },
    create: {
      key: "default",
      name: body.name ? String(body.name) : undefined,
      region: body.region ? String(body.region) : undefined,
      address: body.address ? String(body.address) : undefined,
      phone: body.phone ? String(body.phone) : undefined,
      email: body.email ? String(body.email) : undefined,
      website: body.website ? String(body.website) : undefined,
      mayorName: body.mayorName ? String(body.mayorName) : undefined,
      openingHours: body.openingHours ? String(body.openingHours) : undefined,
    },
  });

  return NextResponse.json({ profile });
}
