import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { normalizeRegistryNumber, parseBirthDate, generateCitizenNic } from "@/lib/nic";
import { sedhiouCommunes } from "@/lib/sedhiou";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true, department: true },
  });

  if (!user) {
    return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      role: user.role?.name ?? "CITOYEN",
      department: user.department?.name ?? null,
      commune: user.commune,
      registryNumber: user.registryNumber,
      birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : "",
      nic: user.nic,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!current) {
    return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const phone = body.phone ? String(body.phone).trim() : null;
  const commune = body.commune ? String(body.commune) : current.commune;
  const registryNumber = body.registryNumber ? normalizeRegistryNumber(String(body.registryNumber)) : current.registryNumber;
  const birthDateInput = body.birthDate ? String(body.birthDate) : current.birthDate?.toISOString().slice(0, 10);
  const birthDate = birthDateInput ? parseBirthDate(birthDateInput) : current.birthDate;

  if (!firstName || !lastName) {
    return NextResponse.json({ message: "Le prénom et le nom sont requis" }, { status: 400 });
  }

  if (commune && !sedhiouCommunes.some((item) => item.name === commune)) {
    return NextResponse.json({ message: "Commune invalide pour la région de Sédhiou" }, { status: 400 });
  }

  if (!current.role && (!registryNumber || !birthDate || !commune)) {
    return NextResponse.json(
      { message: "Le registre, la date de naissance et la commune sont requis pour un citoyen" },
      { status: 400 }
    );
  }

  const nic = registryNumber && birthDateInput ? generateCitizenNic(registryNumber, birthDateInput) : current.nic;

  if (registryNumber || nic) {
    const duplicate = await prisma.user.findFirst({
      where: {
        id: { not: current.id },
        OR: [
          registryNumber ? { registryNumber } : undefined,
          nic ? { nic } : undefined,
        ].filter(Boolean) as Array<{ registryNumber?: string; nic?: string }>,
      },
    });

    if (duplicate) {
      return NextResponse.json({ message: "Ce registre ou ce NIC est déjà utilisé" }, { status: 409 });
    }
  }

  const user = await prisma.user.update({
    where: { id: current.id },
    data: {
      firstName,
      lastName,
      phone,
      commune,
      registryNumber,
      birthDate,
      nic,
    },
    include: { role: true, department: true },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      role: user.role?.name ?? "CITOYEN",
      department: user.department?.name ?? null,
      commune: user.commune,
      registryNumber: user.registryNumber,
      birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : "",
      nic: user.nic,
    },
  });
}
