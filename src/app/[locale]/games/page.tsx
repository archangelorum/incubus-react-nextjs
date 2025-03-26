import { Suspense } from 'react';
import { GameGrid } from '@/components/games/game-grid';
import { GameFilters } from '@/components/games/game-filters';
import { SortSelect } from '@/components/games/sort-select';
import { LoadingGames } from '@/components/ui/loading-games';
import { Filter } from 'lucide-react';

export const metadata = {
    title: 'Browse Games | Incubus',
    description: 'Browse and discover games on the Incubus NFT game distribution platform',
};

export default async function GamesPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    searchParams = await searchParams;
    // Extract search parameters
    const genre = typeof searchParams.genre === 'string' ? searchParams.genre : undefined;
    const tag = typeof searchParams.tag === 'string' ? searchParams.tag : undefined;
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const publisher = typeof searchParams.publisher === 'string' ? searchParams.publisher : undefined;
    const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'releaseDate';
    const order = typeof searchParams.order === 'string' ? searchParams.order : 'desc';
    const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(String(searchParams.minPrice)) : undefined;
    const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(String(searchParams.maxPrice)) : undefined;
    const featured = searchParams.featured === 'true';

    return (
        <div className="pt-24 pb-16">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full md:w-64 lg:w-72 shrink-0">
                        <div className="sticky top-24 bg-card rounded-lg shadow-md p-4">
                            <div className="flex items-center mb-4">
                                <Filter className="w-5 h-5 mr-2 text-primary" />
                                <h2 className="text-xl font-semibold">Filters</h2>
                            </div>

                            <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-md"></div>}>
                                <GameFilters
                                    currentGenre={genre}
                                    currentTag={tag}
                                    currentPublisher={publisher}
                                    currentMinPrice={minPrice}
                                    currentMaxPrice={maxPrice}
                                    currentFeatured={featured}
                                />
                            </Suspense>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">
                                {genre ? `${genre.charAt(0).toUpperCase() + genre.slice(1)} Games` :
                                    tag ? `Games tagged with "${tag}"` :
                                        featured ? 'Featured Games' :
                                            search ? `Search results for "${search}"` :
                                                'All Games'}
                            </h1>

                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground">
                                    Discover and buy games as NFTs on the Solana blockchain
                                </p>

                                <SortSelect currentSort={sort} currentOrder={order} />
                            </div>
                        </div>

                        <Suspense fallback={<LoadingGames count={12} />}>
                            <GameGrid
                                query={{
                                    sort,
                                    order,
                                    genre,
                                    tag,
                                    search,
                                    publisher,
                                    minPrice,
                                    maxPrice,
                                    featured,
                                    limit: 24,
                                }}
                                showFilters={true}
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}