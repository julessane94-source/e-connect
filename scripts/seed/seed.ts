// scripts/seed/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seeding...");

  try {
    // Nettoyer les données existantes
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.department.deleteMany();

    console.log("✅ Nettoyage terminé");

    // Créer les rôles
    const adminRole = await prisma.role.create({
      data: {
        name: "ADMIN",
        description: "Administrateur système",
        permissions: ["ALL"],
      },
    });

    const managerRole = await prisma.role.create({
      data: {
        name: "MANAGER",
        description: "Chef de service",
        permissions: ["READ", "WRITE", "VALIDATE"],
      },
    });

    const agentRole = await prisma.role.create({
      data: {
        name: "AGENT",
        description: "Agent municipal",
        permissions: ["READ", "WRITE"],
      },
    });

    console.log("✅ Rôles créés");

    // Créer les départements
    const adminService = await prisma.department.create({
      data: {
        name: "Administration",
        code: "ADM",
        description: "Service administratif",
      },
    });

    const etatCivil = await prisma.department.create({
      data: {
        name: "État Civil",
        code: "EC",
        description: "Service de l'état civil",
      },
    });

    const documents = await prisma.department.create({
      data: {
        name: "Documents",
        code: "DOC",
        description: "Service des documents",
      },
    });

    console.log("✅ Départements créés");

    // Créer l'utilisateur admin
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        email: "admin@agent-connect.sn",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "Système",
        roleId: adminRole.id,
        departmentId: adminService.id,
        status: "ACTIVE",
        isActive: true,
      },
    });

    // Créer des utilisateurs de test
    const testPassword = await bcrypt.hash("test123", 10);

    await prisma.user.create({
      data: {
        email: "test@agent-connect.sn",
        password: testPassword,
        firstName: "Test",
        lastName: "User",
        roleId: agentRole.id,
        departmentId: etatCivil.id,
        status: "ACTIVE",
        isActive: true,
      },
    });

    console.log("✅ Utilisateurs créés");

    console.log("\n✅ Seeding terminé avec succès!");
    console.log("📧 Admin: admin@agent-connect.sn | 🔑 admin123");
    console.log("📧 Test: test@agent-connect.sn | 🔑 test123");

  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
