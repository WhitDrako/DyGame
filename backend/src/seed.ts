import { v4 as uuidv4 } from 'uuid';
import db, { initializeDatabase } from './models/database';

// Initialize database first
initializeDatabase();

console.log('🌊 Seeding GPO Trading Platform database...');

// Clear existing data
db.exec('DELETE FROM value_history');
db.exec('DELETE FROM items');
db.exec('DELETE FROM categories');

// Categories
const categories = [
  { id: uuidv4(), name: 'Devil Fruits', description: 'Mysterious fruits granting supernatural powers', display_order: 1 },
  { id: uuidv4(), name: 'Legendary Fruits', description: 'The rarest and most powerful devil fruits', display_order: 2 },
  { id: uuidv4(), name: 'Mythical Fruits', description: 'Fruits of mythological power', display_order: 3 },
  { id: uuidv4(), name: 'Weapons', description: 'Blades, guns, and legendary armaments', display_order: 4 },
  { id: uuidv4(), name: 'Accessories', description: 'Rings, capes, and special equipment', display_order: 5 },
  { id: uuidv4(), name: 'Event Items', description: 'Limited-time and seasonal items', display_order: 6 },
  { id: uuidv4(), name: 'Boats', description: 'Ships for sailing the Grand Line', display_order: 7 },
  { id: uuidv4(), name: 'Outfits', description: 'Cosmetic clothing and armor', display_order: 8 },
  { id: uuidv4(), name: 'Consumables', description: 'Food, potions, and temporary boosts', display_order: 9 },
  { id: uuidv4(), name: 'Unobtainables', description: 'Items no longer available in-game', display_order: 10 }
];

const insertCategory = db.prepare(`
  INSERT INTO categories (id, name, description, display_order, created_at)
  VALUES (?, ?, ?, ?, datetime('now'))
`);

for (const cat of categories) {
  insertCategory.run(cat.id, cat.name, cat.description, cat.display_order);
}
console.log(`✅ Created ${categories.length} categories`);

// Helper to get category id by name
const getCategoryId = (name: string) => categories.find(c => c.name === name)?.id;

// Items with realistic GPO-inspired data
const items = [
  // Devil Fruits (Common to Epic)
  { name: 'Bomb Fruit', category: 'Devil Fruits', rarity: 'Common', value: 50000, trend: 'stable' },
  { name: 'Spike Fruit', category: 'Devil Fruits', rarity: 'Common', value: 75000, trend: 'stable' },
  { name: 'Spin Fruit', category: 'Devil Fruits', rarity: 'Uncommon', value: 150000, trend: 'up' },
  { name: 'Chop Fruit', category: 'Devil Fruits', rarity: 'Uncommon', value: 175000, trend: 'stable' },
  { name: 'Spring Fruit', category: 'Devil Fruits', rarity: 'Rare', value: 350000, trend: 'down' },
  { name: 'Kilo Fruit', category: 'Devil Fruits', rarity: 'Rare', value: 400000, trend: 'stable' },
  { name: 'Smoke Fruit', category: 'Devil Fruits', rarity: 'Rare', value: 500000, trend: 'up' },
  { name: 'Flame Fruit', category: 'Devil Fruits', rarity: 'Epic', value: 2500000, trend: 'up' },
  { name: 'Ice Fruit', category: 'Devil Fruits', rarity: 'Epic', value: 2800000, trend: 'stable' },
  { name: 'Light Fruit', category: 'Devil Fruits', rarity: 'Epic', value: 3500000, trend: 'up' },
  { name: 'Magma Fruit', category: 'Devil Fruits', rarity: 'Epic', value: 3200000, trend: 'stable' },
  { name: 'Quake Fruit', category: 'Devil Fruits', rarity: 'Epic', value: 4000000, trend: 'up' },
  { name: 'Dark Fruit', category: 'Devil Fruits', rarity: 'Epic', value: 3800000, trend: 'stable' },

  // Legendary Fruits
  { name: 'Dragon Fruit', category: 'Legendary Fruits', rarity: 'Legendary', value: 15000000, trend: 'up' },
  { name: 'Leopard Fruit', category: 'Legendary Fruits', rarity: 'Legendary', value: 25000000, trend: 'up' },
  { name: 'Spirit Fruit', category: 'Legendary Fruits', rarity: 'Legendary', value: 18000000, trend: 'stable' },
  { name: 'Control Fruit', category: 'Legendary Fruits', rarity: 'Legendary', value: 12000000, trend: 'down' },
  { name: 'Gravity Fruit', category: 'Legendary Fruits', rarity: 'Legendary', value: 14000000, trend: 'stable' },

  // Mythical Fruits
  { name: 'Buddha Fruit', category: 'Mythical Fruits', rarity: 'Mythical', value: 50000000, trend: 'up' },
  { name: 'Phoenix Fruit', category: 'Mythical Fruits', rarity: 'Mythical', value: 75000000, trend: 'up' },
  { name: 'Nika Fruit', category: 'Mythical Fruits', rarity: 'Mythical', value: 150000000, trend: 'up' },

  // Weapons
  { name: 'Bisento', category: 'Weapons', rarity: 'Legendary', value: 8000000, trend: 'stable' },
  { name: 'Yoru', category: 'Weapons', rarity: 'Legendary', value: 12000000, trend: 'up' },
  { name: 'Enma', category: 'Weapons', rarity: 'Legendary', value: 20000000, trend: 'up' },
  { name: 'Shusui', category: 'Weapons', rarity: 'Epic', value: 5000000, trend: 'stable' },
  { name: 'Wado Ichimonji', category: 'Weapons', rarity: 'Rare', value: 800000, trend: 'stable' },
  { name: 'Sandai Kitetsu', category: 'Weapons', rarity: 'Rare', value: 600000, trend: 'down' },
  { name: 'Cutlass', category: 'Weapons', rarity: 'Common', value: 50000, trend: 'stable' },
  { name: 'Flintlock', category: 'Weapons', rarity: 'Common', value: 30000, trend: 'stable' },

  // Accessories
  { name: 'Cupid Wings', category: 'Accessories', rarity: 'Event', value: 30000000, trend: 'up' },
  { name: 'Halo', category: 'Accessories', rarity: 'Event', value: 25000000, trend: 'stable' },
  { name: 'Marine Cape', category: 'Accessories', rarity: 'Rare', value: 1000000, trend: 'stable' },
  { name: 'Pirate Cape', category: 'Accessories', rarity: 'Rare', value: 1200000, trend: 'up' },
  { name: 'Sky Ring', category: 'Accessories', rarity: 'Epic', value: 3000000, trend: 'stable' },

  // Event Items
  { name: 'Elo Hammer', category: 'Event Items', rarity: 'Event', value: 45000000, trend: 'up' },
  { name: 'Candy Cane', category: 'Event Items', rarity: 'Event', value: 35000000, trend: 'stable' },
  { name: 'Pumpkin Head', category: 'Event Items', rarity: 'Event', value: 20000000, trend: 'down' },
  { name: 'Bunny Ears', category: 'Event Items', rarity: 'Event', value: 15000000, trend: 'stable' },

  // Boats
  { name: 'Dinghy', category: 'Boats', rarity: 'Common', value: 10000, trend: 'stable' },
  { name: 'Caravel', category: 'Boats', rarity: 'Uncommon', value: 100000, trend: 'stable' },
  { name: 'Galleon', category: 'Boats', rarity: 'Rare', value: 500000, trend: 'up' },
  { name: 'Marine Battleship', category: 'Boats', rarity: 'Epic', value: 2000000, trend: 'stable' },
  { name: 'Coffin Boat', category: 'Boats', rarity: 'Legendary', value: 10000000, trend: 'up' },

  // Outfits
  { name: 'Warlord Coat', category: 'Outfits', rarity: 'Legendary', value: 8000000, trend: 'stable' },
  { name: 'Admiral Coat', category: 'Outfits', rarity: 'Epic', value: 4000000, trend: 'up' },
  { name: 'Marine Suit', category: 'Outfits', rarity: 'Rare', value: 500000, trend: 'stable' },
  { name: 'Pirate Outfit', category: 'Outfits', rarity: 'Uncommon', value: 100000, trend: 'stable' },

  // Consumables
  { name: 'Golden Apple', category: 'Consumables', rarity: 'Rare', value: 200000, trend: 'stable' },
  { name: 'Elixir', category: 'Consumables', rarity: 'Epic', value: 1000000, trend: 'up' },
  { name: 'Devil Fruit Reset', category: 'Consumables', rarity: 'Legendary', value: 5000000, trend: 'stable' },

  // Unobtainables
  { name: 'Sword of Time', category: 'Unobtainables', rarity: 'Mythical', value: 500000000, trend: 'up' },
  { name: 'Dragon Tamer', category: 'Unobtainables', rarity: 'Mythical', value: 350000000, trend: 'stable' },
  { name: 'OG Marine Cape', category: 'Unobtainables', rarity: 'Legendary', value: 100000000, trend: 'up' }
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

    // Calculate value based on trend
    let variance = (Math.random() - 0.5) * 0.1; // ±5% random variance
    let trendFactor = 0;

    if (trend === 'up') {
      trendFactor = (30 - i) * 0.01; // 1% increase per day
    } else if (trend === 'down') {
      trendFactor = -(30 - i) * 0.005; // 0.5% decrease per day
    }

    const historicalValue = Math.round(currentValue * (1 - trendFactor + variance));

    points.push({
      id: uuidv4(),
      item_id: itemId,
      value: Math.max(historicalValue, 1000), // Minimum value
      recorded_at: date.toISOString().replace('T', ' ').split('.')[0],
      note: i === 0 ? 'Current value' : null
    });
  }

  return points;
}

for (const item of items) {
  const itemId = uuidv4();
  const categoryId = getCategoryId(item.category);
  const isUnobtainable = item.category === 'Unobtainables' ? 1 : 0;

  insertItem.run(
    itemId,
    item.name,
    `A ${item.rarity.toLowerCase()} ${item.category.toLowerCase().slice(0, -1)} from the world of One Piece.`,
    categoryId,
    item.rarity,
    item.value,
    item.trend,
    isUnobtainable
  );

  // Generate and insert value history
  const history = generateHistory(itemId, item.value, item.trend);
  for (const point of history) {
    insertHistory.run(point.id, point.item_id, point.value, point.recorded_at, point.note);
  }
}

console.log(`✅ Created ${items.length} items with historical data`);
console.log('🏴‍☠️ Database seeding complete!');
