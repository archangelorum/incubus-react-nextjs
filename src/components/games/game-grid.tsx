'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/components/i18n/i18n-provider';
import { Star, ShoppingCart, Heart } from 'lucide-react';

type Game = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: {
    id: string;
    path: string;
  };
  publisher: {
    name: string;
    slug: string;
  };
  basePrice: number;
  discountPrice?: number;
  genres: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  _count: {
    reviews: number;
  };
};

type GameGridProps = {
  query: {
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    genre?: string;
    tag?: string;
    search?: string;
    publisher?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
  };
  showFilters?: boolean;
};

export function GameGrid({ query, showFilters = false }: GameGridProps) {
  const { t } = useI18n();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        
        // Build query string from props
        const params = new URLSearchParams();
        
        if (query.sortBy) params.append('sortBy', query.sortBy);
        if (query.sortOrder) params.append('sortOrder', query.sortOrder);
        if (query.limit) params.append('limit', query.limit.toString());
        if (query.genre) params.append('genre', query.genre);
        if (query.tag) params.append('tag', query.tag);
        if (query.search) params.append('search', query.search);
        if (query.publisher) params.append('publisher', query.publisher);
        if (query.minPrice) params.append('minPrice', query.minPrice.toString());
        if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString());
        if (query.featured) params.append('isFeatured', 'true');
        
        const response = await fetch(`/api/games?${params.toString()}`);
        
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
  }, [query]);

  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        setWishlist(new Set(parsedWishlist));
      } catch (err) {
        console.error('Error parsing wishlist:', err);
      }
    }
  }, []);

  const toggleWishlist = (gameId: string) => {
    setWishlist(prevWishlist => {
      const newWishlist = new Set(prevWishlist);
      
      if (newWishlist.has(gameId)) {
        newWishlist.delete(gameId);
      } else {
        newWishlist.add(gameId);
      }
      
      // Save to localStorage
      localStorage.setItem('wishlist', JSON.stringify([...newWishlist]));
      
      return newWishlist;
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: query.limit || 8 }).map((_, index) => (
          <div key={index} className="bg-card rounded-lg overflow-hidden shadow-md animate-pulse">
            <div className="h-48 bg-muted"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-1/4 mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 bg-card rounded-lg">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-card rounded-lg">
        <p className="text-muted-foreground">No games found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {games.map((game) => (
        <div 
          key={game.id} 
          className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
        >
          <Link href={`/games/${game.slug}`} className="block relative">
            <div className="relative h-48 overflow-hidden">
              {game.coverImage ? (
                <Image
                  src={game.coverImage.path}
                  alt={game.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              
              {/* Price tag */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                {game.discountPrice ? (
                  <div className="flex items-center space-x-2">
                    <span className="line-through text-muted-foreground text-xs">
                      ${Number(game.basePrice).toFixed(2)}
                    </span>
                    <span className="text-green-500">
                      ${Number(game.basePrice).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span>${Number(game.basePrice).toFixed(2)}</span>
                )}
              </div>
            </div>
          </Link>
          
          <div className="p-4">
            <Link href={`/games/${game.slug}`} className="block">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {game.title}
              </h3>
            </Link>
            
            <Link 
              href={`/publishers/${game.publisher.slug}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {game.publisher.name}
            </Link>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm">
                  {game._count.reviews > 0 
                    ? `${(4 + Math.random()).toFixed(1)}` 
                    : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(game.id);
                  }}
                  className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                  aria-label={wishlist.has(game.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      wishlist.has(game.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </button>
                
                <Link 
                  href={`/games/${game.slug}/buy`}
                  className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                  aria-label="Buy game"
                >
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
            
            {game.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {game.genres.slice(0, 2).map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/games?genre=${genre.slug}`}
                    className="px-2 py-0.5 bg-secondary/10 text-secondary-foreground text-xs rounded hover:bg-secondary/20 transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}