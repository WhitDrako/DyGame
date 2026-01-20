import { Request, Response } from 'express';
import db from '../models/database';
import { User } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

// Admin: Get all users
export function getAllUsers(req: Request, res: Response) {
  try {
    const users = db.prepare(`
      SELECT id, email, username, is_admin, is_banned, ban_reason, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `).all();

    return res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Get single user
export function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = db.prepare(`
      SELECT id, email, username, is_admin, is_banned, ban_reason, created_at, last_login, last_trade_compare
      FROM users WHERE id = ?
    `).get(id) as Omit<User, 'password'> | undefined;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's trade history count
    const tradeCount = db.prepare('SELECT COUNT(*) as count FROM trade_logs WHERE user_id = ?').get(id) as { count: number };

    return res.json({ user, tradeCount: tradeCount.count });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Ban user
export function banUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from banning themselves
    if (user.id === req.user?.userId) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }

    // Prevent banning the main admin account
    if (user.username.toLowerCase() === 'whitedrako' || user.email.toLowerCase() === 'whitedrako') {
      return res.status(400).json({ error: 'Cannot ban the super admin account' });
    }

    db.prepare(`
      UPDATE users SET
        is_banned = 1,
        ban_reason = ?
      WHERE id = ?
    `).run(reason || 'No reason provided', id);

    return res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Ban user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Unban user
export function unbanUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare(`
      UPDATE users SET
        is_banned = 0,
        ban_reason = NULL
      WHERE id = ?
    `).run(id);

    return res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Unban user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Toggle admin status
export function toggleAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent demoting the super admin
    if (user.username.toLowerCase() === 'whitedrako' || user.email.toLowerCase() === 'whitedrako') {
      return res.status(400).json({ error: 'Cannot modify super admin privileges' });
    }

    // Prevent admin from demoting themselves
    if (user.id === req.user?.userId) {
      return res.status(400).json({ error: 'Cannot modify your own admin status' });
    }

    const newAdminStatus = user.is_admin ? 0 : 1;

    db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(newAdminStatus, id);

    return res.json({
      message: newAdminStatus ? 'User granted admin privileges' : 'User admin privileges revoked',
      isAdmin: newAdminStatus === 1
    });
  } catch (error) {
    console.error('Toggle admin error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Delete user
export function deleteUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting the super admin
    if (user.username.toLowerCase() === 'whitedrako' || user.email.toLowerCase() === 'whitedrako') {
      return res.status(400).json({ error: 'Cannot delete the super admin account' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user?.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user's trade logs
    db.prepare('DELETE FROM trade_logs WHERE user_id = ?').run(id);

    // Delete user
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
