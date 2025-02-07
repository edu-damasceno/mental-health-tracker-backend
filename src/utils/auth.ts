import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const TOKEN_EXPIRATION = '1h'; // 1 hour is a reasonable default

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.JWT_SECRET);
}; 