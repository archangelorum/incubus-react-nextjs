'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import { useWallet } from '@/components/wallet/wallet-provider';
import { useTranslations } from 'next-intl';
import {
  Tag,
  ShoppingCart,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { MarketplaceItemCard } from '@/components/marketplace/marketplace-item-card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';

type Listing = {
  id: string;
  type: 'GAME_LICENSE' | 'GAME_ITEM' | 'BUNDLE';
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED' | 'EXPIRED';
  sellerId: string;
  seller: {
    id: string;
    name: string;
    image?: string;
  };
  price: number;
  quantity: number;
  expiresAt?: string;
  gameId?: string;
  game?: {
    id: string;
    title: string;
    slug: string;
    coverImage?: {
      id: string;
      path: string;
    };
  };
  itemId?: string;
  item?: {
    id: string;
    name: string;
    description?: string;
    rarity: string;
    image?: {
      id: string;
      path: string;
    };
  };
  createdAt: string;
  updatedAt: string;
};

type MarketplaceListingsProps = {
  query: {
    type?: string;
    gameId?: string;
    sellerId?: string;
    status?: string;
    sort?: string;
    order?: string;
    minPrice?: number;
    maxPrice?: number;
  };
};

export function MarketplaceListings({ query }: MarketplaceListingsProps) {
  const t = useTranslations();
  const { user, isAuthenticated } = useAuth();
  const { activeWallet, isConnected } = useWallet();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        
        // Build query string from props
        const params = new URLSearchParams();
        
        params.append('page', page.toString());
        params.append('limit', '12');
        
        if (query.type) params.append('type', query.type);
        if (query.gameId) params.append('gameId', query.gameId);
        if (query.sellerId) params.append('sellerId', query.sellerId);
        if (query.status) params.append('status', query.status);
        if (query.sort) params.append('sort', query.sort);
        if (query.order) params.append('order', query.order);
        if (query.minPrice) params.append('minPrice', query.minPrice.toString());
        if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString());
        
        const response = await fetch(`/api/marketplace/listings?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        setListings(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load marketplace listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [query, page]);

  const handlePurchase = async (listingId: string) => {
    if (!isAuthenticated || !isConnected) {
      alert('Please connect your wallet to make a purchase');
      return;
    }
    
    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletId: activeWallet?.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to purchase item');
      }
      
      // Update the listing status in the UI
      setListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: 'SOLD' as const } 
            : listing
        )
      );
      
      alert('Purchase successful!');
    } catch (err: any) {
      console.error('Error purchasing item:', err);
      alert(`Purchase failed: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'SOLD':
        return (
          <span className="flex items-center text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            <ShoppingCart className="w-3 h-3 mr-1" />
            Sold
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="flex items-center text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  const getRarityBadge = (rarity: string) => {
    let color;
    
    switch (rarity) {
      case 'COMMON':
        color = 'bg-slate-500/10 text-slate-500';
        break;
      case 'UNCOMMON':
        color = 'bg-green-500/10 text-green-500';
        break;
      case 'RARE':
        color = 'bg-blue-500/10 text-blue-500';
        break;
      case 'EPIC':
        color = 'bg-purple-500/10 text-purple-500';
        break;
      case 'LEGENDARY':
        color = 'bg-yellow-500/10 text-yellow-500';
        break;
      case 'UNIQUE':
        color = 'bg-red-500/10 text-red-500';
        break;
      default:
        color = 'bg-muted text-muted-foreground';
    }
    
    return (
      <span className={`text-xs ${color} px-2 py-0.5 rounded-full`}>
        {rarity.charAt(0) + rarity.slice(1).toLowerCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
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
      <div className="p-6 bg-destructive/10 text-destructive rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="p-8 bg-card rounded-lg text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Tag className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Listings Found</h3>
        <p className="text-muted-foreground mb-6">
          There are no listings matching your current filters.
        </p>
        <Link
          href="/marketplace"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
        >
          View All Listings
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => {
          // Determine the type for the marketplace item card
          const itemType = listing.type === 'GAME_LICENSE'
            ? 'game'
            : listing.type === 'GAME_ITEM'
              ? 'item'
              : 'bundle';
          
          // Determine the rarity for items
          const rarity = listing.type === 'GAME_ITEM' && listing.item?.rarity
            ? listing.item.rarity.toLowerCase() as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
            : 'common';
          
          // Get the image path
          const imagePath = listing.type === 'GAME_LICENSE' && listing.game?.coverImage
            ? listing.game.coverImage.path
            : listing.type === 'GAME_ITEM' && listing.item?.image
              ? listing.item.image.path
              : 'https://via.placeholder.com/300x300';
          
          // Get the title
          const title = listing.type === 'GAME_LICENSE' && listing.game
            ? listing.game.title
            : listing.type === 'GAME_ITEM' && listing.item
              ? listing.item.name
              : 'Bundle';
          
          // Get the slug for the link
          const slug = listing.type === 'GAME_LICENSE' && listing.game
            ? listing.game.slug
            : `listings/${listing.id}`;
          
          // Get the game info if available
          const game = listing.game
            ? {
                name: listing.game.title,
                slug: listing.game.slug
              }
            : undefined;
          
          return (
            <div key={listing.id} className="relative">
              {listing.status !== 'ACTIVE' && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-10 flex items-center justify-center rounded-lg">
                  <div className="text-center p-4">
                    {getStatusBadge(listing.status)}
                    <p className="mt-2 text-sm text-muted-foreground">
                      This item is no longer available for purchase
                    </p>
                    <Link href={`/marketplace/listings/${listing.id}`}>
                      <Button variant="secondary" size="sm" className="mt-3">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
              
              <MarketplaceItemCard
                id={listing.id}
                title={title}
                slug={slug}
                image={imagePath}
                price={listing.price}
                seller={{
                  name: listing.seller.name,
                  slug: `sellers/${listing.sellerId}`,
                  verified: false
                }}
                rarity={rarity}
                type={itemType as any}
                game={game}
              />
            </div>
          );
        })}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            siblingCount={1}
          />
        </div>
      )}
    </div>
  );
}