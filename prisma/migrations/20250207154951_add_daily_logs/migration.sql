-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moodLevel" INTEGER NOT NULL,
    "anxietyLevel" INTEGER NOT NULL,
    "sleepHours" INTEGER NOT NULL,
    "sleepQuality" TEXT NOT NULL,
    "physicalActivity" TEXT NOT NULL,
    "socialInteractions" TEXT NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "symptoms" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
