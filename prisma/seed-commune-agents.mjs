import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
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
  if (process.env.SHOW_COMMUNE_INITIAL_CREDENTIALS !== "true") {
    throw new Error("Pour afficher une seule fois les mots de passe initiaux, définissez SHOW_COMMUNE_INITIAL_CREDENTIALS=true avant d'exécuter ce script.");
  }

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

  const initialCredentials = [];
  let created = 0;
  let existing = 0;
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
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            firstName: "Agent",
            lastName: commune,
            roleId: agentRole.id,
            departmentId: departmentRecord.id,
            commune,
            status: "ACTIVE",
            isActive: true,
          },
        });
        existing += 1;
      } else {
        const password = randomBytes(24).toString("base64url");
        await prisma.user.create({
          data: {
            email,
            password: await bcrypt.hash(password, 12),
            firstName: "Agent",
            lastName: commune,
            roleId: agentRole.id,
            departmentId: departmentRecord.id,
            commune,
            status: "ACTIVE",
            isActive: true,
          },
        });
        initialCredentials.push({ email, password, commune, department: department.name });
        created += 1;
      }
      index += 1;
    }
  }

  console.log(`\n${created} nouveau(x) compte(s), ${existing} compte(s) existant(s) mis à jour sans changer leur mot de passe.`);
  if (initialCredentials.length) {
    console.log("Mots de passe initiaux à remettre aux agents (ils ne seront pas réaffichés) :");
    for (const credential of initialCredentials) {
      console.log(`${credential.email} | ${credential.password} | ${credential.commune} (${credential.department})`);
    }
  } else {
    console.log("Aucun nouveau mot de passe à afficher.");
  }
}

main()
  .catch((error) => {
    console.error("Impossible de créer les comptes agents des communes", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
