import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const defaultPassword = "commune123";
const emailDomain = "agent-connect.sn";

const sedhiouDepartments = [
  {
    name: "Bounkiling",
    communes: [
      "Bona",
      "Bounkiling",
      "Diacounda",
      "Diambati",
      "Diaroumé",
      "Djinany",
      "Faoune",
      "Inor",
      "Kandion Mangana",
      "Madina Wandifa",
      "Ndiamacouta",
      "Ndiamalathiel",
      "Tankon",
    ],
  },
  {
    name: "Goudomp",
    communes: [
      "Baghère",
      "Diattacounda",
      "Diouboudou",
      "Djibanar",
      "Goudomp",
      "Kaour",
      "Karantaba",
      "Kolibantang",
      "Mangaroungou Santo",
      "Niagha",
      "Samine",
      "Simbandi Balante",
      "Simbandi Brassou",
      "Tanaff",
      "Yarang Balante",
    ],
  },
  {
    name: "Sédhiou",
    communes: [
      "Bambaly",
      "Bémet Bidjini",
      "Boghall",
      "Diannah Ba",
      "Diannah Malary",
      "Diendé",
      "Djibabouya",
      "Djiredji",
      "Koussy",
      "Marsassoum",
      "Oudoucar",
      "Sakar",
      "Sama Kanta Peulh",
      "Sansamba",
      "Sédhiou",
    ],
  },
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function departmentCode(departmentName, index) {
  return `COM${index.toString().padStart(2, "0")}${slugify(departmentName).slice(0, 3).toUpperCase()}`;
}

async function main() {
  const agentRole = await prisma.role.upsert({
    where: { name: "AGENT" },
    update: {
      description: "Agent municipal",
      permissions: ["READ", "WRITE"],
    },
    create: {
      name: "AGENT",
      description: "Agent municipal",
      permissions: ["READ", "WRITE"],
    },
  });

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  let createdOrUpdated = 0;
  let index = 1;

  for (const department of sedhiouDepartments) {
    for (const commune of department.communes) {
      const code = departmentCode(commune, index);
      const departmentRecord = await prisma.department.upsert({
        where: { code },
        update: {
          name: `Mairie de ${commune}`,
          description: `Compte de traitement des dossiers transférés à la commune de ${commune}`,
        },
        create: {
          name: `Mairie de ${commune}`,
          code,
          description: `Compte de traitement des dossiers transférés à la commune de ${commune}`,
        },
      });

      const email = `agent.${slugify(commune)}@${emailDomain}`;
      await prisma.user.upsert({
        where: { email },
        update: {
          password: hashedPassword,
          firstName: "Agent",
          lastName: commune,
          roleId: agentRole.id,
          departmentId: departmentRecord.id,
          commune,
          status: "ACTIVE",
          isActive: true,
        },
        create: {
          email,
          password: hashedPassword,
          firstName: "Agent",
          lastName: commune,
          roleId: agentRole.id,
          departmentId: departmentRecord.id,
          commune,
          status: "ACTIVE",
          isActive: true,
        },
      });

      console.log(`${email} / ${defaultPassword} - ${commune} (${department.name})`);
      createdOrUpdated += 1;
      index += 1;
    }
  }

  console.log(`\n${createdOrUpdated} compte(s) agent commune prêts.`);
}

main()
  .catch((error) => {
    console.error("Impossible de créer les comptes agents des communes", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
