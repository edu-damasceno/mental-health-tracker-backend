import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/auth';

export interface AuthRequest extends Request {
  userId: string;
}

interface JwtPayload {
  userId: string;
  [key: string]: any;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      res.status(401).json({ error: 'Invalid authorization format' });
      return;
    }

    const decoded = verifyToken(token) as JwtPayload;
    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    (req as AuthRequest).userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ error: 'Token expired' });
        return;
      }
    }
    next(error);
  }
}; 