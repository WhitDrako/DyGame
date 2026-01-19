import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/gpo.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      is_banned INTEGER DEFAULT 0,
      ban_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT,
      last_trade_compare TEXT
    )
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category_id TEXT NOT NULL,
      rarity TEXT NOT NULL,
      current_value INTEGER NOT NULL,
      image_path TEXT,
      trend TEXT DEFAULT 'stable',
      is_tradeable INTEGER DEFAULT 1,
      is_unobtainable INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Value history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS value_history (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      value INTEGER NOT NULL,
      recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
      note TEXT,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    )
  `);

  // Trade comparison logs (optional, for analytics)
  db.exec(`
    CREATE TABLE IF NOT EXISTS trade_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      items_given TEXT NOT NULL,
      items_received TEXT NOT NULL,
      result TEXT NOT NULL,
      value_given INTEGER NOT NULL,
      value_received INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('Database initialized successfully');
}

export default db;
