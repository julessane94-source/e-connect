# docs/README.md
# Documentation du projet Agent Connect

## Architecture
Le projet suit une architecture moderne avec Next.js 15, TypeScript, Prisma ORM et PostgreSQL.

## Structure
- `app/` - Pages Next.js (App Router)
- `components/` - Composants React réutilisables
- `features/` - Modules fonctionnels Redux
- `services/` - Services métier
- `prisma/` - Schéma et migrations Prisma
- `uploads/` - Fichiers uploadés

## API Routes
- `/api/auth` - Authentification
- `/api/births` - Gestion des naissances
- `/api/documents` - Gestion des documents
- `/api/users` - Gestion des utilisateurs

## Base de données
- PostgreSQL 15+
- Schéma: agent_connect
- Tables: users, roles, departments, births, documents, etc.
