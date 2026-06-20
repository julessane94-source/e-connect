-- database/scripts/init.sql
-- Script d'initialisation de la base de données

-- Créer la base de données
CREATE DATABASE agent_connect;

-- Créer les extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Vérifier les connexions
SELECT * FROM pg_stat_activity;
