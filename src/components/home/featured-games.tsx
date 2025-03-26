'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
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

export function FeaturedGames() {
  const t = useTranslations();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games?isFeatured=true&limit=5');

        if (!response.ok) {
          throw new Error('Failed to fetch featured games');
        }

        const data = await response.json();
        setGames(data.data);
      } catch (err) {
        console.error('Error fetching featured games:', err);
        setError('Failed to load featured games');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedGames();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % games.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + games.length) % games.length);
  };

  // Auto-advance slides
  useEffect(() => {
    if (games.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [games.length]);

  if (loading) {
    return (
      <div className="h-96 bg-card/50 animate-pulse rounded-lg"></div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center bg-card rounded-lg">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-card rounded-lg">
        <p className="text-muted-foreground">No featured games available</p>
      </div>
    );
  }

  const currentGame = games[currentIndex];

  return (
    <div className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0 bg-black">
        {currentGame.coverImage && (
          <div className="relative w-full h-full">
            <Image
              src={currentGame.coverImage.path}
              alt={currentGame.title}
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-md">
              {t('home.featuredGames')}
            </span>
            {currentGame.genres.slice(0, 2).map((genre) => (
              <Link
                key={genre.id}
                href={`/games?genre=${genre.slug}`}
                className="px-2 py-1 bg-secondary/20 text-secondary-foreground text-xs rounded-md hover:bg-secondary/30 transition-colors"
              >
                {genre.name}
              </Link>
            ))}
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-2">{currentGame.title}</h2>

          <p className="text-lg text-muted-foreground mb-4 line-clamp-2 md:line-clamp-3">
            {currentGame.shortDescription}
          </p>

          <div className="flex items-center space-x-4 mb-6">
            <Link
              href={`/publishers/${currentGame.publisher.slug}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {currentGame.publisher.name}
            </Link>

            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm">
                {currentGame._count.reviews > 0
                  ? `${(4 + Math.random()).toFixed(1)} (${currentGame._count.reviews})`
                  : 'No reviews yet'}
              </span>
            </div>

            <div className="text-sm">
              {currentGame.discountPrice ? (
                <div className="flex items-center space-x-2">
                  <span className="line-through text-muted-foreground flex items-center">
                    <Image
                      src="/polygon-logo.svg"
                      alt="Polygon"
                      width={14}
                      height={14}
                      className="mr-1 opacity-70"
                    />
                    {Number(currentGame.basePrice).toFixed(2)}
                  </span>
                  <span className="text-green-500 font-bold flex items-center">
                    <Image
                      src="/polygon-logo.svg"
                      alt="Polygon"
                      width={16}
                      height={16}
                      className="mr-1"
                    />
                    {Number(currentGame.discountPrice).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="flex items-center">
                  <Image
                    src="/polygon-logo.svg"
                    alt="Polygon"
                    width={16}
                    height={16}
                    className="mr-1"
                  />
                  {Number(currentGame.basePrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/games/${currentGame.slug}`}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
            >
              View Game
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              href={`/games/${currentGame.slug}/buy`}
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors inline-flex items-center justify-center"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {games.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
              ? 'bg-primary w-6'
              : 'bg-white/50 hover:bg-white/80'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        aria-label="Previous slide"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        aria-label="Next slide"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}