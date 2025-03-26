'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation'
import { Tag as TagIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Tag = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    games: number;
    items: number;
  };
};

export function TagCloud() {
  const t = useTranslations();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tags');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        
        const data = await response.json();
        setTags(data.data || []);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Function to determine tag size based on game count
  const getTagSize = (tag: Tag): string => {
    if (!tag._count) return 'text-sm';
    
    const count = tag._count.games + (tag._count.items || 0);
    
    if (count > 50) return 'text-xl font-semibold';
    if (count > 30) return 'text-lg font-semibold';
    if (count > 15) return 'text-base font-medium';
    if (count > 5) return 'text-sm';
    return 'text-xs';
  };

  // Function to determine tag color based on game count
  const getTagColor = (tag: Tag): string => {
    if (!tag._count) return 'bg-secondary/10 text-secondary-foreground';
    
    const count = tag._count.games + (tag._count.items || 0);
    
    if (count > 50) return 'bg-primary/20 text-primary hover:bg-primary/30';
    if (count > 30) return 'bg-primary/15 text-primary hover:bg-primary/25';
    if (count > 15) return 'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30';
    if (count > 5) return 'bg-secondary/15 text-secondary-foreground hover:bg-secondary/25';
    return 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20';
  };

  if (loading) {
    return (
      <div className="h-60 bg-card/50 animate-pulse rounded-lg"></div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 bg-card rounded-lg">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-card rounded-lg">
        <p className="text-muted-foreground">No tags found</p>
      </div>
    );
  }

  // Sort tags by popularity (game count)
  const sortedTags = [...tags].sort((a, b) => {
    const countA = (a._count?.games || 0) + (a._count?.items || 0);
    const countB = (b._count?.games || 0) + (b._count?.items || 0);
    return countB - countA;
  });

  return (
    <div className="p-6 bg-card/50 rounded-lg">
      <div className="flex flex-wrap gap-2 justify-center">
        {sortedTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/games?tag=${tag.slug}`}
            className={`px-3 py-1.5 rounded-full transition-colors ${getTagColor(tag)}`}
          >
            <span className={getTagSize(tag)}>
              {tag.name}
              {tag._count && tag._count.games > 0 && (
                <span className="ml-1 text-xs opacity-70">
                  ({tag._count.games})
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
      
      {/* Show all tags link */}
      <div className="mt-6 text-center">
        <Link
          href="/tags"
          className="inline-flex items-center text-primary hover:underline"
        >
          <TagIcon className="w-4 h-4 mr-1" />
          View all tags
        </Link>
      </div>
    </div>
  );
}