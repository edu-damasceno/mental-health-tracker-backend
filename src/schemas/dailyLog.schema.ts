import { z } from "zod";

export const createDailyLogSchema = z.object({
  moodLevel: z.number().min(1).max(5),
  anxietyLevel: z.number().min(1).max(5),
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().min(1).max(5), // Updated from enum to number
  physicalActivity: z.string().min(1),
  socialInteractions: z.string().min(1),
  stressLevel: z.number().min(1).max(5),
  symptoms: z.string().optional().default(""),
  primarySymptom: z.string().optional().default(""),
  symptomSeverity: z.number().min(1).max(5).optional().nullable(),
});

export type CreateDailyLogInput = z.infer<typeof createDailyLogSchema>;
