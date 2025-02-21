import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/auth";
import { addDays, subDays, format } from "date-fns";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function generateRandomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDailyTrend(baseValue: number, maxVariation: number): number {
  const variation = (Math.random() - 0.5) * maxVariation;
  const newValue = baseValue + variation;
  return Math.min(Math.max(Math.round(newValue), 1), 5);
}

const activities = [
  "30 minutes walking",
  "1 hour gym session",
  "Yoga practice",
  "Swimming",
  "Home workout",
  "Rest day",
  "Light stretching",
];

const socialInteractions = [
  "Coffee with friends",
  "Family dinner",
  "Video call with relatives",
  "Work meetings",
  "Quiet day alone",
  "Shopping with friends",
  "Phone call with family",
];

const symptoms = [
  "Mild anxiety in the morning",
  "Feeling energetic",
  "Slight headache",
  "Very focused today",
  "A bit restless",
  "Calm and peaceful",
  "", // Empty string for days without symptoms
];

async function main() {
  try {
    // Clean up existing data if tables exist
    try {
      await prisma.dailyLog.deleteMany();
      await prisma.user.deleteMany();
    } catch (error) {
      console.log("Tables don't exist yet, continuing with seeding...");
    }

    // Create test user
    const hashedPassword = await bcrypt.hash("Password123", 10);
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: hashedPassword,
        name: "Test User",
      },
    });

    // Generate 30 days of logs with trending data
    const today = new Date();
    let baseMood = 3;
    let baseAnxiety = 3;

    for (let i = 0; i < 30; i++) {
      const date = subDays(today, 29 - i); // Start from 30 days ago

      // Generate trending values
      baseMood = generateDailyTrend(baseMood, 1.5);
      baseAnxiety = generateDailyTrend(baseAnxiety, 1.5);

      // Random activity and social interaction
      const activity =
        activities[Math.floor(Math.random() * activities.length)];
      const social =
        socialInteractions[
          Math.floor(Math.random() * socialInteractions.length)
        ];
      const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];

      await prisma.dailyLog.create({
        data: {
          userId: user.id,
          moodLevel: baseMood,
          anxietyLevel: baseAnxiety,
          sleepHours: generateRandomValue(5, 9),
          sleepQuality: generateRandomValue(1, 5),
          physicalActivity: activity,
          socialInteractions: social,
          stressLevel: generateRandomValue(1, 5),
          symptoms: symptom,
          primarySymptom: symptom ? symptom.split(" ")[0] : "",
          symptomSeverity: symptom ? generateRandomValue(1, 5) : null,
          createdAt: new Date(
            date.setHours(
              generateRandomValue(8, 20),
              generateRandomValue(0, 59),
              0,
              0
            )
          ),
          updatedAt: new Date(date.valueOf()),
        },
      });
    }

    console.log("Seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
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
