import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { Item, TradeLog } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

// Compare trade values
export function compareTrade(req: AuthenticatedRequest, res: Response) {
  try {
    const { items_given, items_received } = req.body;

    if (!items_given || !items_received || !Array.isArray(items_given) || !Array.isArray(items_received)) {
      return res.status(400).json({ error: 'items_given and items_received arrays are required' });
    }

    if (items_given.length === 0 && items_received.length === 0) {
      return res.status(400).json({ error: 'At least one side must have items' });
    }

    // Calculate total value of items given
    let valueGiven = 0;
    const itemsGivenDetails: (Item & { quantity: number })[] = [];

    for (const itemEntry of items_given) {
      const itemId = typeof itemEntry === 'string' ? itemEntry : itemEntry.id;
      const quantity = typeof itemEntry === 'object' ? (itemEntry.quantity || 1) : 1;

      const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as Item | undefined;

      if (!item) {
        return res.status(400).json({ error: `Item not found: ${itemId}` });
      }

      valueGiven += item.current_value * quantity;
      itemsGivenDetails.push({ ...item, quantity });
    }

    // Calculate total value of items received
    let valueReceived = 0;
    const itemsReceivedDetails: (Item & { quantity: number })[] = [];

    for (const itemEntry of items_received) {
      const itemId = typeof itemEntry === 'string' ? itemEntry : itemEntry.id;
      const quantity = typeof itemEntry === 'object' ? (itemEntry.quantity || 1) : 1;

      const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as Item | undefined;

      if (!item) {
        return res.status(400).json({ error: `Item not found: ${itemId}` });
      }

      valueReceived += item.current_value * quantity;
      itemsReceivedDetails.push({ ...item, quantity });
    }

    // Determine trade result
    const difference = valueReceived - valueGiven;
    const percentDiff = valueGiven > 0 ? (difference / valueGiven) * 100 : 0;

    let result: 'WIN' | 'FAIR' | 'LOSE';

    // Fair if within 10% difference
    if (Math.abs(percentDiff) <= 10) {
      result = 'FAIR';
    } else if (difference > 0) {
      result = 'WIN';
    } else {
      result = 'LOSE';
    }

    // Log the trade comparison
    if (req.user) {
      const tradeId = uuidv4();
      db.prepare(`
        INSERT INTO trade_logs (id, user_id, items_given, items_received, result, value_given, value_received, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        tradeId,
        req.user.userId,
        JSON.stringify(items_given),
        JSON.stringify(items_received),
        result,
        valueGiven,
        valueReceived
      );

      // Update last trade compare timestamp
      db.prepare("UPDATE users SET last_trade_compare = datetime('now') WHERE id = ?").run(req.user.userId);
    }

    return res.json({
      result,
      valueGiven,
      valueReceived,
      difference,
      percentDiff: Math.round(percentDiff * 100) / 100,
      itemsGiven: itemsGivenDetails,
      itemsReceived: itemsReceivedDetails
    });
  } catch (error) {
    console.error('Compare trade error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get user's trade history
export function getTradeHistory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const trades = db.prepare(`
      SELECT * FROM trade_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.user.userId) as TradeLog[];

    // Parse items JSON
    const parsedTrades = trades.map(trade => ({
      ...trade,
      items_given: JSON.parse(trade.items_given),
      items_received: JSON.parse(trade.items_received)
    }));

    return res.json({ trades: parsedTrades });
  } catch (error) {
    console.error('Get trade history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get cooldown status
export function getCooldownStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = db.prepare('SELECT last_trade_compare FROM users WHERE id = ?').get(req.user.userId) as { last_trade_compare: string | null } | undefined;

    if (!user?.last_trade_compare) {
      return res.json({ cooldownActive: false, remainingSeconds: 0 });
    }

    const lastCompare = new Date(user.last_trade_compare).getTime();
    const now = Date.now();
    const cooldownMs = 2 * 60 * 1000; // 2 minutes
    const remaining = cooldownMs - (now - lastCompare);

    if (remaining <= 0) {
      return res.json({ cooldownActive: false, remainingSeconds: 0 });
    }

    return res.json({
      cooldownActive: true,
      remainingSeconds: Math.ceil(remaining / 1000)
    });
  } catch (error) {
    console.error('Get cooldown status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
