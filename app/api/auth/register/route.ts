import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateCitizenNic, normalizeRegistryNumber, parseBirthDate } from "@/lib/nic";
import { sedhiouCommunes } from "@/lib/sedhiou";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone, registryNumber, birthDate, commune } = parsed.data;
    const normalizedRegistryNumber = normalizeRegistryNumber(registryNumber);
    const parsedBirthDate = parseBirthDate(birthDate);
    const nic = generateCitizenNic(normalizedRegistryNumber, birthDate);

    if (!parsedBirthDate || parsedBirthDate > new Date()) {
      return NextResponse.json({ message: "Date de naissance invalide" }, { status: 400 });
    }

    if (!sedhiouCommunes.some((item) => item.name === commune)) {
      return NextResponse.json({ message: "Commune invalide pour la région de Sédhiou" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { registryNumber: normalizedRegistryNumber },
          { nic },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Un compte existe déjà avec cet email, ce registre ou ce NIC" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        registryNumber: normalizedRegistryNumber,
        birthDate: parsedBirthDate,
        commune,
        nic,
        roleId: null,
        departmentId: null,
        isActive: true,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        commune: true,
        nic: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Impossible de créer le compte citoyen" },
      { status: 500 }
    );
  }
}
