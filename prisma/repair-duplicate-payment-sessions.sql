-- Pre-launch repair: duplicate checkout session IDs cannot be mapped safely to
-- a single citizen request. Preserve every request and clear only ambiguous IDs.
UPDATE citizen_requests AS request
SET "paymentSessionId" = NULL
WHERE request."paymentSessionId" IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM citizen_requests AS duplicate
    WHERE duplicate."paymentSessionId" = request."paymentSessionId"
      AND duplicate.id <> request.id
  );
