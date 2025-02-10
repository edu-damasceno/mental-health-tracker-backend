import { z } from "zod";

export const createDailyLogSchema = z.object({
  moodLevel: z.number().min(1).max(5).int(),
  anxietyLevel: z.number().min(1).max(5).int(),
  sleepHours: z
    .number()
    .min(0, "Sleep hours cannot be negative")
    .max(24, "Sleep hours cannot exceed 24")
    .multipleOf(0.5, "Sleep hours must be in increments of 0.5"),
  sleepQuality: z.number().min(1).max(5).int(),
  physicalActivity: z.string().optional().default(""),
  socialInteractions: z.string().optional().default(""),
  stressLevel: z.number().min(1).max(5).int(),
  symptoms: z.string().optional().default(""),
  primarySymptom: z.string().optional().default(""),
  symptomSeverity: z.number().min(1).max(5).optional().nullable(),
});

export type CreateDailyLogInput = z.infer<typeof createDailyLogSchema>;
