-- database/backup/backup.sql
-- Script de sauvegarde de la base de données

-- Sauvegarde complète
-- pg_dump -U postgres -d agent_connect > backup.sql

-- Restauration
-- psql -U postgres -d agent_connect < backup.sql

-- Sauvegarde des tables spécifiques
-- pg_dump -U postgres -d agent_connect -t users -t roles -t departments > backup_users.sql
