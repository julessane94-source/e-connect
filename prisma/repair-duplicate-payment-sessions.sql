-- Pre-launch repair: ensure the field exists on databases created before it
-- was added to the Prisma schema.
ALTER TABLE citizen_requests
ADD COLUMN IF NOT EXISTS "paymentSessionId" TEXT;

-- Duplicate checkout session IDs cannot be mapped safely to one request.
-- Preserve every request and clear only ambiguous IDs.
UPDATE citizen_requests AS request
SET "paymentSessionId" = NULL
WHERE request."paymentSessionId" IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM citizen_requests AS duplicate
    WHERE duplicate."paymentSessionId" = request."paymentSessionId"
      AND duplicate.id <> request.id
  );
