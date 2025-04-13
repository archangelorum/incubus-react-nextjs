import { Suspense } from 'react';
import { Link } from '@/i18n/navigation';
import { ArrowRight, TrendingUp, Star, Clock, Tag } from 'lucide-react';
import { FeaturedGames } from '@/components/home/featured-games';
import { GameGrid } from '@/components/games/game-grid';
import { GenreList } from '@/components/games/genre-list';
import { TagCloud } from '@/components/games/tag-cloud';
import { LoadingGames } from '@/components/ui/loading-games';
import { useTranslations } from 'next-intl';

export default function HomePage() {
    const t = useTranslations();

    return (
        <div className="pt-24">
            {/* Hero Section */}
            <section className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-secondary/20 pointer-events-none" />
                <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            {t('common.tagline')}
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                            {t("common.description")}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/games"
                                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
                            >
                                {t('nav.games')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                            <Link
                                href="/marketplace"
                                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors inline-flex items-center justify-center"
                            >
                                {t('nav.marketplace')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Games Carousel */}
            <section className="py-12 bg-card">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold">{t('home.featuredGames')}</h2>
                        <Link
                            href="/games?featured=true"
                            className="text-primary inline-flex items-center hover:underline"
                        >
                            {t('common.viewAll')}
                            <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>
                    <Suspense fallback={<LoadingGames count={3} large />}>
                        <FeaturedGames />
                    </Suspense>
                </div>
            </section>

            {/* New Releases */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <Clock className="w-6 h-6 mr-2 text-primary" />
                            <h2 className="text-2xl md:text-3xl font-bold">{t('home.newReleases')}</h2>
                        </div>
                        <Link
                            href="/games?sort=releaseDate&order=desc"
                            className="text-primary inline-flex items-center hover:underline"
                        >
                            {t('common.viewAll')}
                            <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>
                    <Suspense fallback={<LoadingGames count={8} />}>
                        <GameGrid
                            query={{
                                sort: 'releaseDate',
                                order: 'desc',
                                limit: 8
                            }}
                        />
                    </Suspense>
                </div>
            </section>

            {/* Top Sellers */}
            <section className="py-12 bg-card">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <TrendingUp className="w-6 h-6 mr-2 text-primary" />
                            <h2 className="text-2xl md:text-3xl font-bold">{t('home.topSellers')}</h2>
                        </div>
                        <Link
                            href="/games?sortBy=popularity&sortOrder=desc"
                            className="text-primary inline-flex items-center hover:underline"
                        >
                            {t('common.viewAll')}
                            <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>
                    <Suspense fallback={<LoadingGames count={8} />}>
                        <GameGrid
                            query={{
                                sort: 'popularity',
                                order: 'desc',
                                limit: 8
                            }}
                        />
                    </Suspense>
                </div>
            </section>

            {/* Browse by Genre */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center mb-8">
                        <Star className="w-6 h-6 mr-2 text-primary" />
                        <h2 className="text-2xl md:text-3xl font-bold">{t('home.browseByGenre')}</h2>
                    </div>
                    <Suspense fallback={<div className="h-40 flex items-center justify-center">{t('common.loading')}</div>}>
                        <GenreList />
                    </Suspense>
                </div>
            </section>

            {/* Popular Tags */}
            <section className="py-12 bg-card">
                <div className="container mx-auto px-4">
                    <div className="flex items-center mb-8">
                        <Tag className="w-6 h-6 mr-2 text-primary" />
                        <h2 className="text-2xl md:text-3xl font-bold">{t('home.browseByTag')}</h2>
                    </div>
                    <Suspense fallback={<div className="h-40 flex items-center justify-center">{t('common.loading')}</div>}>
                        <TagCloud />
                    </Suspense>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-linear-to-r from-primary/20 to-secondary/20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.readyToJoin")}</h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        {t("home.createAccountDesc")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/auth/signup"
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
                        >
                            {t('auth.createAccount')}
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                        <Link
                            href="/about"
                            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors inline-flex items-center justify-center"
                        >
                            {t('common.more')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}