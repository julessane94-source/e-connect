CREATE TABLE "municipality_profiles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT 'Mairie de Sédhiou',
    "region" TEXT NOT NULL DEFAULT 'Sédhiou',
    "address" TEXT NOT NULL DEFAULT 'Sédhiou, Sénégal',
    "phone" TEXT,
    "email" TEXT NOT NULL DEFAULT 'contact@agent-connect.sn',
    "website" TEXT,
    "mayorName" TEXT,
    "openingHours" TEXT NOT NULL DEFAULT 'Lun - Ven: 8h - 17h',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "municipality_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "municipality_profiles_key_key" ON "municipality_profiles"("key");
