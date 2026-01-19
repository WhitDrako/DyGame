import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { Item } from '../../types';
import {
  formatValue,
  getRarityClass,
  getRarityColor,
  getImageUrl,
} from '../../utils/helpers';

interface ItemCardProps {
  item: Item;
  showCategory?: boolean;
}

export default function ItemCard({ item, showCategory = true }: ItemCardProps) {
  const getTrendIcon = () => {
    switch (item.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-ocean-400" />;
    }
  };

  return (
    <Link to={`/item/${item.id}`}>
      <div className="card card-hover p-4 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-ocean-800 rounded-lg overflow-hidden mb-3">
          {item.image_path ? (
            <img
              src={getImageUrl(item.image_path)}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles
                className="w-12 h-12"
                style={{ color: getRarityColor(item.rarity) }}
              />
            </div>
          )}

          {/* Rarity badge */}
          <span
            className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getRarityClass(
              item.rarity
            )}`}
          >
            {item.rarity}
          </span>

          {/* Unobtainable badge */}
          {item.is_unobtainable === 1 && (
            <span className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              Unobtainable
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold text-white truncate mb-1">{item.name}</h3>

          {showCategory && item.category_name && (
            <p className="text-ocean-400 text-sm mb-2">{item.category_name}</p>
          )}

          {/* Value and trend */}
          <div className="mt-auto flex items-center justify-between">
            <span className="text-gold-400 font-bold text-lg">
              {formatValue(item.current_value)}
            </span>
            <div className="flex items-center gap-1">{getTrendIcon()}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
