import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { itemsApi } from '../utils/api';
import { Item, ValueHistory } from '../types';
import Loading from '../components/ui/Loading';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Sparkles,
  Clock,
  Tag,
} from 'lucide-react';
import {
  formatValue,
  formatNumber,
  formatDate,
  formatDateTime,
  getRarityClass,
  getRarityColor,
  getImageUrl,
} from '../utils/helpers';

const TIME_RANGES = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: 'all', label: 'All' },
];

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [history, setHistory] = useState<ValueHistory[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      try {
        const res = await itemsApi.getOne(id);
        setItem(res.data.item);
        setHistory(res.data.history);
      } catch (error) {
        console.error('Failed to fetch item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Fetch history when time range changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!id) return;

      setHistoryLoading(true);
      try {
        const res = await itemsApi.getHistory(id, timeRange === 'all' ? undefined : timeRange);
        setHistory(res.data.history);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [id, timeRange]);

  if (isLoading) {
    return <Loading message="Loading item details..." />;
  }

  if (!item) {
    return (
      <div className="page-container">
        <div className="card p-12 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Item Not Found</h2>
          <p className="text-ocean-400 mb-6">
            The item you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/catalog" className="btn-primary">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = history.map((h) => ({
    date: new Date(h.recorded_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    value: h.value,
    fullDate: h.recorded_at,
  }));

  // Calculate value change
  const firstValue = history[0]?.value || item.current_value;
  const valueChange = item.current_value - firstValue;
  const percentChange = firstValue > 0 ? ((valueChange / firstValue) * 100).toFixed(2) : '0';

  const getTrendIcon = () => {
    switch (item.trend) {
      case 'up':
        return <TrendingUp className="w-6 h-6 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-6 h-6 text-red-400" />;
      default:
        return <Minus className="w-6 h-6 text-ocean-400" />;
    }
  };

  return (
    <div className="page-container">
      {/* Back button */}
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-ocean-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Image and basic info */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            {/* Image */}
            <div className="aspect-square bg-ocean-800 rounded-xl overflow-hidden mb-6">
              {item.image_path ? (
                <img
                  src={getImageUrl(item.image_path)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles
                    className="w-24 h-24"
                    style={{ color: getRarityColor(item.rarity) }}
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <h1 className="text-2xl font-display font-bold text-white mb-2">
              {item.name}
            </h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getRarityClass(item.rarity)}`}>
                {item.rarity}
              </span>
              {item.category_name && (
                <span className="px-3 py-1 bg-ocean-700 text-ocean-200 rounded-lg text-sm">
                  {item.category_name}
                </span>
              )}
              {item.is_unobtainable === 1 && (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm">
                  Unobtainable
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-ocean-300 mb-6">{item.description}</p>
            )}

            {/* Value */}
            <div className="bg-ocean-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-ocean-400">Current Value</span>
                {getTrendIcon()}
              </div>
              <p className="text-3xl font-bold text-gold-400">
                {formatNumber(item.current_value)}
              </p>
              <p className="text-ocean-400 text-sm mt-1">
                {formatValue(item.current_value)} Beli
              </p>
            </div>
          </div>
        </div>

        {/* Right column - Chart and history */}
        <div className="lg:col-span-2">
          {/* Value chart */}
          <div className="card p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Value History</h2>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-medium ${
                      valueChange >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {valueChange >= 0 ? '+' : ''}
                    {formatValue(valueChange)} ({percentChange}%)
                  </span>
                  <span className="text-ocean-400 text-sm">
                    vs {TIME_RANGES.find((t) => t.value === timeRange)?.label}
                  </span>
                </div>
              </div>

              {/* Time range selector */}
              <div className="flex gap-2">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === range.value
                        ? 'bg-gold-500 text-ocean-900'
                        : 'bg-ocean-700 text-ocean-300 hover:bg-ocean-600'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="h-80">
              {historyLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="spinner"></div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-ocean-400">
                  No history data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#003366" />
                    <XAxis
                      dataKey="date"
                      stroke="#4da8ff"
                      tick={{ fill: '#4da8ff', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#4da8ff"
                      tick={{ fill: '#4da8ff', fontSize: 12 }}
                      tickFormatter={(value) => formatValue(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#001a33',
                        border: '1px solid #003366',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      labelStyle={{ color: '#ffd24d' }}
                      formatter={(value: number) => [formatNumber(value), 'Value']}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#ffd24d"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#ffd24d' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Item details */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Item Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-ocean-800/50 rounded-lg">
                <Tag className="w-5 h-5 text-gold-400" />
                <div>
                  <p className="text-ocean-400 text-sm">Category</p>
                  <p className="text-white font-medium">
                    {item.category_name || 'Uncategorized'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-ocean-800/50 rounded-lg">
                <Sparkles className="w-5 h-5 text-gold-400" />
                <div>
                  <p className="text-ocean-400 text-sm">Rarity</p>
                  <p className="text-white font-medium">{item.rarity}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-ocean-800/50 rounded-lg">
                <Calendar className="w-5 h-5 text-gold-400" />
                <div>
                  <p className="text-ocean-400 text-sm">Added</p>
                  <p className="text-white font-medium">{formatDate(item.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-ocean-800/50 rounded-lg">
                <Clock className="w-5 h-5 text-gold-400" />
                <div>
                  <p className="text-ocean-400 text-sm">Last Updated</p>
                  <p className="text-white font-medium">{formatDateTime(item.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
