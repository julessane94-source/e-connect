-- Add citizen identity fields used to generate NIC and lock requests to a commune.
ALTER TABLE "users"
ADD COLUMN "registryNumber" TEXT,
ADD COLUMN "birthDate" TIMESTAMP(3),
ADD COLUMN "commune" TEXT,
ADD COLUMN "nic" TEXT;

CREATE UNIQUE INDEX "users_registryNumber_key" ON "users"("registryNumber");
CREATE UNIQUE INDEX "users_nic_key" ON "users"("nic");
