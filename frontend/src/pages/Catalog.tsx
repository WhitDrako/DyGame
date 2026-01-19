import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemsApi, categoriesApi } from '../utils/api';
import { Item, Category, Rarity } from '../types';
import ItemCard from '../components/items/ItemCard';
import Loading from '../components/ui/Loading';
import { Search, Filter, Grid, X } from 'lucide-react';
import { debounce } from '../utils/helpers';

const RARITIES: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical', 'Event'];
const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'value_high', label: 'Value: High to Low' },
  { value: 'value_low', label: 'Value: Low to High' },
  { value: 'name', label: 'Name: A to Z' },
  { value: 'rarity', label: 'Rarity' },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [rarity, setRarity] = useState(searchParams.get('rarity') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'updated');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        setCategories(res.data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set('search', value);
        } else {
          params.delete('search');
        }
        setSearchParams(params);
      }, 300),
    [searchParams, setSearchParams]
  );

  // Update URL params when filters change
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  // Fetch items when filters change
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const res = await itemsApi.getAll({
          category: searchParams.get('category') || undefined,
          rarity: searchParams.get('rarity') || undefined,
          search: searchParams.get('search') || undefined,
          sort: searchParams.get('sort') || 'updated',
        });
        setItems(res.data.items);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [searchParams]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setRarity('');
    setSort('updated');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = search || category || rarity || sort !== 'updated';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">
          <Grid className="w-8 h-8 text-gold-400" />
          Item Catalog
        </h1>
        <p className="text-ocean-400">
          Browse and search through all Grand Piece Online items
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                debouncedSearch(e.target.value);
              }}
              placeholder="Search items..."
              className="input pl-10"
            />
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-secondary flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-gold-400 rounded-full"></span>
            )}
          </button>

          {/* Desktop filters */}
          <div className="hidden lg:flex items-center gap-4">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                updateFilters('category', e.target.value);
              }}
              className="select min-w-[160px]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={rarity}
              onChange={(e) => {
                setRarity(e.target.value);
                updateFilters('rarity', e.target.value);
              }}
              className="select min-w-[140px]"
            >
              <option value="">All Rarities</option>
              {RARITIES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                updateFilters('sort', e.target.value);
              }}
              className="select min-w-[180px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 text-ocean-400 hover:text-white hover:bg-ocean-700 rounded-lg transition-colors"
                title="Clear filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile filters */}
        {showFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-ocean-700 space-y-4">
            <div>
              <label className="label">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  updateFilters('category', e.target.value);
                }}
                className="select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Rarity</label>
              <select
                value={rarity}
                onChange={(e) => {
                  setRarity(e.target.value);
                  updateFilters('rarity', e.target.value);
                }}
                className="select"
              >
                <option value="">All Rarities</option>
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Sort By</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  updateFilters('sort', e.target.value);
                }}
                className="select"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-ocean-400">
          {isLoading ? 'Loading...' : `${items.length} items found`}
        </p>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <Loading message="Loading items..." />
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <Search className="w-12 h-12 text-ocean-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
          <p className="text-ocean-400 mb-4">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
