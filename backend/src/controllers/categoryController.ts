import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { Category } from '../types';

// Get all categories
export function getAllCategories(req: Request, res: Response) {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(i.id) as item_count
      FROM categories c
      LEFT JOIN items i ON c.id = i.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `).all();

    return res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get single category with items
export function getCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const items = db.prepare(`
      SELECT * FROM items WHERE category_id = ? ORDER BY name ASC
    `).all(id);

    return res.json({ category, items });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Create category
export function createCategory(req: Request, res: Response) {
  try {
    const { name, description, display_order } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists
    const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const categoryId = uuidv4();

    db.prepare(`
      INSERT INTO categories (id, name, description, display_order, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(categoryId, name, description || null, display_order || 0);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);

    return res.status(201).json({ category, message: 'Category created successfully' });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Update category
export function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, display_order } = req.body;

    const existingCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if new name conflicts with another category
    if (name) {
      const nameConflict = db.prepare('SELECT id FROM categories WHERE name = ? AND id != ?').get(name, id);
      if (nameConflict) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
    }

    db.prepare(`
      UPDATE categories SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        display_order = COALESCE(?, display_order)
      WHERE id = ?
    `).run(
      name || null,
      description !== undefined ? description : null,
      display_order !== undefined ? display_order : null,
      id
    );

    const updatedCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

    return res.json({ category: updatedCategory, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin: Delete category
export function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existingCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has items
    const itemCount = db.prepare('SELECT COUNT(*) as count FROM items WHERE category_id = ?').get(id) as { count: number };
    if (itemCount.count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with items. Remove or reassign items first.' });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
