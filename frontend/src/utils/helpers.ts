import { Rarity, Trend } from '../types';

// Format large numbers with K, M, B suffixes
export function formatValue(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

// Format number with commas
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

// Get rarity CSS class
export function getRarityClass(rarity: Rarity): string {
  return `rarity-${rarity.toLowerCase()}`;
}

// Get rarity background color
export function getRarityBgColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    Common: 'rgba(158, 158, 158, 0.2)',
    Uncommon: 'rgba(76, 175, 80, 0.2)',
    Rare: 'rgba(33, 150, 243, 0.2)',
    Epic: 'rgba(156, 39, 176, 0.2)',
    Legendary: 'rgba(255, 152, 0, 0.2)',
    Mythical: 'rgba(233, 30, 99, 0.2)',
    Event: 'rgba(0, 188, 212, 0.2)',
  };
  return colors[rarity] || colors.Common;
}

// Get rarity text color
export function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    Common: '#9e9e9e',
    Uncommon: '#4caf50',
    Rare: '#2196f3',
    Epic: '#9c27b0',
    Legendary: '#ff9800',
    Mythical: '#e91e63',
    Event: '#00bcd4',
  };
  return colors[rarity] || colors.Common;
}

// Get trend icon and color
export function getTrendInfo(trend: Trend): { icon: string; color: string; label: string } {
  switch (trend) {
    case 'up':
      return { icon: '↑', color: '#4caf50', label: 'Rising' };
    case 'down':
      return { icon: '↓', color: '#f44336', label: 'Falling' };
    default:
      return { icon: '→', color: '#9e9e9e', label: 'Stable' };
  }
}

// Get trend CSS class
export function getTrendClass(trend: Trend): string {
  return `trend-${trend}`;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format datetime for display
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format time ago
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateString);
}

// Calculate trade result class
export function getTradeResultClass(result: 'WIN' | 'FAIR' | 'LOSE'): string {
  switch (result) {
    case 'WIN':
      return 'trade-win';
    case 'FAIR':
      return 'trade-fair';
    case 'LOSE':
      return 'trade-lose';
  }
}

// Get image URL or placeholder
export function getImageUrl(imagePath: string | null): string {
  if (!imagePath) {
    return '/placeholder-item.svg';
  }
  // If it's a relative path, prepend API base
  if (imagePath.startsWith('/uploads')) {
    return imagePath;
  }
  return imagePath;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
