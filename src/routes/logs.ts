import { Router, Response, Request, RequestHandler } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { wss } from '../server';
import WebSocket from 'ws';

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
}

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
        symptoms: body.symptoms
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

// Get logs with filters
router.get('/filter', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  const { period, startDate, endDate } = req.query;

  let dateFilter: any = {};

  if (period) {
    const now = new Date();
    switch (period) {
      case 'week':
        dateFilter.gte = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        dateFilter.gte = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        dateFilter.gte = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }
  } else if (startDate && endDate) {
    dateFilter = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: dateFilter
    },
    orderBy: { date: 'desc' }
  });

  res.json(logs);
});

// Apply middleware and handlers
router.use(authenticateToken);
router.post('/', createLogHandler);
router.get('/', getLogsHandler);

export default router; 