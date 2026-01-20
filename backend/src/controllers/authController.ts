import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { generateToken } from '../utils/jwt';
import { User } from '../types';

const ADMIN_EMAIL = 'whitedrako';
const ADMIN_PASSWORD = 'Ziad1017';

export async function register(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email or username already exists
    const existingUser = db.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).get(email.toLowerCase(), username.toLowerCase()) as User | undefined;

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Check if this is the admin account
    const isAdmin = (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || username.toLowerCase() === ADMIN_EMAIL.toLowerCase())
                    && password === ADMIN_PASSWORD ? 1 : 0;

    db.prepare(`
      INSERT INTO users (id, email, username, password, is_admin, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(userId, email.toLowerCase(), username.toLowerCase(), hashedPassword, isAdmin);

    const token = generateToken({
      userId,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      isAdmin: isAdmin === 1
    });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        isAdmin: isAdmin === 1
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Find user by email or username
    const user = db.prepare(
      'SELECT * FROM users WHERE email = ? OR username = ?'
    ).get(email.toLowerCase(), email.toLowerCase()) as User | undefined;

    // Special admin login check
    if (!user && (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) && password === ADMIN_PASSWORD) {
      // Create admin account if it doesn't exist
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);

      db.prepare(`
        INSERT INTO users (id, email, username, password, is_admin, created_at)
        VALUES (?, ?, ?, ?, 1, datetime('now'))
      `).run(adminId, ADMIN_EMAIL.toLowerCase(), ADMIN_EMAIL.toLowerCase(), hashedPassword);

      const token = generateToken({
        userId: adminId,
        email: ADMIN_EMAIL.toLowerCase(),
        username: ADMIN_EMAIL.toLowerCase(),
        isAdmin: true
      });

      // Update last login
      db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(adminId);

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: adminId,
          email: ADMIN_EMAIL.toLowerCase(),
          username: ADMIN_EMAIL.toLowerCase(),
          isAdmin: true
        }
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.is_banned) {
      return res.status(403).json({
        error: 'BANNED',
        message: 'Your account has been banned.',
        reason: user.ban_reason || 'No reason provided'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    // Special case: admin can always login with the specific password
    const isAdminLogin = (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
                          user.username.toLowerCase() === ADMIN_EMAIL.toLowerCase()) &&
                          password === ADMIN_PASSWORD;

    if (!isValidPassword && !isAdminLogin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If admin login with correct credentials, ensure admin flag is set
    if (isAdminLogin && !user.is_admin) {
      db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(user.id);
      user.is_admin = 1;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.is_admin === 1
    });

    // Update last login
    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.is_admin === 1
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const authReq = req as any;
    const user = db.prepare(
      'SELECT id, email, username, is_admin, is_banned, ban_reason, created_at, last_login, last_trade_compare FROM users WHERE id = ?'
    ).get(authReq.user.userId) as User | undefined;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.is_banned) {
      return res.status(403).json({
        error: 'BANNED',
        message: 'Your account has been banned.',
        reason: user.ban_reason || 'No reason provided'
      });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.is_admin === 1,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        lastTradeCompare: user.last_trade_compare
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
