import { Suspense } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { GameScreenshots } from '@/components/games/game-screenshots';
import { GameReviews } from '@/components/games/game-reviews';
import { RelatedGames } from '@/components/games/related-games';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    Calendar,
    Tag,
    Star,
    ShoppingCart,
    Heart,
    Share2,
    Download,
    Play,
    Info,
    Shield
} from 'lucide-react';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    const game = await prisma.game.findUnique({
        where: { slug },
        select: {
            title: true,
            shortDescription: true,
            coverImage: true,
        },
    });

    if (!game) {
        return {
            title: 'Game Not Found | Incubus',
            description: 'The requested game could not be found',
        };
    }

    return {
        title: `${game.title} | Incubus`,
        description: game.shortDescription || `Buy and play ${game.title} on Incubus`,
        openGraph: {
            images: game.coverImage ? [game.coverImage.path] : [],
        },
    };
}

async function getGameDetails(slug: string) {
    const game = await prisma.game.findUnique({
        where: { slug },
        include: {
            publisher: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                },
            },
            developerIds: {
                include: {
                    developer: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            logo: true,
                        },
                    },
                },
            },
            genres: {
                include: {
                    genre: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
            coverImage: true,
            screenshots: true,
            trailerVideo: true,
            versions: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            },
            _count: {
                select: {
                    reviews: true,
                    licenses: true,
                },
            },
        },
    });

    return game;
}

export default async function GamePage({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    const game = await getGameDetails(slug);

    if (!game) {
        notFound();
    }

    // Transform the data
    const developers = game.developerIds.map(d => d.developer);
    const genres = game.genres.map(g => g.genre);
    const tags = game.tags.map(t => t.tag);
    const latestVersion = game.versions[0];

    // Calculate average rating (mock data for now)
    const averageRating = 4.7;
    const totalReviews = game._count.reviews;

    return (
        <div className="pt-24 pb-16">
            {/* Hero Section */}
            <div className="relative">
                {game.coverImage && (
                    <div className="absolute inset-0 h-[500px] overflow-hidden">
                        <Image
                            src={game.coverImage.path}
                            alt={game.title}
                            fill
                            className="object-cover opacity-30"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
                    </div>
                )}

                <div className="container mx-auto px-4 relative z-10 pt-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Game Cover */}
                        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
                            <div className="rounded-lg overflow-hidden shadow-xl bg-card">
                                {game.coverImage ? (
                                    <Image
                                        src={game.coverImage.path}
                                        alt={game.title}
                                        width={400}
                                        height={600}
                                        className="w-full h-auto object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-[400px] bg-muted flex items-center justify-center">
                                        <span className="text-muted-foreground">No image</span>
                                    </div>
                                )}
                            </div>

                            {/* Purchase/Action Buttons */}
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-2xl font-bold">
                                            ${game.discountPrice?.toFixed(2) || game.basePrice.toFixed(2)}
                                        </span>
                                        {game.discountPrice && (
                                            <span className="ml-2 text-muted-foreground line-through">
                                                ${game.basePrice.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 rounded-full hover:bg-primary/10 transition-colors" aria-label="Add to wishlist">
                                            <Heart className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 rounded-full hover:bg-primary/10 transition-colors" aria-label="Share">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <Link
                                    href={`/games/${game.slug}/buy`}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Buy Now
                                </Link>

                                <button
                                    className="w-full py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors flex items-center justify-center"
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    Play Demo
                                </button>
                            </div>

                            {/* Game Info */}
                            <div className="mt-6 bg-card rounded-lg p-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Release Date</span>
                                    <span>{new Date(game.releaseDate).toLocaleDateString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Publisher</span>
                                    <Link href={`/publishers/${game.publisher.slug}`} className="text-primary hover:underline">
                                        {game.publisher.name}
                                    </Link>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Developer</span>
                                    <div className="text-right">
                                        {developers.map((dev, index) => (
                                            <Link key={dev.id} href={`/developers/${dev.slug}`} className="text-primary hover:underline">
                                                {dev.name}{index < developers.length - 1 ? ', ' : ''}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {latestVersion && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Version</span>
                                            <span>{latestVersion.version}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Size</span>
                                            <span>{(Number(latestVersion.size) / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
                                        </div>
                                    </>
                                )}

                                {game.contentRating && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Content Rating</span>
                                        <span>{game.contentRating}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Owners</span>
                                    <span>{game._count.licenses}</span>
                                </div>
                            </div>

                            {/* NFT Info */}
                            <div className="mt-4 bg-card rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <Shield className="w-4 h-4 mr-2 text-primary" />
                                    <h3 className="font-semibold">NFT License</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    This game is sold as an NFT on the Solana blockchain. You can trade, sell, or transfer your license.
                                </p>
                            </div>
                        </div>

                        {/* Game Details */}
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{game.title}</h1>

                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center">
                                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                                    <span className="font-medium">{averageRating}</span>
                                    <span className="text-muted-foreground ml-1">
                                        ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 text-muted-foreground mr-1" />
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(game.releaseDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Genres & Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {genres.map(genre => (
                                    <Link
                                        key={genre.id}
                                        href={`/games?genre=${genre.slug}`}
                                        className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm hover:bg-secondary/20 transition-colors"
                                    >
                                        {genre.name}
                                    </Link>
                                ))}

                                {tags.slice(0, 5).map(tag => (
                                    <Link
                                        key={tag.id}
                                        href={`/games?tag=${tag.slug}`}
                                        className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm hover:bg-muted/80 transition-colors flex items-center"
                                    >
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag.name}
                                    </Link>
                                ))}

                                {tags.length > 5 && (
                                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                                        +{tags.length - 5} more
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
                                <p className="text-lg mb-4">{game.shortDescription}</p>
                                <div dangerouslySetInnerHTML={{ __html: game.description }} />
                            </div>

                            {/* Screenshots */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">Screenshots</h2>
                                <Suspense fallback={<div className="h-60 bg-muted animate-pulse rounded-lg"></div>}>
                                    <GameScreenshots gameId={game.id} screenshots={game.screenshots} />
                                </Suspense>
                            </div>

                            {/* System Requirements */}
                            {game.systemRequirements && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold mb-4">System Requirements</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-card rounded-lg p-4">
                                            <h3 className="font-semibold mb-2 flex items-center">
                                                <Info className="w-4 h-4 mr-2 text-primary" />
                                                Minimum
                                            </h3>
                                            <ul className="space-y-2 text-sm">
                                                {Object.entries(
                                                    typeof game.systemRequirements === 'object' && game.systemRequirements !== null
                                                        ? (game.systemRequirements as any).minimum || {}
                                                        : {}
                                                ).map(([key, value]) => (
                                                    <li key={key} className="flex justify-between">
                                                        <span className="text-muted-foreground capitalize">{key}</span>
                                                        <span>{value as string}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-card rounded-lg p-4">
                                            <h3 className="font-semibold mb-2 flex items-center">
                                                <Info className="w-4 h-4 mr-2 text-primary" />
                                                Recommended
                                            </h3>
                                            <ul className="space-y-2 text-sm">
                                                {Object.entries(
                                                    typeof game.systemRequirements === 'object' && game.systemRequirements !== null
                                                        ? (game.systemRequirements as any).recommended || {}
                                                        : {}
                                                ).map(([key, value]) => (
                                                    <li key={key} className="flex justify-between">
                                                        <span className="text-muted-foreground capitalize">{key}</span>
                                                        <span>{value as string}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                                <Suspense fallback={<LoadingSpinner />}>
                                    <GameReviews gameId={game.id} />
                                </Suspense>
                            </div>

                            {/* Related Games */}
                            <div>
                                <h2 className="text-2xl font-bold mb-4">More Like This</h2>
                                <Suspense fallback={<div className="h-60 bg-muted animate-pulse rounded-lg"></div>}>
                                    <RelatedGames
                                        gameId={game.id}
                                        genreIds={genres.map(g => g.id)}
                                        tagIds={tags.map(t => t.id)}
                                    />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}