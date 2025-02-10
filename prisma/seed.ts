import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/auth";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.dailyLog.deleteMany();
  await prisma.user.deleteMany();

  const password = "Password123";
  const hashedPassword = await hashPassword(password);

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      password: hashedPassword,
      name: "Test User",
    },
  });

  // Create test logs for the past 30 days
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);

    await prisma.dailyLog.create({
      data: {
        userId: testUser.id,
        createdAt: date,
        moodLevel: 4,
        anxietyLevel: 2,
        sleepHours: 7.5,
        sleepQuality: 4,
        physicalActivity: "30 minutes walking",
        socialInteractions: "Met with friends",
        stressLevel: 3,
        symptoms: i === 0 ? "Mild anxiety" : "This week log",
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
