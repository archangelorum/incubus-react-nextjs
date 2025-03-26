'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation'
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Game = {
  id: string;
  title: string;
  slug: string;
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
  _count: {
    reviews: number;
  };
};

type RelatedGamesProps = {
  gameId: string;
  genreIds: string[];
  tagIds: string[];
};

export function RelatedGames({ gameId, genreIds, tagIds }: RelatedGamesProps) {
  const t = useTranslations();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerPage = 4;

  useEffect(() => {
    const fetchRelatedGames = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('limit', '12');
        
        // Add genre and tag filters if available
        if (genreIds.length > 0) {
          // Use the first 2 genres for better results
          genreIds.slice(0, 2).forEach(genreId => {
            params.append('genreId', genreId);
          });
        }
        
        if (tagIds.length > 0) {
          // Use the first 2 tags for better results
          tagIds.slice(0, 2).forEach(tagId => {
            params.append('tagId', tagId);
          });
        }
        
        const response = await fetch(`/api/games?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        
        const data = await response.json();
        
        // Filter out the current game
        const filteredGames = (data.data || []).filter((game: Game) => game.id !== gameId);
        
        setGames(filteredGames);
      } catch (err) {
        console.error('Error fetching related games:', err);
        setError('Failed to load related games');
      } finally {
        setLoading(false);
      }
    };

    if (genreIds.length > 0 || tagIds.length > 0) {
      fetchRelatedGames();
    } else {
      setLoading(false);
    }
  }, [gameId, genreIds, tagIds]);

  const totalPages = Math.ceil(games.length / itemsPerPage);
  
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalPages) % totalPages);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-card rounded-lg overflow-hidden shadow-md animate-pulse">
            <div className="h-40 bg-muted"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
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

  if (games.length === 0) {
    return (
      <div className="p-6 bg-card rounded-lg text-center">
        <p className="text-muted-foreground">No related games found</p>
      </div>
    );
  }

  const visibleGames = games.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <div>
      <div className="relative">
        {totalPages > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute -left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-card shadow-md z-10 hover:bg-muted transition-colors"
              aria-label="Previous games"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute -right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-card shadow-md z-10 hover:bg-muted transition-colors"
              aria-label="Next games"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden">
          {visibleGames.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.slug}`}
              className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
            >
              <div className="relative h-40 overflow-hidden">
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
                    <div className="flex items-center space-x-1">
                      <span className="line-through text-muted-foreground text-xs">
                        ${game.basePrice.toFixed(2)}
                      </span>
                      <span className="text-green-500">
                        ${game.discountPrice.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span>${game.basePrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {game.title}
                </h3>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {game.publisher.name}
                  </span>
                  
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 mr-0.5" />
                    <span className="text-xs">
                      {game._count.reviews > 0 
                        ? `${(4 + Math.random()).toFixed(1)}` 
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Pagination dots */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-primary w-4' 
                  : 'bg-muted hover:bg-muted-foreground'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}