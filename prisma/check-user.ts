import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@agent-connect.sn" },
      include: { role: true, department: true }
    })

    if (user) {
      console.log("✅ Utilisateur admin trouvé!")
      console.log("   Email:", user.email)
      console.log("   Nom:", user.firstName, user.lastName)
      console.log("   Rôle:", user.role?.name)
      console.log("   Département:", user.department?.name)
      console.log("   Statut:", user.status)
    } else {
      console.log("❌ Utilisateur admin non trouvé!")
    }
  } catch (error) {
    console.error("❌ Erreur:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
