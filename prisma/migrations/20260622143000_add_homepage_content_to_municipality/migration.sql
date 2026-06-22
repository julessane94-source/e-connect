ALTER TABLE "municipality_profiles"
ADD COLUMN "heroTitle" TEXT NOT NULL DEFAULT 'Mairie de Sédhiou',
ADD COLUMN "heroSubtitle" TEXT NOT NULL DEFAULT 'Services municipaux numériques, demandes citoyennes et suivi administratif.',
ADD COLUMN "heroAnnouncement" TEXT,
ADD COLUMN "heroImages" JSONB NOT NULL DEFAULT '[]';
