import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

async function main() {
  if (!adminEmail || !adminPassword || adminPassword.length < 12) {
    throw new Error("Définissez ADMIN_EMAIL et un ADMIN_PASSWORD d'au moins 12 caractères.");
  }

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {
      description: "Administrateur système",
      permissions: ["ALL"],
    },
    create: {
      name: "ADMIN",
      description: "Administrateur système",
      permissions: ["ALL"],
    },
  });

  const adminDepartment = await prisma.department.upsert({
    where: { code: "ADM" },
    update: {
      name: "Administration",
      description: "Service administratif",
    },
    create: {
      name: "Administration",
      code: "ADM",
      description: "Service administratif",
    },
  });

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        roleId: adminRole.id,
        departmentId: adminDepartment.id,
        status: "ACTIVE",
        isActive: true,
      },
    });
    console.log(`Compte admin existant activé : ${adminEmail}. Son mot de passe n'a pas été modifié.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Système",
      roleId: adminRole.id,
      departmentId: adminDepartment.id,
      status: "ACTIVE",
      isActive: true,
    },
  });

  console.log(`Compte admin créé : ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error("Impossible d'insérer le compte admin", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
