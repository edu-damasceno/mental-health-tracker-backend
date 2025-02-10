import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../config/env";

const TOKEN_EXPIRATION = "1h"; // 1 hour is a reasonable default
const SALT_ROUNDS = 10;

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.JWT_SECRET);
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
