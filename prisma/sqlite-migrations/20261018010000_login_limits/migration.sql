CREATE TABLE "LoginAttempt" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 1,
  "resetAt" DATETIME NOT NULL
);
CREATE INDEX "LoginAttempt_resetAt_idx" ON "LoginAttempt"("resetAt");
