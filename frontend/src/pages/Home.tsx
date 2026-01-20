import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { itemsApi, categoriesApi } from '../utils/api';
import { Item, Category } from '../types';
import ItemCard from '../components/items/ItemCard';
import Loading from '../components/ui/Loading';
import { Search, ChevronRight, Gem, Swords, Crown } from 'lucide-react';

export default function Home() {
  const [trendingItems, setTrendingItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, categoriesRes] = await Promise.all([
          itemsApi.getAll({ sort: 'value_high' }),
          categoriesApi.getAll(),
        ]);
        setTrendingItems(itemsRes.data.items.slice(0, 8));
        setCategories(categoriesRes.data.categories);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loading message="Loading..." />;
  }

  return (
    <div>
      {/* Hero - Simple */}
      <section className="py-12 sm:py-16">
        <div className="page-container">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              GPO Value List
            </h1>
            <p className="text-ocean-300 text-lg mb-6">
              Check the latest values for all Grand Piece Online items.
              Fruits, weapons, accessories and more.
            </p>
            <Link to="/catalog" className="btn-primary inline-flex items-center gap-2">
              <Search className="w-5 h-5" />
              Browse All Items
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats - Real data only */}
      <section className="py-8 border-y border-ocean-800">
        <div className="page-container">
          <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
            <div className="flex items-center gap-3">
              <Gem className="w-6 h-6 text-mythical" />
              <div>
                <p className="text-white font-semibold">{trendingItems.length}+ Items</p>
                <p className="text-ocean-400 text-sm">In database</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Swords className="w-6 h-6 text-legendary" />
              <div>
                <p className="text-white font-semibold">{categories.length} Categories</p>
                <p className="text-ocean-400 text-sm">Organized</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-gold-400" />
              <div>
                <p className="text-white font-semibold">Updated Daily</p>
                <p className="text-ocean-400 text-sm">Fresh values</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Value Items */}
      <section className="py-12">
        <div className="page-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Highest Value Items</h2>
            <Link
              to="/catalog?sort=value_high"
              className="flex items-center gap-1 text-gold-400 hover:text-gold-300 text-sm"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-ocean-900/50">
        <div className="page-container">
          <h2 className="text-xl font-bold text-white mb-6">Categories</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.id}`}
                className="bg-ocean-800/50 hover:bg-ocean-800 border border-ocean-700 hover:border-ocean-600 rounded-lg p-4 transition-colors"
              >
                <h3 className="font-medium text-white mb-1">{category.name}</h3>
                <p className="text-ocean-400 text-sm">
                  {category.item_count || 0} items
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trade Calculator CTA - Simpler */}
      <section className="py-12">
        <div className="page-container">
          <div className="bg-ocean-800/50 border border-ocean-700 rounded-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Trade Calculator
                </h2>
                <p className="text-ocean-400">
                  Compare item values to check if a trade is fair
                </p>
              </div>
              <Link to="/trade" className="btn-secondary whitespace-nowrap">
                Open Calculator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
