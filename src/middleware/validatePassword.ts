import { RequestHandler } from 'express';

export const validatePassword: RequestHandler = (req, res, next) => {
  const { password } = req.body;
  
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
    });
    return;
  }
  
  next();
}; 