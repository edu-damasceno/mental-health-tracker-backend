/*
  Warnings:

  - You are about to drop the column `date` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to alter the column `sleepHours` on the `DailyLog` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `sleepQuality` on the `DailyLog` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moodLevel" INTEGER NOT NULL,
    "anxietyLevel" INTEGER NOT NULL,
    "sleepHours" REAL NOT NULL,
    "sleepQuality" INTEGER NOT NULL,
    "physicalActivity" TEXT NOT NULL,
    "socialInteractions" TEXT NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "symptoms" TEXT NOT NULL,
    "primarySymptom" TEXT,
    "symptomSeverity" INTEGER,
    CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyLog" ("anxietyLevel", "createdAt", "id", "moodLevel", "physicalActivity", "primarySymptom", "sleepHours", "sleepQuality", "socialInteractions", "stressLevel", "symptomSeverity", "symptoms", "userId") SELECT "anxietyLevel", "createdAt", "id", "moodLevel", "physicalActivity", "primarySymptom", "sleepHours", "sleepQuality", "socialInteractions", "stressLevel", "symptomSeverity", "symptoms", "userId" FROM "DailyLog";
DROP TABLE "DailyLog";
ALTER TABLE "new_DailyLog" RENAME TO "DailyLog";
CREATE INDEX "DailyLog_userId_idx" ON "DailyLog"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
