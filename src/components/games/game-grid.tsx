'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation'
import Image from 'next/image';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { GameCard } from '@/components/games/game-card';
import { useTranslations } from 'next-intl';

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
    sort?: string;
    order?: string;
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
  const t = useTranslations();
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
        
        if (query.sort) params.append('sort', query.sort);
        if (query.order) params.append('order', query.order);
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
        <GameCard
          key={game.id}
          id={game.id}
          title={game.title}
          slug={game.slug}
          coverImage={game.coverImage?.path || 'https://via.placeholder.com/300x169'}
          price={game.basePrice}
          discountPrice={game.discountPrice}
          genres={game.genres}
          isOwned={false}
        />
      ))}
    </div>
  );
}