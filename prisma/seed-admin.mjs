import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@agent-connect.sn" },
    update: {
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Système",
      roleId: adminRole.id,
      departmentId: adminDepartment.id,
      status: "ACTIVE",
      isActive: true,
    },
    create: {
      email: "admin@agent-connect.sn",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Système",
      roleId: adminRole.id,
      departmentId: adminDepartment.id,
      status: "ACTIVE",
      isActive: true,
    },
  });

  console.log("Compte admin prêt : admin@agent-connect.sn");
}

main()
  .catch((error) => {
    console.error("Impossible d'insérer le compte admin", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
