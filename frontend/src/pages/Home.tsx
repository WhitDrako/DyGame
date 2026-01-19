import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemsApi, categoriesApi } from '../utils/api';
import { Item, Category } from '../types';
import ItemCard from '../components/items/ItemCard';
import Loading from '../components/ui/Loading';
import {
  Anchor,
  TrendingUp,
  Scale,
  Sparkles,
  ChevronRight,
  Star,
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
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
    return <Loading message="Loading the Grand Line..." />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="page-container relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-800/50 rounded-full border border-ocean-600/30 mb-6">
              <Star className="w-4 h-4 text-gold-400" />
              <span className="text-ocean-200 text-sm">Welcome back, {user?.username}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="text-white">Navigate the </span>
              <span className="text-gradient-gold">Grand Line</span>
              <span className="text-white"> of Trading</span>
            </h1>

            <p className="text-ocean-300 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
              Track item values, compare trades, and make informed decisions in
              the world of Grand Piece Online.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/catalog" className="btn-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Browse Catalog
              </Link>
              <Link to="/trade" className="btn-secondary flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Trade Comparator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-ocean-700/30">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Items', value: trendingItems.length + '+', icon: Anchor },
              { label: 'Categories', value: categories.length, icon: Sparkles },
              { label: 'Active Traders', value: '1000+', icon: TrendingUp },
              { label: 'Trades Today', value: '500+', icon: Scale },
            ].map((stat, index) => (
              <div
                key={index}
                className="card p-6 text-center hover:border-gold-500/30 transition-colors"
              >
                <stat.icon className="w-8 h-8 text-gold-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-ocean-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Items Section */}
      <section className="py-16">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">
              <TrendingUp className="w-8 h-8 text-gold-400" />
              Top Value Items
            </h2>
            <Link
              to="/catalog"
              className="flex items-center gap-1 text-gold-400 hover:text-gold-300 transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {trendingItems.map((item, index) => (
              <div
                key={item.id}
                className={`animate-in stagger-${Math.min(index + 1, 5)}`}
                style={{ opacity: 0 }}
              >
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-ocean-900/30">
        <div className="page-container">
          <h2 className="section-title mb-8">
            <Sparkles className="w-8 h-8 text-gold-400" />
            Browse Categories
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.id}`}
                className="card card-hover p-6 text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gold-400/20 to-gold-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Anchor className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                <p className="text-ocean-400 text-sm">
                  {category.item_count || 0} items
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="page-container">
          <div className="card p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent"></div>

            <div className="relative z-10">
              <Scale className="w-16 h-16 text-gold-400 mx-auto mb-6" />
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
                Ready to Make a Trade?
              </h2>
              <p className="text-ocean-300 mb-8 max-w-xl mx-auto">
                Use our trade comparator to analyze any trade before you make it.
                Know exactly if you're getting a WIN, FAIR, or LOSE deal.
              </p>
              <Link to="/trade" className="btn-primary inline-flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Open Trade Comparator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
