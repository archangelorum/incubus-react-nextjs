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
        {listings.map((listing) => (
          <div key={listing.id} className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="relative h-48 overflow-hidden">
              {listing.type === 'GAME_LICENSE' && listing.game?.coverImage ? (
                <Image
                  src={listing.game.coverImage.path}
                  alt={listing.game.title}
                  fill
                  className="object-cover"
                />
              ) : listing.type === 'GAME_ITEM' && listing.item?.image ? (
                <Image
                  src={listing.item.image.path}
                  alt={listing.item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Tag className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              
              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <span className="text-xs bg-black/80 text-white px-2 py-1 rounded">
                  {listing.type === 'GAME_LICENSE' ? 'Game License' : 
                   listing.type === 'GAME_ITEM' ? 'Game Item' : 'Bundle'}
                </span>
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {getStatusBadge(listing.status)}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">
                {listing.type === 'GAME_LICENSE' && listing.game
                  ? listing.game.title
                  : listing.type === 'GAME_ITEM' && listing.item
                  ? listing.item.name
                  : 'Bundle'}
              </h3>
              
              {listing.type === 'GAME_ITEM' && listing.item && (
                <div className="mb-2">
                  {getRarityBadge(listing.item.rarity)}
                  {listing.game && (
                    <Link 
                      href={`/games/${listing.game.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors ml-2"
                    >
                      {listing.game.title}
                    </Link>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-muted-foreground mr-1" />
                  <span className="text-sm text-muted-foreground">
                    {listing.seller.name}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-muted-foreground mr-1" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {listing.expiresAt && (
                <div className="flex items-center mb-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground mr-1" />
                  <span className="text-muted-foreground">
                    Expires: {new Date(listing.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-xl font-bold">
                  {Number(listing.price).toFixed(2)} SOL
                </div>
                
                {listing.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handlePurchase(listing.id)}
                    disabled={!isAuthenticated || !isConnected}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                ) : (
                  <Link
                    href={`/marketplace/listings/${listing.id}`}
                    className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              aria-label="Previous page"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-md ${
                    page === i + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                  aria-label={`Page ${i + 1}`}
                  aria-current={page === i + 1 ? 'page' : undefined}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}