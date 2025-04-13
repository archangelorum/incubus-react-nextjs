'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Info, Tag } from 'lucide-react';
import Image from 'next/image';

interface MarketplaceItemCardProps {
  id: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  seller: {
    name: string;
    slug: string;
    verified?: boolean;
  };
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  type: 'game' | 'item' | 'skin' | 'character' | 'currency';
  game?: {
    name: string;
    slug: string;
  };
}

export function MarketplaceItemCard({
  id,
  title,
  slug,
  image,
  price,
  seller,
  rarity = 'common',
  type,
  game,
}: MarketplaceItemCardProps) {
  const rarityColors = {
    common: 'bg-gray-500/20 text-gray-500',
    uncommon: 'bg-green-500/20 text-green-500',
    rare: 'bg-blue-500/20 text-blue-500',
    epic: 'bg-purple-500/20 text-purple-500',
    legendary: 'bg-amber-500/20 text-amber-500',
  };

  const typeIcons = {
    game: <Tag className="h-4 w-4 mr-1" />,
    item: <Info className="h-4 w-4 mr-1" />,
    skin: <Info className="h-4 w-4 mr-1" />,
    character: <Info className="h-4 w-4 mr-1" />,
    currency: <Info className="h-4 w-4 mr-1" />,
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:translate-y-[-4px]">
      <div className="relative aspect-square overflow-hidden bg-linear-to-br from-background to-muted">
        <img
          src={image || 'https://via.placeholder.com/300x300'}
          alt={title}
          className="w-full h-full object-contain transition-transform duration-500 hover:scale-110"
        />
        
        <Badge 
          variant="ghost" 
          className={`absolute top-2 right-2 ${rarityColors[rarity]}`}
        >
          {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
        </Badge>
        
        <Badge 
          variant="ghost" 
          className="absolute top-2 left-2 bg-background/50 backdrop-blur-xs"
        >
          {typeIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      </div>
      
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-bold line-clamp-1 hover:text-primary transition-colors">
          <Link href={`/marketplace/${slug}`} className="hover:text-primary">
            {title}
          </Link>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 grow">
        <div className="flex flex-col gap-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Seller: </span>
            <Link 
              href={`/sellers/${seller.slug}`} 
              className="ml-1 hover:text-primary transition-colors flex items-center"
            >
              {seller.name}
              {seller.verified && (
                <span className="ml-1 text-primary">✓</span>
              )}
            </Link>
          </div>
          
          {game && (
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Game: </span>
              <Link 
                href={`/games/${game.slug}`} 
                className="ml-1 hover:text-primary transition-colors"
              >
                {game.name}
              </Link>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-lg font-bold text-primary flex items-center">
            <Image
              src="/polygon-logo.svg"
              alt="Polygon"
              width={16}
              height={16}
              className="mr-1"
            />
            {Number(price).toFixed(2)}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
          
          <Button variant="default" size="sm" className="gap-1">
            <ShoppingCart className="h-4 w-4" /> Buy
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}