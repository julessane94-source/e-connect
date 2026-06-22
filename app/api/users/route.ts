import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateCitizenNic, normalizeRegistryNumber, parseBirthDate } from "@/lib/nic";
import { sedhiouCommunes } from "@/lib/sedhiou";

export const dynamic = "force-dynamic";

const allowedRoles = ["ADMIN", "MANAGER", "AGENT", "CITOYEN"] as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) {
    return NextResponse.json({ message: "Accès réservé aux agents" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: { role: true, department: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      role: user.role?.name ?? "CITOYEN",
      department: user.department?.name ?? "-",
      commune: user.commune,
      registryNumber: user.registryNumber,
      nic: user.nic,
      birthDate: user.birthDate,
      status: user.status,
      isActive: user.isActive,
      createdAt: user.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Création réservée à l'admin" }, { status: 403 });
  }

  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const phone = body.phone ? String(body.phone).trim() : undefined;
  const requestedRole = String(body.role || "AGENT").toUpperCase();
  const roleName = allowedRoles.includes(requestedRole as typeof allowedRoles[number])
    ? requestedRole
    : "AGENT";

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ message: "Nom, prénom, email et mot de passe sont requis" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ message: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ message: "Un utilisateur existe déjà avec cet email" }, { status: 409 });
  }

  const isCitizen = roleName === "CITOYEN";
  const commune = body.commune ? String(body.commune) : undefined;
  const registryNumber = body.registryNumber ? normalizeRegistryNumber(String(body.registryNumber)) : undefined;
  const birthDateInput = body.birthDate ? String(body.birthDate) : undefined;
  const birthDate = birthDateInput ? parseBirthDate(birthDateInput) : null;
  const nic = isCitizen && registryNumber && birthDateInput
    ? generateCitizenNic(registryNumber, birthDateInput)
    : undefined;

  if (commune && !sedhiouCommunes.some((item) => item.name === commune)) {
    return NextResponse.json({ message: "Commune invalide pour Sédhiou" }, { status: 400 });
  }

  if (isCitizen && (!commune || !registryNumber || !birthDate)) {
    return NextResponse.json(
      { message: "Un citoyen doit avoir une commune, un numéro de registre et une date de naissance" },
      { status: 400 }
    );
  }

  if (registryNumber || nic) {
    const existingIdentity = await prisma.user.findFirst({
      where: {
        OR: [
          registryNumber ? { registryNumber } : undefined,
          nic ? { nic } : undefined,
        ].filter(Boolean) as Array<{ registryNumber?: string; nic?: string }>,
      },
    });

    if (existingIdentity) {
      return NextResponse.json({ message: "Ce registre ou ce NIC existe déjà" }, { status: 409 });
    }
  }

  const role = isCitizen
    ? null
    : await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: {
          name: roleName,
          description: roleName === "ADMIN" ? "Administrateur système" : roleName === "MANAGER" ? "Chef de service" : "Agent municipal",
          permissions: roleName === "ADMIN" ? ["ALL"] : roleName === "MANAGER" ? ["READ", "WRITE", "VALIDATE"] : ["READ", "WRITE"],
        },
      });

  const department = isCitizen
    ? null
    : await prisma.department.upsert({
        where: { code: "ADM" },
        update: {},
        create: {
          name: "Administration",
          code: "ADM",
          description: "Service administratif",
        },
      });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      roleId: role?.id,
      departmentId: department?.id,
      commune,
      registryNumber,
      birthDate: birthDate || undefined,
      nic,
      status: "ACTIVE",
      isActive: true,
    },
    include: { role: true, department: true },
  });

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.role?.name ?? "CITOYEN",
        department: user.department?.name ?? "-",
        commune: user.commune,
        registryNumber: user.registryNumber,
        nic: user.nic,
        birthDate: user.birthDate,
        status: user.status,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    },
    { status: 201 }
  );
}
