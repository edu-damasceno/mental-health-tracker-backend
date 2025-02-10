-- First create updatedAt as nullable
ALTER TABLE "DailyLog" ADD COLUMN "updatedAt" DATETIME;

-- Update existing records to use createdAt as initial updatedAt
UPDATE "DailyLog" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Make updatedAt required after setting values
ALTER TABLE "DailyLog" ALTER COLUMN "updatedAt" SET NOT NULL; 