CREATE TABLE "agent_messages" (
  "id" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "fileName" TEXT,
  "mimeType" TEXT,
  "fileData" TEXT,
  "requestId" TEXT,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "agent_messages_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "agent_messages"
ADD CONSTRAINT "agent_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agent_messages"
ADD CONSTRAINT "agent_messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agent_messages"
ADD CONSTRAINT "agent_messages_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "citizen_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "agent_messages_senderId_idx" ON "agent_messages"("senderId");
CREATE INDEX "agent_messages_recipientId_idx" ON "agent_messages"("recipientId");
CREATE INDEX "agent_messages_requestId_idx" ON "agent_messages"("requestId");
