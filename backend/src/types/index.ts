export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  is_admin: number;
  is_banned: number;
  ban_reason: string | null;
  created_at: string;
  last_login: string | null;
  last_trade_compare: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical' | 'Event';
  current_value: number;
  image_path: string | null;
  trend: 'up' | 'down' | 'stable';
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

export interface TradeLog {
  id: string;
  user_id: string;
  items_given: string;
  items_received: string;
  result: 'WIN' | 'FAIR' | 'LOSE';
  value_given: number;
  value_received: number;
  created_at: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  isAdmin: boolean;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
