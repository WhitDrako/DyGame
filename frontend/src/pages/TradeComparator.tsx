import { useEffect, useState } from 'react';
import { itemsApi, tradeApi } from '../utils/api';
import { Item, TradeResult, CooldownStatus } from '../types';
import Loading from '../components/ui/Loading';
import {
  Scale,
  Plus,
  X,
  ArrowRight,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  formatValue,
  formatNumber,
  getRarityClass,
  getRarityColor,
  getImageUrl,
} from '../utils/helpers';

interface SelectedItem {
  item: Item;
  quantity: number;
}

export default function TradeComparator() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchGive, setSearchGive] = useState('');
  const [searchReceive, setSearchReceive] = useState('');
  const [itemsGiven, setItemsGiven] = useState<SelectedItem[]>([]);
  const [itemsReceived, setItemsReceived] = useState<SelectedItem[]>([]);
  const [result, setResult] = useState<TradeResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [cooldown, setCooldown] = useState<CooldownStatus>({ cooldownActive: false, remainingSeconds: 0 });

  // Fetch items and cooldown status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, cooldownRes] = await Promise.all([
          itemsApi.getAll({ sort: 'name' }),
          tradeApi.getCooldown(),
        ]);
        setItems(itemsRes.data.items);
        setCooldown(cooldownRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown.cooldownActive && cooldown.remainingSeconds > 0) {
      const interval = setInterval(() => {
        setCooldown((prev) => {
          const newSeconds = prev.remainingSeconds - 1;
          if (newSeconds <= 0) {
            clearInterval(interval);
            return { cooldownActive: false, remainingSeconds: 0 };
          }
          return { ...prev, remainingSeconds: newSeconds };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [cooldown.cooldownActive]);

  // Filter items based on search
  const filteredGiveItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchGive.toLowerCase())
  );

  const filteredReceiveItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchReceive.toLowerCase())
  );

  // Add item to give list
  const addItemToGive = (item: Item) => {
    const existing = itemsGiven.find((i) => i.item.id === item.id);
    if (existing) {
      setItemsGiven(
        itemsGiven.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setItemsGiven([...itemsGiven, { item, quantity: 1 }]);
    }
    setSearchGive('');
  };

  // Add item to receive list
  const addItemToReceive = (item: Item) => {
    const existing = itemsReceived.find((i) => i.item.id === item.id);
    if (existing) {
      setItemsReceived(
        itemsReceived.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setItemsReceived([...itemsReceived, { item, quantity: 1 }]);
    }
    setSearchReceive('');
  };

  // Remove item from give list
  const removeItemFromGive = (itemId: string) => {
    setItemsGiven(itemsGiven.filter((i) => i.item.id !== itemId));
  };

  // Remove item from receive list
  const removeItemFromReceive = (itemId: string) => {
    setItemsReceived(itemsReceived.filter((i) => i.item.id !== itemId));
  };

  // Update quantity
  const updateGiveQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItemFromGive(itemId);
      return;
    }
    setItemsGiven(
      itemsGiven.map((i) => (i.item.id === itemId ? { ...i, quantity } : i))
    );
  };

  const updateReceiveQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItemFromReceive(itemId);
      return;
    }
    setItemsReceived(
      itemsReceived.map((i) => (i.item.id === itemId ? { ...i, quantity } : i))
    );
  };

  // Calculate totals
  const totalGiven = itemsGiven.reduce(
    (sum, i) => sum + i.item.current_value * i.quantity,
    0
  );
  const totalReceived = itemsReceived.reduce(
    (sum, i) => sum + i.item.current_value * i.quantity,
    0
  );

  // Compare trade
  const compareTrade = async () => {
    if (itemsGiven.length === 0 && itemsReceived.length === 0) return;

    setIsComparing(true);
    try {
      const res = await tradeApi.compare(
        itemsGiven.map((i) => ({ id: i.item.id, quantity: i.quantity })),
        itemsReceived.map((i) => ({ id: i.item.id, quantity: i.quantity }))
      );
      setResult(res.data);
      // Start cooldown
      setCooldown({ cooldownActive: true, remainingSeconds: 120 });
    } catch (error: any) {
      if (error.response?.status === 429) {
        setCooldown({
          cooldownActive: true,
          remainingSeconds: error.response.data.remainingSeconds,
        });
      }
    } finally {
      setIsComparing(false);
    }
  };

  // Reset trade
  const resetTrade = () => {
    setItemsGiven([]);
    setItemsReceived([]);
    setResult(null);
  };

  // Format cooldown time
  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <Loading message="Loading..." />;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Trade Calculator</h1>
        <p className="text-ocean-400">
          Check if a trade is fair by comparing item values
        </p>
      </div>

      {/* Cooldown warning */}
      {cooldown.cooldownActive && (
        <div className="bg-ocean-800/50 border border-ocean-700 rounded-lg p-4 mb-6 flex items-center gap-4">
          <Clock className="w-5 h-5 text-gold-400" />
          <p className="text-ocean-300 text-sm">
            Wait{' '}
            <span className="text-gold-400 font-mono">
              {formatCooldown(cooldown.remainingSeconds)}
            </span>
            {' '}before comparing again
          </p>
        </div>
      )}

      {/* Trade comparison grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">
        {/* Items You Give */}
        <div className="lg:col-span-3">
          <div className="card p-6 h-full">
            <h2 className="text-xl font-semibold text-white mb-4">You Give</h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
              <input
                type="text"
                value={searchGive}
                onChange={(e) => setSearchGive(e.target.value)}
                placeholder="Search items to add..."
                className="input pl-10"
              />
              {searchGive && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-ocean-800 border border-ocean-600 rounded-lg max-h-60 overflow-y-auto z-10">
                  {filteredGiveItems.length === 0 ? (
                    <p className="p-4 text-ocean-400 text-center">No items found</p>
                  ) : (
                    filteredGiveItems.slice(0, 10).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => addItemToGive(item)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-ocean-700 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-ocean-700 rounded-lg flex items-center justify-center">
                          {item.image_path ? (
                            <img
                              src={getImageUrl(item.image_path)}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Sparkles
                              className="w-5 h-5"
                              style={{ color: getRarityColor(item.rarity) }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{item.name}</p>
                          <p className="text-gold-400 text-sm">
                            {formatValue(item.current_value)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getRarityClass(
                            item.rarity
                          )}`}
                        >
                          {item.rarity}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected items */}
            <div className="space-y-3 min-h-[200px]">
              {itemsGiven.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-ocean-400">
                  <Plus className="w-8 h-8 mb-2" />
                  <p>Add items you're giving</p>
                </div>
              ) : (
                itemsGiven.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-ocean-800/50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-ocean-700 rounded-lg flex items-center justify-center">
                      {item.image_path ? (
                        <img
                          src={getImageUrl(item.image_path)}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Sparkles
                          className="w-6 h-6"
                          style={{ color: getRarityColor(item.rarity) }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.name}</p>
                      <p className="text-gold-400 text-sm">
                        {formatValue(item.current_value * quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateGiveQuantity(item.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-ocean-700 rounded hover:bg-ocean-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-white">{quantity}</span>
                      <button
                        onClick={() => updateGiveQuantity(item.id, quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-ocean-700 rounded hover:bg-ocean-600 transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItemFromGive(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-ocean-700">
              <div className="flex items-center justify-between">
                <span className="text-ocean-400">Total Value</span>
                <span className="text-xl font-bold text-red-400">
                  -{formatNumber(totalGiven)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Arrow and Compare Button */}
        <div className="lg:col-span-1 flex lg:flex-col items-center justify-center gap-4 py-4">
          <div className="w-16 h-16 bg-ocean-800 rounded-full flex items-center justify-center border border-ocean-600">
            <ArrowRight className="w-8 h-8 text-gold-400 lg:rotate-0 rotate-90" />
          </div>
        </div>

        {/* Items You Receive */}
        <div className="lg:col-span-3">
          <div className="card p-6 h-full">
            <h2 className="text-xl font-semibold text-white mb-4">You Receive</h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
              <input
                type="text"
                value={searchReceive}
                onChange={(e) => setSearchReceive(e.target.value)}
                placeholder="Search items to add..."
                className="input pl-10"
              />
              {searchReceive && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-ocean-800 border border-ocean-600 rounded-lg max-h-60 overflow-y-auto z-10">
                  {filteredReceiveItems.length === 0 ? (
                    <p className="p-4 text-ocean-400 text-center">No items found</p>
                  ) : (
                    filteredReceiveItems.slice(0, 10).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => addItemToReceive(item)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-ocean-700 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-ocean-700 rounded-lg flex items-center justify-center">
                          {item.image_path ? (
                            <img
                              src={getImageUrl(item.image_path)}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Sparkles
                              className="w-5 h-5"
                              style={{ color: getRarityColor(item.rarity) }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{item.name}</p>
                          <p className="text-gold-400 text-sm">
                            {formatValue(item.current_value)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getRarityClass(
                            item.rarity
                          )}`}
                        >
                          {item.rarity}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected items */}
            <div className="space-y-3 min-h-[200px]">
              {itemsReceived.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-ocean-400">
                  <Plus className="w-8 h-8 mb-2" />
                  <p>Add items you're receiving</p>
                </div>
              ) : (
                itemsReceived.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-ocean-800/50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-ocean-700 rounded-lg flex items-center justify-center">
                      {item.image_path ? (
                        <img
                          src={getImageUrl(item.image_path)}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Sparkles
                          className="w-6 h-6"
                          style={{ color: getRarityColor(item.rarity) }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.name}</p>
                      <p className="text-gold-400 text-sm">
                        {formatValue(item.current_value * quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateReceiveQuantity(item.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-ocean-700 rounded hover:bg-ocean-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-white">{quantity}</span>
                      <button
                        onClick={() => updateReceiveQuantity(item.id, quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-ocean-700 rounded hover:bg-ocean-600 transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItemFromReceive(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-ocean-700">
              <div className="flex items-center justify-between">
                <span className="text-ocean-400">Total Value</span>
                <span className="text-xl font-bold text-green-400">
                  +{formatNumber(totalReceived)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compare button and result */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-4">
          <button
            onClick={resetTrade}
            className="btn-secondary"
            disabled={itemsGiven.length === 0 && itemsReceived.length === 0}
          >
            Reset
          </button>
          <button
            onClick={compareTrade}
            disabled={
              cooldown.cooldownActive ||
              isComparing ||
              (itemsGiven.length === 0 && itemsReceived.length === 0)
            }
            className="btn-primary flex items-center gap-2 px-8"
          >
            {isComparing ? (
              <>
                <div className="w-5 h-5 border-2 border-ocean-900 border-t-transparent rounded-full animate-spin"></div>
                Comparing...
              </>
            ) : cooldown.cooldownActive ? (
              <>
                <Clock className="w-5 h-5" />
                Wait {formatCooldown(cooldown.remainingSeconds)}
              </>
            ) : (
              <>
                <Scale className="w-5 h-5" />
                Compare Trade
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="card p-8 max-w-md w-full animate-in">
            <div className="text-center">
              {/* Result icon */}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  result.result === 'WIN'
                    ? 'bg-green-500/20'
                    : result.result === 'FAIR'
                    ? 'bg-gold-500/20'
                    : 'bg-red-500/20'
                }`}
              >
                {result.result === 'WIN' ? (
                  <Trophy className="w-10 h-10 text-green-400" />
                ) : result.result === 'FAIR' ? (
                  <ThumbsUp className="w-10 h-10 text-gold-400" />
                ) : (
                  <ThumbsDown className="w-10 h-10 text-red-400" />
                )}
              </div>

              {/* Result text */}
              <h3
                className={`text-3xl font-display font-bold mb-2 ${
                  result.result === 'WIN'
                    ? 'text-green-400'
                    : result.result === 'FAIR'
                    ? 'text-gold-400'
                    : 'text-red-400'
                }`}
              >
                {result.result}
              </h3>

              <p className="text-ocean-400 mb-6">
                {result.result === 'WIN'
                  ? "Great trade! You're getting more value."
                  : result.result === 'FAIR'
                  ? "Fair trade! Values are roughly equal."
                  : "Bad trade! You're losing value."}
              </p>

              {/* Value breakdown */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-ocean-800/50 rounded-lg">
                  <p className="text-ocean-400 mb-1">You Give</p>
                  <p className="text-red-400 font-bold text-lg">
                    -{formatValue(result.valueGiven)}
                  </p>
                </div>
                <div className="p-4 bg-ocean-800/50 rounded-lg">
                  <p className="text-ocean-400 mb-1">You Receive</p>
                  <p className="text-green-400 font-bold text-lg">
                    +{formatValue(result.valueReceived)}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-ocean-800/50 rounded-lg">
                <p className="text-ocean-400 mb-1">Difference</p>
                <p
                  className={`font-bold text-xl ${
                    result.difference >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {result.difference >= 0 ? '+' : ''}
                  {formatValue(result.difference)} ({result.percentDiff >= 0 ? '+' : ''}
                  {result.percentDiff}%)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
