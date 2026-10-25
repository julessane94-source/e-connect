-- Recover requests archived by the previous flow, which recorded an event
-- but did not persist an archive state on the request itself.
WITH latest_unrestored_archive AS (
  SELECT DISTINCT ON (archive_event."requestId")
    archive_event."requestId",
    archive_event."createdAt"
  FROM "request_events" AS archive_event
  WHERE archive_event."action" = 'Archivage du dossier'
    AND NOT EXISTS (
      SELECT 1
      FROM "request_events" AS restore_event
      WHERE restore_event."requestId" = archive_event."requestId"
        AND restore_event."action" = 'Restauration du dossier'
        AND restore_event."createdAt" > archive_event."createdAt"
    )
  ORDER BY archive_event."requestId", archive_event."createdAt" DESC
)
UPDATE "citizen_requests" AS request
SET "archivedAt" = latest."createdAt"
FROM latest_unrestored_archive AS latest
WHERE request."id" = latest."requestId"
  AND request."archivedAt" IS NULL;

-- The old flow archived every child document along with its request. Give
-- those legacy records the parent timestamp so a later restore is reversible.
UPDATE "document_records" AS document
SET "archivedAt" = request."archivedAt"
FROM "citizen_requests" AS request
WHERE document."requestId" = request."id"
  AND document."status" = 'ARCHIVED'
  AND request."archivedAt" IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM "request_events" AS archive_event
    WHERE archive_event."requestId" = request."id"
      AND archive_event."action" = 'Archivage du dossier'
      AND archive_event."createdAt" = request."archivedAt"
  );

