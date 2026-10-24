ALTER TABLE "request_types"
ADD COLUMN IF NOT EXISTS "requiredDocuments" TEXT NOT NULL DEFAULT '';
