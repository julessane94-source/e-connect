import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Début du seeding...")

  try {
    // Nettoyer les données existantes
    console.log("🧹 Nettoyage des données existantes...")
    
    // Supprimer les sessions et comptes
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    
    // Supprimer les utilisateurs existants
    await prisma.user.deleteMany()
    
    // Supprimer les rôles et départements
    await prisma.role.deleteMany()
    await prisma.department.deleteMany()

    console.log("✅ Nettoyage terminé")

    // Créer les rôles
    console.log("📝 Création des rôles...")
    const adminRole = await prisma.role.create({
      data: {
        name: "ADMIN",
        description: "Administrateur système",
        permissions: ["ALL"],
      },
    })

    const managerRole = await prisma.role.create({
      data: {
        name: "MANAGER",
        description: "Chef de service",
        permissions: ["READ", "WRITE", "VALIDATE"],
      },
    })

    const agentRole = await prisma.role.create({
      data: {
        name: "AGENT",
        description: "Agent municipal",
        permissions: ["READ", "WRITE"],
      },
    })

    console.log("✅ Rôles créés")

    // Créer les départements
    console.log("🏢 Création des départements...")
    const adminService = await prisma.department.create({
      data: {
        name: "Administration",
        code: "ADM",
        description: "Service administratif",
      },
    })

    const etatCivil = await prisma.department.create({
      data: {
        name: "État Civil",
        code: "EC",
        description: "Service de l'état civil",
      },
    })

    console.log("✅ Départements créés")

    // Créer l'utilisateur admin
    console.log("👤 Création de l'utilisateur admin...")
    const hashedPassword = await bcrypt.hash("admin123", 10)

    const adminUser = await prisma.user.create({
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
    })

    console.log("✅ Utilisateur admin créé")

    // Créer un utilisateur de test
    console.log("👤 Création d'un utilisateur de test...")
    const testPassword = await bcrypt.hash("test123", 10)

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
    })

    console.log("✅ Utilisateur de test créé")

    console.log("\n✅ Seeding terminé avec succès!")
    console.log("📧 Email admin: admin@agent-connect.sn")
    console.log("🔑 Mot de passe: admin123")
    console.log("\n📧 Email test: test@agent-connect.sn")
    console.log("🔑 Mot de passe: test123")

  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
