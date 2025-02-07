import { Request, Response, NextFunction } from 'express';

export const validateSleepLog = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { sleepHours, sleepQuality, bedTime, wakeTime, napDuration } = req.body;

  // Validate sleep hours
  if (sleepHours && (sleepHours < 0 || sleepHours > 24)) {
    res.status(400).json({ error: 'Sleep hours must be between 0 and 24' });
    return;
  }

  // Validate sleep quality
  const validQualities = ['Poor', 'Fair', 'Good', 'Excellent'];
  if (sleepQuality && !validQualities.includes(sleepQuality)) {
    res.status(400).json({ error: 'Invalid sleep quality value' });
    return;
  }

  // Validate nap duration
  if (napDuration && (napDuration < 0 || napDuration > 480)) { // Max 8 hours
    res.status(400).json({ error: 'Nap duration must be between 0 and 480 minutes' });
    return;
  }

  next();
}; 