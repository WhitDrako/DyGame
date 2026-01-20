import { v4 as uuidv4 } from 'uuid';
import db, { initializeDatabase } from './models/database';

// Initialize database first
initializeDatabase();

console.log('Seeding GPO database...');

// Clear existing data
db.exec('DELETE FROM value_history');
db.exec('DELETE FROM items');
db.exec('DELETE FROM categories');

// Categories - Simplified
const categories = [
  { id: uuidv4(), name: 'Fruits', description: 'Devil Fruits with various powers', display_order: 1 },
  { id: uuidv4(), name: 'Weapons', description: 'Swords, guns and fighting tools', display_order: 2 },
  { id: uuidv4(), name: 'Accessories', description: 'Capes, rings and equipment', display_order: 3 },
  { id: uuidv4(), name: 'Boats', description: 'Ships for sailing', display_order: 4 },
  { id: uuidv4(), name: 'Materials', description: 'Crafting and upgrade materials', display_order: 5 },
  { id: uuidv4(), name: 'Limited', description: 'Event and unobtainable items', display_order: 6 }
];

const insertCategory = db.prepare(`
  INSERT INTO categories (id, name, description, display_order, created_at)
  VALUES (?, ?, ?, ?, datetime('now'))
`);

for (const cat of categories) {
  insertCategory.run(cat.id, cat.name, cat.description, cat.display_order);
}
console.log(`Created ${categories.length} categories`);

// Helper to get category id by name
const getCategoryId = (name: string) => categories.find(c => c.name === name)?.id;

// Real GPO Items based on wiki data
const items = [
  // === FRUITS (using actual GPO names) ===
  // Common
  { name: 'Kilo Kilo no Mi', category: 'Fruits', rarity: 'Common', value: 25000, trend: 'stable' },
  { name: 'Suke Suke no Mi', category: 'Fruits', rarity: 'Common', value: 30000, trend: 'stable' },
  { name: 'Spin Spin no Mi', category: 'Fruits', rarity: 'Common', value: 35000, trend: 'stable' },
  { name: 'Chiyu Chiyu no Mi', category: 'Fruits', rarity: 'Common', value: 40000, trend: 'up' },

  // Rare
  { name: 'Bari Bari no Mi', category: 'Fruits', rarity: 'Rare', value: 150000, trend: 'stable' },
  { name: 'Mero Mero no Mi', category: 'Fruits', rarity: 'Rare', value: 200000, trend: 'up' },
  { name: 'Horo Horo no Mi', category: 'Fruits', rarity: 'Rare', value: 175000, trend: 'stable' },
  { name: 'Gomu Gomu no Mi', category: 'Fruits', rarity: 'Rare', value: 250000, trend: 'up' },
  { name: 'Bomu Bomu no Mi', category: 'Fruits', rarity: 'Rare', value: 125000, trend: 'down' },

  // Epic
  { name: 'Yomi Yomi no Mi', category: 'Fruits', rarity: 'Epic', value: 750000, trend: 'stable' },
  { name: 'Bane Bane no Mi', category: 'Fruits', rarity: 'Epic', value: 600000, trend: 'down' },
  { name: 'Kira Kira no Mi', category: 'Fruits', rarity: 'Epic', value: 900000, trend: 'up' },

  // Legendary
  { name: 'Mera Mera no Mi', category: 'Fruits', rarity: 'Legendary', value: 2500000, trend: 'stable' },
  { name: 'Hie Hie no Mi', category: 'Fruits', rarity: 'Legendary', value: 3000000, trend: 'up' },
  { name: 'Goro Goro no Mi', category: 'Fruits', rarity: 'Legendary', value: 3500000, trend: 'up' },
  { name: 'Pika Pika no Mi', category: 'Fruits', rarity: 'Legendary', value: 4000000, trend: 'up' },
  { name: 'Magu Magu no Mi', category: 'Fruits', rarity: 'Legendary', value: 4500000, trend: 'stable' },
  { name: 'Gura Gura no Mi', category: 'Fruits', rarity: 'Legendary', value: 5000000, trend: 'up' },
  { name: 'Yami Yami no Mi', category: 'Fruits', rarity: 'Legendary', value: 4200000, trend: 'stable' },
  { name: 'Suna Suna no Mi', category: 'Fruits', rarity: 'Legendary', value: 2800000, trend: 'stable' },
  { name: 'Zushi Zushi no Mi', category: 'Fruits', rarity: 'Legendary', value: 3200000, trend: 'up' },
  { name: 'Ito Ito no Mi', category: 'Fruits', rarity: 'Legendary', value: 2600000, trend: 'down' },
  { name: 'Nikyu Nikyu no Mi', category: 'Fruits', rarity: 'Legendary', value: 2400000, trend: 'stable' },
  { name: 'Yuki Yuki no Mi', category: 'Fruits', rarity: 'Legendary', value: 2200000, trend: 'stable' },
  { name: 'Kage Kage no Mi', category: 'Fruits', rarity: 'Legendary', value: 2000000, trend: 'down' },
  { name: 'Moku Moku no Mi', category: 'Fruits', rarity: 'Legendary', value: 1800000, trend: 'stable' },
  { name: 'Goru Goru no Mi', category: 'Fruits', rarity: 'Legendary', value: 3800000, trend: 'up' },

  // Mythical
  { name: 'Tori Tori no Mi: Phoenix', category: 'Fruits', rarity: 'Mythical', value: 25000000, trend: 'up' },
  { name: 'Mochi Mochi no Mi', category: 'Fruits', rarity: 'Mythical', value: 30000000, trend: 'up' },
  { name: 'Ope Ope no Mi', category: 'Fruits', rarity: 'Mythical', value: 20000000, trend: 'stable' },
  { name: 'Doku Doku no Mi', category: 'Fruits', rarity: 'Mythical', value: 18000000, trend: 'stable' },
  { name: 'Hito Hito no Mi: Daibutsu', category: 'Fruits', rarity: 'Mythical', value: 22000000, trend: 'up' },
  { name: 'Ryu Ryu no Mi: Pteranodon', category: 'Fruits', rarity: 'Mythical', value: 35000000, trend: 'up' },
  { name: 'Uo Uo no Mi: Seiryu', category: 'Fruits', rarity: 'Mythical', value: 50000000, trend: 'up' },
  { name: 'Soru Soru no Mi', category: 'Fruits', rarity: 'Mythical', value: 28000000, trend: 'stable' },

  // === WEAPONS ===
  { name: 'Bisento', category: 'Weapons', rarity: 'Legendary', value: 8000000, trend: 'stable' },
  { name: 'Yoru', category: 'Weapons', rarity: 'Legendary', value: 15000000, trend: 'up' },
  { name: 'Shusui', category: 'Weapons', rarity: 'Epic', value: 3000000, trend: 'stable' },
  { name: 'Wado Ichimonji', category: 'Weapons', rarity: 'Rare', value: 500000, trend: 'stable' },
  { name: 'Sandai Kitetsu', category: 'Weapons', rarity: 'Rare', value: 400000, trend: 'down' },
  { name: 'Trident', category: 'Weapons', rarity: 'Epic', value: 2000000, trend: 'stable' },
  { name: 'Pole (2nd Form)', category: 'Weapons', rarity: 'Legendary', value: 6000000, trend: 'up' },
  { name: 'Seabeast Katana', category: 'Weapons', rarity: 'Rare', value: 350000, trend: 'stable' },
  { name: 'Cutlass', category: 'Weapons', rarity: 'Common', value: 15000, trend: 'stable' },
  { name: 'Flintlock', category: 'Weapons', rarity: 'Common', value: 10000, trend: 'stable' },
  { name: 'Kiribachi', category: 'Weapons', rarity: 'Epic', value: 1500000, trend: 'stable' },
  { name: 'Gravity Blade', category: 'Weapons', rarity: 'Legendary', value: 10000000, trend: 'up' },

  // === ACCESSORIES ===
  { name: 'Cupid Wings', category: 'Accessories', rarity: 'Event', value: 40000000, trend: 'up' },
  { name: 'Dark Angel Wings', category: 'Accessories', rarity: 'Event', value: 35000000, trend: 'stable' },
  { name: 'Marine Cape', category: 'Accessories', rarity: 'Rare', value: 800000, trend: 'stable' },
  { name: 'Black Cape', category: 'Accessories', rarity: 'Uncommon', value: 200000, trend: 'stable' },
  { name: 'Tomoe Ring', category: 'Accessories', rarity: 'Epic', value: 2500000, trend: 'up' },
  { name: 'Blue Sash', category: 'Accessories', rarity: 'Rare', value: 600000, trend: 'stable' },
  { name: 'Heart Glasses', category: 'Accessories', rarity: 'Event', value: 5000000, trend: 'stable' },
  { name: 'Elo Hammer', category: 'Accessories', rarity: 'Event', value: 60000000, trend: 'up' },

  // === BOATS ===
  { name: 'Dinghy', category: 'Boats', rarity: 'Common', value: 5000, trend: 'stable' },
  { name: 'Caravel', category: 'Boats', rarity: 'Uncommon', value: 50000, trend: 'stable' },
  { name: 'Sloop', category: 'Boats', rarity: 'Rare', value: 150000, trend: 'stable' },
  { name: 'Galleon', category: 'Boats', rarity: 'Epic', value: 500000, trend: 'stable' },
  { name: 'Striker', category: 'Boats', rarity: 'Legendary', value: 2000000, trend: 'up' },

  // === MATERIALS ===
  { name: 'Demon Collar', category: 'Materials', rarity: 'Epic', value: 1000000, trend: 'stable' },
  { name: 'Golden Relic', category: 'Materials', rarity: 'Legendary', value: 3000000, trend: 'up' },
  { name: 'Kraken Core', category: 'Materials', rarity: 'Legendary', value: 4000000, trend: 'stable' },
  { name: 'Sea Serpent Core', category: 'Materials', rarity: 'Epic', value: 800000, trend: 'stable' },
  { name: 'Ancient Core', category: 'Materials', rarity: 'Legendary', value: 5000000, trend: 'up' },

  // === LIMITED/UNOBTAINABLE ===
  { name: 'Candy Cane', category: 'Limited', rarity: 'Event', value: 45000000, trend: 'up' },
  { name: 'Festive Blade', category: 'Limited', rarity: 'Event', value: 30000000, trend: 'stable' },
  { name: 'Pumpkin Head', category: 'Limited', rarity: 'Event', value: 25000000, trend: 'stable' },
  { name: 'Sleigh', category: 'Limited', rarity: 'Event', value: 20000000, trend: 'down' },
];

const insertItem = db.prepare(`
  INSERT INTO items (id, name, description, category_id, rarity, current_value, trend, is_unobtainable, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

const insertHistory = db.prepare(`
  INSERT INTO value_history (id, item_id, value, recorded_at, note)
  VALUES (?, ?, ?, ?, ?)
`);

// Helper to generate historical values
function generateHistory(itemId: string, currentValue: number, trend: string) {
  const now = new Date();
  const points = [];

  // Generate 30 days of history
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    let variance = (Math.random() - 0.5) * 0.1;
    let trendFactor = 0;

    if (trend === 'up') {
      trendFactor = (30 - i) * 0.008;
    } else if (trend === 'down') {
      trendFactor = -(30 - i) * 0.005;
    }

    const historicalValue = Math.round(currentValue * (1 - trendFactor + variance));

    points.push({
      id: uuidv4(),
      item_id: itemId,
      value: Math.max(historicalValue, 1000),
      recorded_at: date.toISOString().replace('T', ' ').split('.')[0],
      note: i === 0 ? 'Current value' : null
    });
  }

  return points;
}

for (const item of items) {
  const itemId = uuidv4();
  const categoryId = getCategoryId(item.category);
  const isUnobtainable = item.category === 'Limited' ? 1 : 0;

  insertItem.run(
    itemId,
    item.name,
    null, // No description
    categoryId,
    item.rarity,
    item.value,
    item.trend,
    isUnobtainable
  );

  const history = generateHistory(itemId, item.value, item.trend);
  for (const point of history) {
    insertHistory.run(point.id, point.item_id, point.value, point.recorded_at, point.note);
  }
}

console.log(`Created ${items.length} items`);
console.log('Done!');
