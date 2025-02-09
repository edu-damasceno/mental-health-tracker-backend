import { z } from "zod";
import { createDailyLogSchema } from "../schemas/dailyLog.schema";

describe("Daily Log Schema", () => {
  const validLogData = {
    moodLevel: 3,
    anxietyLevel: 2,
    sleepHours: 7.5,
    sleepQuality: 4,
    physicalActivity: "30 minutes walking",
    socialInteractions: "Family dinner",
    stressLevel: 2,
    symptoms: "",
    primarySymptom: "",
    symptomSeverity: null,
  };

  it("should validate correct log data", () => {
    const result = createDailyLogSchema.safeParse(validLogData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid mood level", () => {
    const invalidData = { ...validLogData, moodLevel: 6 };
    const result = createDailyLogSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid sleep quality", () => {
    const invalidData = { ...validLogData, sleepQuality: 6 };
    const result = createDailyLogSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
