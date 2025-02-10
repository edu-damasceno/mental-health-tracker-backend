-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "moodLevel" INTEGER NOT NULL,
    "anxietyLevel" INTEGER NOT NULL,
    "sleepHours" REAL NOT NULL,
    "sleepQuality" INTEGER NOT NULL,
    "physicalActivity" TEXT DEFAULT 'None',
    "socialInteractions" TEXT DEFAULT 'None',
    "stressLevel" INTEGER NOT NULL,
    "symptoms" TEXT NOT NULL DEFAULT '',
    "primarySymptom" TEXT NOT NULL DEFAULT '',
    "symptomSeverity" INTEGER,
    CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyLog" ("anxietyLevel", "createdAt", "id", "moodLevel", "physicalActivity", "primarySymptom", "sleepHours", "sleepQuality", "socialInteractions", "stressLevel", "symptomSeverity", "symptoms", "updatedAt", "userId") SELECT "anxietyLevel", "createdAt", "id", "moodLevel", "physicalActivity", coalesce("primarySymptom", '') AS "primarySymptom", "sleepHours", "sleepQuality", "socialInteractions", "stressLevel", "symptomSeverity", "symptoms", "updatedAt", "userId" FROM "DailyLog";
DROP TABLE "DailyLog";
ALTER TABLE "new_DailyLog" RENAME TO "DailyLog";
CREATE INDEX "DailyLog_userId_idx" ON "DailyLog"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
