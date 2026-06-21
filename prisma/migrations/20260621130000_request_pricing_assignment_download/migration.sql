-- CreateTable
CREATE TABLE "request_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "request_types_code_key" ON "request_types"("code");

-- AlterTable
ALTER TABLE "citizen_requests" ADD COLUMN "requestTypeId" TEXT,
ADD COLUMN "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "attachmentName" TEXT,
ADD COLUMN "attachmentMimeType" TEXT,
ADD COLUMN "attachmentSize" INTEGER,
ADD COLUMN "attachmentData" TEXT,
ADD COLUMN "signedDocumentName" TEXT,
ADD COLUMN "signedDocumentContent" TEXT,
ADD COLUMN "signedAt" TIMESTAMP(3),
ADD COLUMN "downloadEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "citizen_requests" ADD CONSTRAINT "citizen_requests_requestTypeId_fkey" FOREIGN KEY ("requestTypeId") REFERENCES "request_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
