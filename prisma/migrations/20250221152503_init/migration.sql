-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moodLevel" INTEGER NOT NULL,
    "anxietyLevel" INTEGER NOT NULL,
    "sleepHours" DOUBLE PRECISION NOT NULL,
    "sleepQuality" INTEGER NOT NULL,
    "physicalActivity" TEXT DEFAULT 'None',
    "socialInteractions" TEXT DEFAULT 'None',
    "stressLevel" INTEGER NOT NULL,
    "symptoms" TEXT NOT NULL DEFAULT '',
    "primarySymptom" TEXT DEFAULT '',
    "symptomSeverity" INTEGER,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "DailyLog_userId_idx" ON "DailyLog"("userId");

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
