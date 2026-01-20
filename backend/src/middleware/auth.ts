import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import db from '../models/database';
import { User, JwtPayload } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Middleware to verify JWT token and check if user is banned
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Check if user is banned
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as User | undefined;

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  if (user.is_banned) {
    return res.status(403).json({
      error: 'BANNED',
      message: 'Your account has been banned.',
      reason: user.ban_reason || 'No reason provided'
    });
  }

  req.user = payload;
  next();
}

// Middleware to check if user is admin
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Middleware to check trade comparator cooldown
export function checkTradeCooldown(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = db.prepare('SELECT last_trade_compare FROM users WHERE id = ?').get(req.user.userId) as { last_trade_compare: string | null } | undefined;

  if (user?.last_trade_compare) {
    const lastCompare = new Date(user.last_trade_compare).getTime();
    const now = Date.now();
    const cooldownMs = 2 * 60 * 1000; // 2 minutes

    if (now - lastCompare < cooldownMs) {
      const remainingMs = cooldownMs - (now - lastCompare);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return res.status(429).json({
        error: 'Cooldown active',
        remainingSeconds,
        message: `Please wait ${remainingSeconds} seconds before comparing again`
      });
    }
  }

  next();
}
