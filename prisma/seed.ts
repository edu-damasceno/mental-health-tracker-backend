import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const activities = [
  "30 minutes walking",
  "1 hour gym workout",
  "Yoga session",
  "No exercise today",
];
const socialActivities = [
  "Met with friends for coffee",
  "Family dinner",
  "Video call with friends",
  "Quiet day at home",
];

// Example log data
const sampleLogs = [
  {
    moodLevel: 4,
    anxietyLevel: 2,
    sleepHours: 7.5,
    sleepQuality: 4, // Changed from "Good" to number
    physicalActivity: "Morning jog",
    socialInteractions: "Coffee with friends",
    stressLevel: 2,
    symptoms: "None",
    primarySymptom: "",
    symptomSeverity: null,
  },
  // Update other sample logs similarly
  {
    moodLevel: 3,
    anxietyLevel: 3,
    sleepHours: 6.5,
    sleepQuality: 2, // Changed from "Poor" to number
    physicalActivity: "Light stretching",
    socialInteractions: "Video call with family",
    stressLevel: 4,
    symptoms: "Mild headache",
    primarySymptom: "headache",
    symptomSeverity: 2,
  },
];

async function main() {
  // Clean up existing data
  await prisma.dailyLog.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: hashedPassword,
      name: "Test User",
    },
  });

  console.log(`Created test user: ${user.email}`);

  // Create logs for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    await prisma.dailyLog.create({
      data: {
        userId: user.id,
        createdAt: date,
        moodLevel: Math.floor(Math.random() * 5) + 1,
        anxietyLevel: Math.floor(Math.random() * 5) + 1,
        sleepHours: Math.floor(Math.random() * 4) + 5,
        sleepQuality: Math.floor(Math.random() * 5) + 1,
        physicalActivity:
          activities[Math.floor(Math.random() * activities.length)],
        socialInteractions:
          socialActivities[Math.floor(Math.random() * socialActivities.length)],
        stressLevel: Math.floor(Math.random() * 5) + 1,
        symptoms:
          i % 2 === 0
            ? "Some mild anxiety in the morning"
            : "Feeling generally good today",
      },
    });
  }

  console.log("Created 30 days of test logs");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
