ALTER TABLE "citizen_requests" ADD COLUMN "paymentSessionId" TEXT;
ALTER TABLE "citizen_requests" ADD COLUMN "paymentTransactionId" TEXT;
ALTER TABLE "citizen_requests" ADD COLUMN "paymentAmount" INTEGER;
CREATE UNIQUE INDEX "citizen_requests_paymentSessionId_key" ON "citizen_requests"("paymentSessionId");
