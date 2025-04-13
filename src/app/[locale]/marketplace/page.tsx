import { Suspense } from 'react';
import { Link } from '@/i18n/navigation';
import { Filter, Tag, Clock, ArrowDown, ArrowUp } from 'lucide-react';
import { MarketplaceListings } from '@/components/marketplace/marketplace-listings';
import { MarketplaceFilters } from '@/components/marketplace/marketplace-filters';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SortSelect } from '@/components/marketplace/sort-select';

export const metadata = {
  title: 'NFT Marketplace | Incubus',
  description: 'Buy, sell, and trade game licenses and in-game items as NFTs on the Polygon blockchain',
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  searchParams = await searchParams;
  // Extract search parameters
  const type = typeof searchParams.type === 'string' ? searchParams.type : undefined;
  const gameId = typeof searchParams.gameId === 'string' ? searchParams.gameId : undefined;
  const sellerId = typeof searchParams.sellerId === 'string' ? searchParams.sellerId : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : 'ACTIVE';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'createdAt';
  const order = typeof searchParams.order === 'string' ? searchParams.order : 'desc';
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : undefined;

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-primary/20 to-secondary/20 rounded-lg p-8 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              NFT Marketplace
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Buy, sell, and trade game licenses and in-game items as NFTs on the Polygon blockchain.
              Own your games and items truly and transfer them freely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/marketplace/create" 
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
              >
                Sell an Item
              </Link>
              <Link 
                href="/wallet" 
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors inline-flex items-center justify-center"
              >
                Connect Wallet
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 lg:w-72 shrink-0">
            <div className="sticky top-24 bg-card rounded-lg shadow-md p-4">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 mr-2 text-primary" />
                <h2 className="text-xl font-semibold">Filters</h2>
              </div>
              
              <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-md"></div>}>
                <MarketplaceFilters 
                  currentType={type}
                  currentGameId={gameId}
                  currentSellerId={sellerId}
                  currentStatus={status}
                  currentMinPrice={minPrice}
                  currentMaxPrice={maxPrice}
                />
              </Suspense>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {type === 'GAME_LICENSE' ? 'Game Licenses' : 
                 type === 'GAME_ITEM' ? 'Game Items' : 
                 type === 'BUNDLE' ? 'Bundles' : 
                 'All Listings'}
              </h2>
              
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Showing NFT listings on the Polygon blockchain
                </p>
                
                <SortSelect currentSort={sort} currentOrder={order} />
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Link
                href="/marketplace"
                className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                  !type ? 'bg-primary text-primary-foreground' : 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20'
                }`}
              >
                All
              </Link>
              <Link
                href="/marketplace?type=GAME_LICENSE"
                className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                  type === 'GAME_LICENSE' ? 'bg-primary text-primary-foreground' : 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20'
                }`}
              >
                <Tag className="w-3 h-3 mr-1" />
                Game Licenses
              </Link>
              <Link
                href="/marketplace?type=GAME_ITEM"
                className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                  type === 'GAME_ITEM' ? 'bg-primary text-primary-foreground' : 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20'
                }`}
              >
                <Tag className="w-3 h-3 mr-1" />
                Game Items
              </Link>
              <Link
                href="/marketplace?type=BUNDLE"
                className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                  type === 'BUNDLE' ? 'bg-primary text-primary-foreground' : 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20'
                }`}
              >
                <Tag className="w-3 h-3 mr-1" />
                Bundles
              </Link>
            </div>
            
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <MarketplaceListings 
                query={{
                  type,
                  gameId,
                  sellerId,
                  status,
                  sort,
                  order,
                  minPrice,
                  maxPrice,
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}