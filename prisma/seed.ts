import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const sleepQualities = ["Poor", "Fair", "Good", "Excellent"];
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
        date,
        moodLevel: Math.floor(Math.random() * 5) + 1,
        anxietyLevel: Math.floor(Math.random() * 5) + 1,
        sleepHours: Math.floor(Math.random() * 4) + 5,
        sleepQuality:
          sleepQualities[Math.floor(Math.random() * sleepQualities.length)],
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
