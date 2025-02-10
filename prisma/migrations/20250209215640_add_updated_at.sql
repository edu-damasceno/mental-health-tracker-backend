-- CreateTable
CREATE TABLE "new_DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moodLevel" INTEGER NOT NULL,
    "anxietyLevel" INTEGER NOT NULL,
    "sleepHours" REAL NOT NULL,
    "sleepQuality" INTEGER NOT NULL,
    "physicalActivity" TEXT NOT NULL,
    "socialInteractions" TEXT NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "symptoms" TEXT NOT NULL DEFAULT '',
    "primarySymptom" TEXT,
    "symptomSeverity" INTEGER
);

-- Copy the data
INSERT INTO "new_DailyLog" (
    "id", "userId", "createdAt", "updatedAt", "moodLevel", "anxietyLevel",
    "sleepHours", "sleepQuality", "physicalActivity", "socialInteractions",
    "stressLevel", "symptoms", "primarySymptom", "symptomSeverity"
)
SELECT 
    "id", "userId", "createdAt", "createdAt", "moodLevel", "anxietyLevel",
    "sleepHours", "sleepQuality", "physicalActivity", "socialInteractions",
    "stressLevel", "symptoms", "primarySymptom", "symptomSeverity"
FROM "DailyLog";

-- Drop the old table
DROP TABLE "DailyLog";

-- Rename the new table
ALTER TABLE "new_DailyLog" RENAME TO "DailyLog"; 