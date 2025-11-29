import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      phone?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  req.userId = payload.userId;
  req.phone = payload.phone;
  next();
}
