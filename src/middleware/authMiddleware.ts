import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/auth';

export interface AuthRequest extends Request {
  userId: string;
}

export const authenticateToken: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  try {
    const decoded = verifyToken(token) as { userId: string; exp: number };
    
    // Check if token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      res.status(401).json({ error: 'Token has expired' });
      return;
    }

    (req as AuthRequest).userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
}; 