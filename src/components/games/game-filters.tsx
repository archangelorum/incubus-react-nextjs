'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/components/i18n/i18n-provider';
import { 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Tag, 
  Building, 
  DollarSign 
} from 'lucide-react';

type Genre = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    games: number;
  };
};

type Tag = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    games: number;
  };
};

type Publisher = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    games: number;
  };
};

type GameFiltersProps = {
  currentGenre?: string;
  currentTag?: string;
  currentPublisher?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentFeatured?: boolean;
};

export function GameFilters({
  currentGenre,
  currentTag,
  currentPublisher,
  currentMinPrice,
  currentMaxPrice,
  currentFeatured,
}: GameFiltersProps) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || '');
  const [featured, setFeatured] = useState(currentFeatured || false);
  
  const [expandedGenres, setExpandedGenres] = useState(true);
  const [expandedTags, setExpandedTags] = useState(false);
  const [expandedPublishers, setExpandedPublishers] = useState(false);
  const [expandedPrice, setExpandedPrice] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        
        // Fetch genres, tags, and publishers in parallel
        const [genresRes, tagsRes, publishersRes] = await Promise.all([
          fetch('/api/genres'),
          fetch('/api/tags'),
          fetch('/api/publishers')
        ]);
        
        if (!genresRes.ok || !tagsRes.ok || !publishersRes.ok) {
          throw new Error('Failed to fetch filters');
        }
        
        const genresData = await genresRes.json();
        const tagsData = await tagsRes.json();
        const publishersData = await publishersRes.json();
        
        setGenres(genresData.data || []);
        setTags(tagsData.data || []);
        setPublishers(publishersData.data || []);
      } catch (err) {
        console.error('Error fetching filters:', err);
        setError('Failed to load filters');
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
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

  const handleFeaturedToggle = () => {
    const newFeatured = !featured;
    setFeatured(newFeatured);
    
    const params = new URLSearchParams(window.location.search);
    
    if (newFeatured) {
      params.set('featured', 'true');
    } else {
      params.delete('featured');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setFeatured(false);
    
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

  // Sort collections by game count
  const sortedGenres = [...genres].sort((a, b) => 
    (b._count?.games || 0) - (a._count?.games || 0)
  );
  
  const sortedTags = [...tags].sort((a, b) => 
    (b._count?.games || 0) - (a._count?.games || 0)
  );
  
  const sortedPublishers = [...publishers].sort((a, b) => 
    (b._count?.games || 0) - (a._count?.games || 0)
  );

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

      {/* Featured Only */}
      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={handleFeaturedToggle}
            className="rounded text-primary focus:ring-primary"
          />
          <span className="text-sm">Featured Games Only</span>
        </label>
      </div>

      {/* Price Range */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedPrice(!expandedPrice)}
        >
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-primary" />
            <h3 className="font-medium">Price Range</h3>
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

      {/* Genres */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedGenres(!expandedGenres)}
        >
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-2 text-primary" />
            <h3 className="font-medium">Genres</h3>
          </div>
          {expandedGenres ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
        
        {expandedGenres && (
          <div className="mt-2 space-y-1 max-h-60 overflow-y-auto pr-2">
            {sortedGenres.map((genre) => (
              <Link
                key={genre.id}
                href={`/games?genre=${genre.slug}`}
                className={`flex items-center justify-between py-1 px-2 text-sm rounded-md transition-colors ${
                  currentGenre === genre.slug
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-primary/5'
                }`}
              >
                <span>{genre.name}</span>
                {genre._count && (
                  <span className="text-xs text-muted-foreground">
                    {genre._count.games}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedTags(!expandedTags)}
        >
          <div className="flex items-center">
            <Tag className="w-4 h-4 mr-2 text-primary" />
            <h3 className="font-medium">Tags</h3>
          </div>
          {expandedTags ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
        
        {expandedTags && (
          <div className="mt-2 space-y-1 max-h-60 overflow-y-auto pr-2">
            {sortedTags.slice(0, 20).map((tag) => (
              <Link
                key={tag.id}
                href={`/games?tag=${tag.slug}`}
                className={`flex items-center justify-between py-1 px-2 text-sm rounded-md transition-colors ${
                  currentTag === tag.slug
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-primary/5'
                }`}
              >
                <span>{tag.name}</span>
                {tag._count && (
                  <span className="text-xs text-muted-foreground">
                    {tag._count.games}
                  </span>
                )}
              </Link>
            ))}
            {sortedTags.length > 20 && (
              <Link
                href="/tags"
                className="flex items-center justify-center py-1 px-2 text-sm text-primary hover:underline"
              >
                View all tags
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Publishers */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedPublishers(!expandedPublishers)}
        >
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-2 text-primary" />
            <h3 className="font-medium">Publishers</h3>
          </div>
          {expandedPublishers ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
        
        {expandedPublishers && (
          <div className="mt-2 space-y-1 max-h-60 overflow-y-auto pr-2">
            {sortedPublishers.map((publisher) => (
              <Link
                key={publisher.id}
                href={`/games?publisher=${publisher.slug}`}
                className={`flex items-center justify-between py-1 px-2 text-sm rounded-md transition-colors ${
                  currentPublisher === publisher.slug
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-primary/5'
                }`}
              >
                <span>{publisher.name}</span>
                {publisher._count && (
                  <span className="text-xs text-muted-foreground">
                    {publisher._count.games}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {(currentGenre || currentTag || currentPublisher || currentMinPrice || currentMaxPrice || currentFeatured) && (
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