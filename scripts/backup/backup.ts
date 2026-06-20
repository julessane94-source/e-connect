// scripts/backup/backup.ts
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const backupDir = path.join(__dirname, "../../database/backup");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `backup-${timestamp}.sql`;
const filepath = path.join(backupDir, filename);

console.log(`🔄 Sauvegarde de la base de données...`);

const command = `pg_dump -U postgres -d agent_connect > "${filepath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Erreur: ${error.message}`);
    return;
  }
  console.log(`✅ Sauvegarde créée: ${filename}`);
  console.log(`📁 Emplacement: ${filepath}`);
});
