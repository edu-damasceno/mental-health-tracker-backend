declare namespace Express {
  export interface Request {
    userId?: string;
  }
}

export interface AuthRequest extends Request {
  userId: string;
} 