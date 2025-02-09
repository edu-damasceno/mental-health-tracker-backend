import { Router, RequestHandler } from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import prisma from "../lib/prisma";
import { wss } from "../server";
import WebSocket from "ws";
import { body, query, validationResult } from "express-validator";

const router = Router();

interface CreateLogBody {
  moodLevel: number;
  anxietyLevel: number;
  sleepHours: number;
  sleepQuality: number;
  physicalActivity: string;
  socialInteractions: string;
  stressLevel: number;
  symptoms: string;
  primarySymptom?: string;
  symptomSeverity?: number | null;
  date?: string;
}

const validateLog = [
  body("moodLevel")
    .isInt({ min: 1, max: 5 })
    .withMessage("Mood level must be between 1 and 5"),
  body("anxietyLevel")
    .isInt({ min: 1, max: 5 })
    .withMessage("Anxiety level must be between 1 and 5"),
  body("sleepHours")
    .isFloat({ min: 0, max: 24 })
    .withMessage("Sleep hours must be between 0 and 24"),
  body("sleepQuality")
    .isInt({ min: 1, max: 5 })
    .withMessage("Sleep quality must be between 1 and 5"),
  body("physicalActivity")
    .isString()
    .notEmpty()
    .withMessage("Physical activity must be a non-empty string"),
  body("socialInteractions")
    .isString()
    .notEmpty()
    .withMessage("Social interactions must be a non-empty string"),
  body("stressLevel")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stress level must be between 1 and 5"),
  body("symptoms").isString().optional({ nullable: true }).default(""),
  body("primarySymptom")
    .optional()
    .isString()
    .withMessage("Primary symptom must be a string"),
  body("symptomSeverity")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Symptom severity must be between 1 and 5"),
];

const validatePeriod = [
  query("period")
    .optional()
    .isIn(["this-week", "last-week", "this-month", "last-month", "custom"])
    .withMessage("Invalid period"),
  query("startDate").custom((value, { req }) => {
    const query = req.query as { period?: string };
    if (query.period === "custom" && !value) {
      throw new Error("Start date is required for custom period");
    }
    if (value && !isISO8601Date(value)) {
      throw new Error("Invalid start date format");
    }
    return true;
  }),
  query("endDate").custom((value, { req }) => {
    const query = req.query as {
      period?: string;
      startDate?: string;
    };

    if (query.period === "custom" && !value) {
      throw new Error("End date is required for custom period");
    }
    if (value && !isISO8601Date(value)) {
      throw new Error("Invalid end date format");
    }
    if (
      query.startDate &&
      value &&
      new Date(value) < new Date(query.startDate)
    ) {
      throw new Error("End date must be after start date");
    }
    return true;
  }),
];

// Helper function to validate ISO 8601 dates
function isISO8601Date(value: string): boolean {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}

// Validation handlers
const validateLogHandler: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return;
  }
  next();
};

const validatePeriodHandler: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return;
  }
  next();
};

const createLogHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const body = req.body as CreateLogBody;
    const logDate = body.date ? new Date(body.date) : new Date();

    // Check for existing log on the same day
    const startOfDay = new Date(logDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(logDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingLog) {
      res.status(400).json({ error: "A log already exists for this day" });
      return;
    }

    // Create new log if none exists
    const log = await prisma.dailyLog.create({
      data: {
        user: { connect: { id: userId } },
        moodLevel: Number(body.moodLevel),
        anxietyLevel: Number(body.anxietyLevel),
        sleepHours: Number(body.sleepHours),
        sleepQuality: Number(body.sleepQuality),
        physicalActivity: body.physicalActivity,
        socialInteractions: body.socialInteractions,
        stressLevel: Number(body.stressLevel),
        symptoms: body.symptoms,
        primarySymptom: body.primarySymptom,
        symptomSeverity: body.symptomSeverity
          ? Number(body.symptomSeverity)
          : null,
        createdAt: logDate,
      },
    });

    // Broadcast the new log to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "NEW_LOG",
            data: log,
          })
        );
      }
    });

    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

const getLogsHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;

    const logs = await prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// Filter handler
const filterLogsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).userId;
    const { period, startDate, endDate } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case "this-week": {
        // Start of current week (Sunday)
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);

        // End of current week (Saturday)
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        dateFilter = { gte: start, lte: end };
        break;
      }
      case "last-week": {
        // Start of last week (Sunday)
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() - 7);
        start.setHours(0, 0, 0, 0);

        // End of last week (Saturday)
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        dateFilter = { gte: start, lte: end };
        break;
      }
      case "this-month": {
        // Start of current month
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);

        // End of current month
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);

        dateFilter = { gte: start, lte: end };
        break;
      }
      case "last-month": {
        // Start of last month
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);

        // End of last month
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);

        dateFilter = { gte: start, lte: end };
        break;
      }
      case "custom": {
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(endDate as string);
          end.setUTCHours(23, 59, 59, 999);

          dateFilter = {
            gte: start,
            lte: end,
          };
        }
        break;
      }
    }

    const logs = await prisma.dailyLog.findMany({
      where: {
        userId,
        createdAt: dateFilter,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// Update a log
const updateLogHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const logId = req.params.id;
    const { createdAt, ...updates } = req.body;

    // First, fetch the existing log
    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        id: logId,
        userId,
      },
    });

    if (!existingLog) {
      res.status(404).json({ error: "Log not found" });
      return;
    }

    // Check if the log is from today
    const today = new Date();
    const logDate = new Date(existingLog.createdAt);

    if (!isSameDay(today, logDate)) {
      res.status(403).json({
        error: "Logs can only be edited on the day they were created",
      });
      return;
    }

    const safeUpdates = {
      ...updates,
      moodLevel: Number(updates.moodLevel),
      anxietyLevel: Number(updates.anxietyLevel),
      sleepHours: Number(updates.sleepHours),
      sleepQuality: Number(updates.sleepQuality),
      stressLevel: Number(updates.stressLevel),
      symptomSeverity: updates.symptomSeverity
        ? Number(updates.symptomSeverity)
        : null,
    };

    const updatedLog = await prisma.dailyLog.update({
      where: {
        id: logId,
      },
      data: safeUpdates,
    });

    res.json(updatedLog);
  } catch (error) {
    next(error);
  }
};

// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Delete a log
const deleteLogHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const logId = req.params.id;

    // First verify the log belongs to the user
    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        id: logId,
        userId,
      },
    });

    if (!existingLog) {
      res.status(404).json({ error: "Log not found or unauthorized" });
      return;
    }

    await prisma.dailyLog.delete({
      where: { id: logId },
    });

    // Broadcast the deletion
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "DELETE_LOG",
            data: { id: logId },
          })
        );
      }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getMoodTrendsHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const { days = 30 } = req.query;

    const moodTrend = await prisma.dailyLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        createdAt: true,
        moodLevel: true,
        anxietyLevel: true,
        stressLevel: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(moodTrend);
  } catch (error) {
    next(error);
  }
};

const getSleepStatsHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;

    const sleepStats = await prisma.dailyLog.groupBy({
      by: ["sleepQuality"],
      where: { userId },
      _count: true,
      _avg: {
        sleepHours: true,
      },
    });

    res.json(sleepStats);
  } catch (error) {
    next(error);
  }
};

const getCorrelationsHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;

    const correlationData = await prisma.dailyLog.findMany({
      where: { userId },
      select: {
        createdAt: true,
        sleepHours: true,
        sleepQuality: true,
        moodLevel: true,
        anxietyLevel: true,
        stressLevel: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });

    res.json(correlationData);
  } catch (error) {
    next(error);
  }
};

const getWeeklyAveragesHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;

    const logs = await prisma.dailyLog.findMany({
      where: { userId },
      select: {
        createdAt: true,
        moodLevel: true,
        anxietyLevel: true,
        stressLevel: true,
        sleepHours: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    type LogMetrics = {
      moodLevel: { sum: number; count: number };
      anxietyLevel: { sum: number; count: number };
      stressLevel: { sum: number; count: number };
      sleepHours: { sum: number; count: number };
    };

    const weeklyAverages = logs.reduce<Record<string, LogMetrics>>(
      (acc, log) => {
        const weekStart = new Date(log.createdAt);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const weekKey = weekStart.toISOString();
        if (!acc[weekKey]) {
          acc[weekKey] = {
            moodLevel: { sum: 0, count: 0 },
            anxietyLevel: { sum: 0, count: 0 },
            stressLevel: { sum: 0, count: 0 },
            sleepHours: { sum: 0, count: 0 },
          };
        }

        (
          ["moodLevel", "anxietyLevel", "stressLevel", "sleepHours"] as const
        ).forEach((metric) => {
          acc[weekKey][metric].sum += log[metric];
          acc[weekKey][metric].count++;
        });

        return acc;
      },
      {}
    );

    const result = Object.entries(weeklyAverages).map(
      ([week, data]: [string, any]) => ({
        week,
        moodLevel: data.moodLevel.sum / data.moodLevel.count,
        anxietyLevel: data.anxietyLevel.sum / data.anxietyLevel.count,
        stressLevel: data.stressLevel.sum / data.stressLevel.count,
        sleepHours: data.sleepHours.sum / data.sleepHours.count,
      })
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getSymptomAnalysisHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const { period = "week" } = req.query;

    const now = new Date();
    let dateFilter: any = {};

    // Set date range based on period
    switch (period) {
      case "week": {
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        dateFilter = { gte: start };
        break;
      }
      case "month": {
        const start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        dateFilter = { gte: start };
        break;
      }
    }

    const logs = await prisma.dailyLog.findMany({
      where: {
        userId,
        createdAt: dateFilter,
      },
      select: {
        createdAt: true,
        symptoms: true,
        moodLevel: true,
        anxietyLevel: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Simplified analysis
    const analysis = {
      commonPhrases: {} as Record<string, number>,
    };

    logs.forEach((log) => {
      // Only analyze common phrases
      const words = log.symptoms
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3);

      words.forEach((word) => {
        analysis.commonPhrases[word] = (analysis.commonPhrases[word] || 0) + 1;
      });
    });

    res.json({
      period,
      totalLogs: logs.length,
      analysis,
      logs: logs.map((log) => ({
        date: log.createdAt,
        moodLevel: log.moodLevel,
        anxietyLevel: log.anxietyLevel,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Apply middleware and handlers
router.use(authenticateToken);

router.post("/", validateLog, validateLogHandler, createLogHandler);
router.get("/", getLogsHandler);
router.get("/filter", validatePeriod, validatePeriodHandler, filterLogsHandler);
router.put("/:id", validateLog, validateLogHandler, updateLogHandler);
router.delete("/:id", deleteLogHandler);
router.get("/trends/mood", getMoodTrendsHandler);
router.get("/stats/sleep", getSleepStatsHandler);
router.get("/correlations", getCorrelationsHandler);
router.get("/stats/weekly", getWeeklyAveragesHandler);
router.get("/stats/symptoms", getSymptomAnalysisHandler);

export default router;
