import { Router, Response, Request, RequestHandler, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { wss } from '../server';
import WebSocket from 'ws';
import { body, query, validationResult } from 'express-validator';

const router = Router();

interface CreateLogBody {
  moodLevel: number;
  anxietyLevel: number;
  sleepHours: number;
  sleepQuality: string;
  physicalActivity: string;
  socialInteractions: string;
  stressLevel: number;
  symptoms: string;
  date?: Date;
}

const validateLog = [
  body('moodLevel').isInt({ min: 1, max: 10 }).withMessage('Mood level must be between 1 and 10'),
  body('anxietyLevel').isInt({ min: 1, max: 10 }).withMessage('Anxiety level must be between 1 and 10'),
  body('sleepHours').isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
  body('sleepQuality').isString().notEmpty().withMessage('Sleep quality must be a non-empty string'),
  body('physicalActivity').isString().notEmpty().withMessage('Physical activity must be a non-empty string'),
  body('socialInteractions').isString().notEmpty().withMessage('Social interactions must be a non-empty string'),
  body('stressLevel').isInt({ min: 1, max: 10 }).withMessage('Stress level must be between 1 and 10'),
  body('symptoms').isString().notEmpty().withMessage('Symptoms must be a non-empty string')
];

const validatePeriod = [
  query('period').optional().isIn([
    'this-week',
    'last-week',
    'this-month',
    'last-month',
    'custom'
  ]).withMessage('Invalid period'),
  query('startDate').custom((value, { req }) => {
    const query = req.query as { period?: string };
    if (query.period === 'custom' && !value) {
      throw new Error('Start date is required for custom period');
    }
    if (value && !isISO8601Date(value)) {
      throw new Error('Invalid start date format');
    }
    return true;
  }),
  query('endDate').custom((value, { req }) => {
    const query = req.query as { 
      period?: string;
      startDate?: string;
    };
    
    if (query.period === 'custom' && !value) {
      throw new Error('End date is required for custom period');
    }
    if (value && !isISO8601Date(value)) {
      throw new Error('Invalid end date format');
    }
    if (query.startDate && value && new Date(value) < new Date(query.startDate)) {
      throw new Error('End date must be after start date');
    }
    return true;
  })
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

const createLogHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const body = req.body as CreateLogBody;

    const log = await prisma.dailyLog.create({
      data: {
        user: { connect: { id: userId } },
        moodLevel: body.moodLevel,
        anxietyLevel: body.anxietyLevel,
        sleepHours: body.sleepHours,
        sleepQuality: body.sleepQuality,
        physicalActivity: body.physicalActivity,
        socialInteractions: body.socialInteractions,
        stressLevel: body.stressLevel,
        symptoms: body.symptoms,
        date: body.date ? new Date(body.date) : new Date()
      }
    });

    // Broadcast the new log to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'NEW_LOG',
          data: log
        }));
      }
    });

    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

const getLogsHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    
    const logs = await prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
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
      case 'this-week': {
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
      case 'last-week': {
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
      case 'this-month': {
        // Start of current month
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);

        // End of current month
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);

        dateFilter = { gte: start, lte: end };
        break;
      }
      case 'last-month': {
        // Start of last month
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);

        // End of last month
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);

        dateFilter = { gte: start, lte: end };
        break;
      }
      case 'custom': {
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(endDate as string);
          end.setUTCHours(23, 59, 59, 999);

          dateFilter = { 
            gte: start,
            lte: end
          };
        }
        break;
      }
    }

    const logs = await prisma.dailyLog.findMany({
      where: {
        userId,
        date: dateFilter
      },
      orderBy: { date: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// Update a log
const updateLogHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const logId = req.params.id;
    const body = req.body as CreateLogBody;

    // First verify the log belongs to the user
    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        id: logId,
        userId
      }
    });

    if (!existingLog) {
      res.status(404).json({ error: 'Log not found or unauthorized' });
      return;
    }

    const updatedLog = await prisma.dailyLog.update({
      where: { id: logId },
      data: {
        moodLevel: body.moodLevel,
        anxietyLevel: body.anxietyLevel,
        sleepHours: body.sleepHours,
        sleepQuality: body.sleepQuality,
        physicalActivity: body.physicalActivity,
        socialInteractions: body.socialInteractions,
        stressLevel: body.stressLevel,
        symptoms: body.symptoms
      }
    });

    // Broadcast the update
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'UPDATE_LOG',
          data: updatedLog
        }));
      }
    });

    res.json(updatedLog);
  } catch (error) {
    next(error);
  }
};

// Delete a log
const deleteLogHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const logId = req.params.id;

    // First verify the log belongs to the user
    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        id: logId,
        userId
      }
    });

    if (!existingLog) {
      res.status(404).json({ error: 'Log not found or unauthorized' });
      return;
    }

    await prisma.dailyLog.delete({
      where: { id: logId }
    });

    // Broadcast the deletion
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'DELETE_LOG',
          data: { id: logId }
        }));
      }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Apply middleware and handlers
router.use(authenticateToken);

router.post('/', validateLog, validateLogHandler, createLogHandler);
router.get('/', getLogsHandler);
router.get('/filter', validatePeriod, validatePeriodHandler, filterLogsHandler);
router.put('/:id', validateLog, validateLogHandler, updateLogHandler);
router.delete('/:id', deleteLogHandler);

export default router; 