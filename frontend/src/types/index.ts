export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt?: string;
  lastLogin?: string;
  lastTradeCompare?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isBanned: boolean;
  banReason?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  item_count?: number;
  created_at: string;
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical' | 'Event';
export type Trend = 'up' | 'down' | 'stable';

export interface Item {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  category_name?: string;
  rarity: Rarity;
  current_value: number;
  image_path: string | null;
  trend: Trend;
  is_tradeable: number;
  is_unobtainable: number;
  created_at: string;
  updated_at: string;
}

export interface ValueHistory {
  id: string;
  item_id: string;
  value: number;
  recorded_at: string;
  note: string | null;
}

export interface TradeResult {
  result: 'WIN' | 'FAIR' | 'LOSE';
  valueGiven: number;
  valueReceived: number;
  difference: number;
  percentDiff: number;
  itemsGiven: (Item & { quantity: number })[];
  itemsReceived: (Item & { quantity: number })[];
}

export interface CooldownStatus {
  cooldownActive: boolean;
  remainingSeconds: number;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  is_admin: number;
  is_banned: number;
  ban_reason: string | null;
  created_at: string;
  last_login: string | null;
}

export interface ApiError {
  error: string;
  message?: string;
  reason?: string;
}
