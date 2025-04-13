'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Play } from 'lucide-react';

interface GameCardProps {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  price: number;
  discountPrice?: number;
  genres?: { id: string; name: string }[];
  isOwned?: boolean;
}

export function GameCard({
  id,
  title,
  slug,
  coverImage,
  price,
  discountPrice,
  genres = [],
  isOwned = false,
}: GameCardProps) {
  const discountPercentage = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:translate-y-[-4px]">
      <div className="relative aspect-16/9 overflow-hidden">
        <img
          src={coverImage || 'https://via.placeholder.com/300x169'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {discountPercentage > 0 && (
          <Badge
            variant="gradient"
            className="absolute top-2 right-2 font-bold"
          >
            -{discountPercentage}%
          </Badge>
        )}
        {isOwned && (
          <Badge
            variant="ghost"
            className="absolute top-2 left-2"
          >
            Owned
          </Badge>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-bold line-clamp-1 hover:text-primary transition-colors">
          <Link href={`/games/${slug}`} className="hover:text-primary">
            {title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-2 grow">
        <div className="flex flex-wrap gap-1 mt-1">
          {genres.slice(0, 3).map((genre) => (
            <Badge key={genre.id} variant="ghost" className="text-xs">
              {genre.name}
            </Badge>
          ))}
          {genres.length > 3 && (
            <Badge variant="ghost" className="text-xs">
              +{genres.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center">
          {discountPercentage > 0 ? (
            <div className="flex flex-col">
              <span className="text-sm line-through text-muted-foreground">
                ${Number(price).toFixed(2)}
              </span>
              <span className="text-lg font-bold text-primary">
                ${Number(discountPrice).toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold">
              {price === 0 ? 'Free' : `$${Number(price).toFixed(2)}`}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>

          {isOwned ? (
            <Button variant="accent" size="sm" className="gap-1">
              <Play className="h-4 w-4" /> Play
            </Button>
          ) : (
            <Button variant="default" size="sm" className="gap-1">
              <ShoppingCart className="h-4 w-4" /> Add
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}