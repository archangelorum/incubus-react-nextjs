'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation'
import Image from 'next/image';
import { useTranslations } from 'next-intl';

type Genre = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    games: number;
  };
};

const genreImages: Record<string, string> = {
  'action': 'action.jpg',
  'adventure': 'adventure.jpg',
  'rpg': 'rpg.jpg',
  'strategy': 'strategy.jpg',
  'simulation': 'simulation.jpg',
  'sports': 'sports.jpg',
  'racing': 'racing.jpg',
  'puzzle': 'puzzle.jpg',
  'shooter': 'shooter.jpg',
  'platformer': 'platformer.jpg',
  'horror': 'horror.jpg',
  'fighting': 'fighting.jpg',
  'mmo': 'mmo.jpg',
  'card': 'card.jpg',
  'indie': 'indie.jpg',
};

// Fallback image for genres without a specific image
const fallbackGenreImage = 'default.jpg';

export function GenreList() {
  const t = useTranslations();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/genres');

        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }

        const data = await response.json();
        setGenres(data.data || []);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('Failed to load genres');
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const getGenreImage = (slug: string): string => {
    return `/storage/games/genres/${genreImages[slug.toLowerCase()] || fallbackGenreImage}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="h-40 bg-card rounded-lg animate-pulse"></div>
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

  if (genres.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-card rounded-lg">
        <p className="text-muted-foreground">No genres found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {genres.map((genre) => (
        <Link
          key={genre.id}
          href={`/games?genre=${genre.slug}`}
          className="group relative h-40 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="absolute inset-0 bg-black">
            <Image
              src={getGenreImage(genre.slug)}
              alt={genre.name}
              fill
              className="object-cover opacity-70 group-hover:scale-105 group-hover:opacity-80 transition-all duration-300"
            />
          </div>

          <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
            <h3 className="text-white font-semibold text-lg group-hover:text-primary transition-colors">
              {genre.name}
            </h3>

            {genre._count && (
              <p className="text-white/80 text-sm">
                {genre._count.games} {genre._count.games === 1 ? 'game' : 'games'}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}