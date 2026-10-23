import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Initialisation non destructive...")

  const roles = [
    { name: "ADMIN", description: "Administrateur système", permissions: ["ALL"] },
    { name: "MANAGER", description: "Chef de service", permissions: ["READ", "WRITE", "VALIDATE"] },
    { name: "AGENT", description: "Agent municipal", permissions: ["READ", "WRITE"] },
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        permissions: role.permissions,
      },
      create: role,
    })
  }

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
  })

  await prisma.department.upsert({
    where: { code: "EC" },
    update: {
      name: "État Civil",
      description: "Service de l'état civil",
    },
    create: {
      name: "État Civil",
      code: "EC",
      description: "Service de l'état civil",
    },
  })

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminEmail && adminPassword && adminPassword.length >= 12) {
    const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } })
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })

    if (existingAdmin) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          roleId: adminRole.id,
          departmentId: adminDepartment.id,
          status: "ACTIVE",
          isActive: true,
        },
      })
      console.log(`Compte admin existant conservé : ${adminEmail}; mot de passe inchangé.`)
    } else {
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: await bcrypt.hash(adminPassword, 12),
          firstName: "Admin",
          lastName: "Système",
          roleId: adminRole.id,
          departmentId: adminDepartment.id,
          status: "ACTIVE",
          isActive: true,
        },
      })
      console.log(`Compte admin créé : ${adminEmail}`)
    }
  } else {
    console.log("Création admin ignorée. Définissez ADMIN_EMAIL et ADMIN_PASSWORD (12 caractères minimum) pour en créer un.")
  }

  console.log("✅ Rôles et services prêts; aucun compte ni dossier existant n'a été supprimé.")
}

main()
  .catch((error) => {
    console.error("❌ Erreur lors du seeding:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
