ALTER TABLE "request_types"
ADD COLUMN "templateName" TEXT,
ADD COLUMN "templateMimeType" TEXT,
ADD COLUMN "templateSize" INTEGER,
ADD COLUMN "templateData" TEXT;
