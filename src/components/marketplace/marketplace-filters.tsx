'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Gamepad2, 
  User, 
  DollarSign,
  CheckCircle,
  ShoppingCart,
  XCircle,
  Clock
} from 'lucide-react';

type Game = {
  id: string;
  title: string;
  slug: string;
  coverImage?: {
    id: string;
    path: string;
  };
};

type MarketplaceFiltersProps = {
  currentType?: string;
  currentGameId?: string;
  currentSellerId?: string;
  currentStatus?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
};

export function MarketplaceFilters({
  currentType,
  currentGameId,
  currentSellerId,
  currentStatus = 'ACTIVE',
  currentMinPrice,
  currentMaxPrice,
}: MarketplaceFiltersProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || '');
  
  const [expandedType, setExpandedType] = useState(true);
  const [expandedGames, setExpandedGames] = useState(true);
  const [expandedStatus, setExpandedStatus] = useState(true);
  const [expandedPrice, setExpandedPrice] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/games?limit=50');
        
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        
        const data = await response.json();
        setGames(data.data || []);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    const params = new URLSearchParams(window.location.search);
    params.set('search', searchTerm.trim());
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceFilter = () => {
    const params = new URLSearchParams(window.location.search);
    
    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    
    router.push(pathname);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded-md"></div>
        <div className="h-40 bg-muted rounded-md"></div>
        <div className="h-40 bg-muted rounded-md"></div>
        <div className="h-20 bg-muted rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <button
            type="submit"
            className="absolute right-2 top-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded hover:bg-primary/20 transition-colors"
          >
            {t('common.search')}
          </button>
        </form>
      </div>

      {/* Listing Type */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedType(!expandedType)}
        >
          <div className="flex items-center">
            <Tag className="w-4 h-4 mr-2 text-primary" />
            <h3 className="font-medium">Listing Type</h3>
          </div>
          {expandedType ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
        
        {expandedType && (
          <div className="mt-2 space-y-1">
            <Link
              href="/marketplace"
              className={`flex items-center justify-between py-1 px-2 text-sm rounded-md transition-colors ${
                !currentType
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-primary/5'
              }`}
            >
              <span>All Types</span>
            </Link>
            <Link
              href="/marketplace?type=GAME_LICENSE"
              className={`flex items-center justify-between py-1 px-2 text-sm rounded-md transition-colors ${
                currentType === 'GAME_LICENSE'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-primary/5'
              }`}
            >
              <span>Game Licenses</span>
            </Link>
            <Link
              href="/marketplace?type=GAME_ITEM"
              className={`flex items-center justify-between py-1 px-2 text-sm rounded-md transition-colors ${
                currentType === 'GAME_ITEM'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-primary/5'
              }`}
            >
              <span>Game Items</span>
            </Link>
            <Link
              href="/marketplace?type=BUNDLE"
              className={`flex items-center justify-between py-1 px-2 text-sm rounded-md transition-colors ${
                currentType === 'BUNDLE'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-primary/5'
              }`}
            >
              <span>Bundles</span>
            </Link>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedStatus(!expandedStatus)}
        >
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-primary" />
            <h3 className="font-medium">Status</h3>
          </div>
          {expandedStatus ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
        
        {expandedStatus && (
          <div className="mt-2 space-y-1">
            <Link
              href={`/marketplace?status=ACTIVE${currentType ? `&type=${currentType}` : ''}`}
              className={`flex items-center py-1 px-2 text-sm rounded-md transition-colors ${
                currentStatus === 'ACTIVE'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-primary/5'
              }`}
            >
              <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
              <span>Active</span>
            </Link>
            <Link
              href={`/marketplace?status=SOLD${currentType ? `&type=${currentType}` : ''}`}
              className={`flex items-center py-1 px-2 text-sm rounded-md transition-colors ${
                currentStatus === 'SOLD'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-primary/5'
              }`}
            >
              <ShoppingCart className="w-3 h-3 mr-2 text-primary" />
              <span>Sold</span>
            </Link>
            <Link
              href={`/marketplace?status=CANCELLED${currentType ? `&type=${currentType}` : ''}`}
              className={`flex items-center py-1 px-2 text-sm rounded-md transition-colors ${
                currentStatus === 'CANCELLED'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-primary/5'
              }`}
            >
              <XCircle className="w-3 h-3 mr-2 text-destructive" />
              <span>Cancelled</span>
            </Link>
            <Link
              href={`/marketplace?status=EXPIRED${currentType ? `&type=${currentType}` : ''}`}
              className={`flex items-center py-1 px-2 text-sm rounded-md transition-colors ${
                currentStatus === 'EXPIRED'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-primary/5'
              }`}
            >
              <Clock className="w-3 h-3 mr-2 text-muted-foreground" />
              <span>Expired</span>
            </Link>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedPrice(!expandedPrice)}
        >
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-primary" />
            <h3 className="font-medium">Price Range (SOL)</h3>
          </div>
          {expandedPrice ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
        
        {expandedPrice && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                min="0"
                step="0.01"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                min="0"
                step="0.01"
              />
            </div>
            <button
              onClick={handlePriceFilter}
              className="w-full px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Games */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedGames(!expandedGames)}
        >
          <div className="flex items-center">
            <Gamepad2 className="w-4 h-4 mr-2 text-primary" />
            <h3 className="font-medium">Games</h3>
          </div>
          {expandedGames ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
        
        {expandedGames && (
          <div className="mt-2 space-y-1 max-h-60 overflow-y-auto pr-2">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/marketplace?gameId=${game.id}${currentType ? `&type=${currentType}` : ''}`}
                className={`flex items-center justify-between py-1 px-2 text-sm rounded-md transition-colors ${
                  currentGameId === game.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-primary/5'
                }`}
              >
                <span>{game.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {(currentType || currentGameId || currentSellerId || currentStatus !== 'ACTIVE' || currentMinPrice || currentMaxPrice) && (
        <button
          onClick={clearFilters}
          className="flex items-center justify-center w-full px-3 py-2 text-sm bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors"
        >
          <X className="w-4 h-4 mr-1" />
          Clear Filters
        </button>
      )}
    </div>
  );
}