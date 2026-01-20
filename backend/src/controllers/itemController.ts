import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { Item, ValueHistory, Category } from '../types';

// Get all items with optional filtering
export function getAllItems(req: Request, res: Response) {
  try {
    const { category, rarity, search, sort } = req.query;

    let query = `
      SELECT i.*, c.name as category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      query += ' AND i.category_id = ?';
      params.push(category);
    }

    if (rarity) {
      query += ' AND i.rarity = ?';
      params.push(rarity);
    }

    if (search) {
      query += ' AND i.name LIKE ?';
      params.push(`%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'value_high':
        query += ' ORDER BY i.current_value DESC';
        break;
      case 'value_low':
        query += ' ORDER BY i.current_value ASC';
        break;
      case 'name':
        query += ' ORDER BY i.name ASC';
        break;
      case 'rarity':
        query += ` ORDER BY CASE i.rarity
          WHEN 'Mythical' THEN 1
          WHEN 'Legendary' THEN 2
          WHEN 'Epic' THEN 3
          WHEN 'Event' THEN 4
          WHEN 'Rare' THEN 5
          WHEN 'Uncommon' THEN 6
          WHEN 'Common' THEN 7
          END`;
        break;
      default:
        query += ' ORDER BY i.updated_at DESC';
    }

    const items = db.prepare(query).all(...params);

    return res.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get single item with value history
export function getItem(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const item = db.prepare(`
      SELECT i.*, c.name as category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `).get(id) as (Item & { category_name: string }) | undefined;

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get value history
    const history = db.prepare(`
      SELECT * FROM value_history
      WHERE item_id = ?
      ORDER BY recorded_at ASC
    `).all(id) as ValueHistory[];

    return res.json({ item, history });
  } catch (error) {
    console.error('Get item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get item value history with time range filter
export function getItemHistory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { range } = req.query;

    let dateFilter = '';
    switch (range) {
      case '24h':
        dateFilter = "AND recorded_at >= datetime('now', '-1 day')";
        break;
      case '7d':
        dateFilter = "AND recorded_at >= datetime('now', '-7 days')";
        break;
      case '30d':
        dateFilter = "AND recorded_at >= datetime('now', '-30 days')";
        break;
      default:
        // All time - no filter
        break;
    }

    const history = db.prepare(`
      SELECT * FROM value_history
      WHERE item_id = ? ${dateFilter}
      ORDER BY recorded_at ASC
    `).all(id) as ValueHistory[];

    return res.json({ history });
  } catch (error) {
    console.error('Get item history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Create item
export function createItem(req: Request, res: Response) {
  try {
    const { name, description, category_id, rarity, current_value, is_tradeable, is_unobtainable } = req.body;

    if (!name || !category_id || !rarity || current_value === undefined) {
      return res.status(400).json({ error: 'Name, category, rarity, and value are required' });
    }

    // Verify category exists
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!category) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const itemId = uuidv4();
    const historyId = uuidv4();

    // Get image path if uploaded
    const imagePath = (req as any).file ? `/uploads/${(req as any).file.filename}` : null;

    // Parse boolean values properly (FormData sends strings)
    const parseBool = (val: any, defaultVal: boolean): number => {
      if (val === undefined || val === null) return defaultVal ? 1 : 0;
      if (typeof val === 'boolean') return val ? 1 : 0;
      if (typeof val === 'string') return val === 'true' ? 1 : 0;
      return val ? 1 : 0;
    };

    db.prepare(`
      INSERT INTO items (id, name, description, category_id, rarity, current_value, image_path, is_tradeable, is_unobtainable, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      itemId,
      name,
      description || null,
      category_id,
      rarity,
      current_value,
      imagePath,
      parseBool(is_tradeable, true),
      parseBool(is_unobtainable, false)
    );

    // Add initial value to history
    db.prepare(`
      INSERT INTO value_history (id, item_id, value, recorded_at, note)
      VALUES (?, ?, ?, datetime('now'), 'Initial value')
    `).run(historyId, itemId, current_value);

    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);

    return res.status(201).json({ item, message: 'Item created successfully' });
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Update item
export function updateItem(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, category_id, rarity, current_value, trend, is_tradeable, is_unobtainable } = req.body;

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as Item | undefined;
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get image path if uploaded
    const imagePath = (req as any).file ? `/uploads/${(req as any).file.filename}` : existingItem.image_path;

    // Check if value changed
    const valueChanged = current_value !== undefined && current_value !== existingItem.current_value;

    // Parse boolean values properly (FormData sends strings)
    const parseBoolOrNull = (val: any): number | null => {
      if (val === undefined || val === null) return null;
      if (typeof val === 'boolean') return val ? 1 : 0;
      if (typeof val === 'string') return val === 'true' ? 1 : 0;
      return val ? 1 : 0;
    };

    db.prepare(`
      UPDATE items SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        rarity = COALESCE(?, rarity),
        current_value = COALESCE(?, current_value),
        image_path = COALESCE(?, image_path),
        trend = COALESCE(?, trend),
        is_tradeable = COALESCE(?, is_tradeable),
        is_unobtainable = COALESCE(?, is_unobtainable),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name || null,
      description !== undefined ? description : null,
      category_id || null,
      rarity || null,
      current_value !== undefined ? current_value : null,
      imagePath,
      trend || null,
      parseBoolOrNull(is_tradeable),
      parseBoolOrNull(is_unobtainable),
      id
    );

    // Add to value history if value changed
    if (valueChanged) {
      const historyId = uuidv4();
      // Calculate trend
      let newTrend = 'stable';
      if (current_value > existingItem.current_value) {
        newTrend = 'up';
      } else if (current_value < existingItem.current_value) {
        newTrend = 'down';
      }

      db.prepare('UPDATE items SET trend = ? WHERE id = ?').run(newTrend, id);

      db.prepare(`
        INSERT INTO value_history (id, item_id, value, recorded_at, note)
        VALUES (?, ?, ?, datetime('now'), 'Value updated')
      `).run(historyId, id, current_value);
    }

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);

    return res.json({ item: updatedItem, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Delete item
export function deleteItem(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    db.prepare('DELETE FROM items WHERE id = ?').run(id);

    return res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Add value history point
export function addValueHistory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { value, recorded_at, note } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const historyId = uuidv4();

    db.prepare(`
      INSERT INTO value_history (id, item_id, value, recorded_at, note)
      VALUES (?, ?, ?, COALESCE(?, datetime('now')), ?)
    `).run(historyId, id, value, recorded_at || null, note || null);

    return res.status(201).json({ message: 'Value history added successfully' });
  } catch (error) {
    console.error('Add value history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Update value history point
export function updateValueHistory(req: Request, res: Response) {
  try {
    const { historyId } = req.params;
    const { value, recorded_at, note } = req.body;

    const existingHistory = db.prepare('SELECT * FROM value_history WHERE id = ?').get(historyId);
    if (!existingHistory) {
      return res.status(404).json({ error: 'History record not found' });
    }

    db.prepare(`
      UPDATE value_history SET
        value = COALESCE(?, value),
        recorded_at = COALESCE(?, recorded_at),
        note = COALESCE(?, note)
      WHERE id = ?
    `).run(
      value !== undefined ? value : null,
      recorded_at || null,
      note !== undefined ? note : null,
      historyId
    );

    return res.json({ message: 'Value history updated successfully' });
  } catch (error) {
    console.error('Update value history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Delete value history point
export function deleteValueHistory(req: Request, res: Response) {
  try {
    const { historyId } = req.params;

    const existingHistory = db.prepare('SELECT * FROM value_history WHERE id = ?').get(historyId);
    if (!existingHistory) {
      return res.status(404).json({ error: 'History record not found' });
    }

    db.prepare('DELETE FROM value_history WHERE id = ?').run(historyId);

    return res.json({ message: 'Value history deleted successfully' });
  } catch (error) {
    console.error('Delete value history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
