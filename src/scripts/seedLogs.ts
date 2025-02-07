import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const sleepQualities = ['Poor', 'Fair', 'Good', 'Excellent'];
const activities = [
  '30 minutes walking',
  '1 hour gym workout',
  'Yoga session',
  'No exercise today'
];
const socialActivities = [
  'Met with friends for coffee',
  'Family dinner',
  'Video call with friends',
  'Quiet day at home'
];

async function createTestLogs(userId: string) {
  // Create logs for the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    await prisma.dailyLog.create({
      data: {
        userId,
        date,
        moodLevel: Math.floor(Math.random() * 5) + 1,
        anxietyLevel: Math.floor(Math.random() * 5) + 1,
        sleepHours: Math.floor(Math.random() * 4) + 5,
        sleepQuality: sleepQualities[Math.floor(Math.random() * sleepQualities.length)],
        physicalActivity: activities[Math.floor(Math.random() * activities.length)],
        socialInteractions: socialActivities[Math.floor(Math.random() * socialActivities.length)],
        stressLevel: Math.floor(Math.random() * 5) + 1,
        symptoms: i % 2 === 0 ? 'Some mild anxiety in the morning' : 'Feeling generally good today'
      }
    });
  }
}

const userId = '9329405d-cc6e-4d21-92f7-2ab702ada222';

createTestLogs(userId)
  .then(() => console.log('Test logs created successfully'))
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 