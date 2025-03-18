/**
 * Game Detail Page
 * 
 * Displays detailed information about a specific game,
 * including description, pricing, publisher, genres, and reviews
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GamesApi } from '@/utils/api';
import { useFetch, useMutation } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface GameDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default function GameDetailPage({ params }: GameDetailPageProps) {
    const gameId = parseInt(React.use(params).id);
    const [reviewFormVisible, setReviewFormVisible] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        comment: '',
    });

    // Fetch game data
    const { data: game, isLoading, error, refetch } = useFetch(
        () => GamesApi.getGame(gameId),
        { dependencies: [gameId] }
    );

    // Review mutation
    const {
        mutate: submitReview,
        isLoading: isSubmittingReview,
        error: reviewError,
    } = useMutation((data: typeof reviewData) =>
        GamesApi.addGameReview(gameId, data)
    );

    // Format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Handle review form submission
    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await submitReview(reviewData);
            setReviewFormVisible(false);
            setReviewData({ rating: 5, comment: '' });
            refetch(); // Refresh game data to show new review
        } catch (error) {
            console.error('Failed to submit review:', error);
        }
    };

    // Calculate average rating
    const calculateAverageRating = () => {
        if (!game?.reviews || game.reviews.length === 0) return null;

        const sum = game.reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / game.reviews.length).toFixed(1);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="large" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <ErrorMessage
                    message={`Failed to load game: ${error.message}`}
                    onRetry={refetch}
                    className="mb-6"
                />
                <Link
                    href="/games"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    Back to Games
                </Link>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">Game not found</h3>
                    <p className="mt-2 text-gray-500">
                        The game you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        href="/games"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Back to Games
                    </Link>
                </div>
            </div>
        );
    }

    const averageRating = calculateAverageRating();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    href="/games"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                    <svg
                        className="w-5 h-5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Back to Games
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {game.title}
                            </h1>
                            <Link
                                href={`/publishers/${game.publisher.id}`}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                {game.publisher.name}
                            </Link>
                            <p className="text-gray-500 mt-1">
                                Released: {formatDate(game.releaseDate)}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col items-end">
                            {game.discountPrice ? (
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-bold text-red-600">
                                        {formatPrice(game.discountPrice)}
                                    </span>
                                    <span className="text-lg text-gray-500 line-through">
                                        {formatPrice(game.price)}
                                    </span>
                                    <span className="text-sm text-green-600 font-medium">
                                        Save{' '}
                                        {Math.round(
                                            ((game.price - game.discountPrice) / game.price) * 100
                                        )}
                                        %
                                    </span>
                                </div>
                            ) : (
                                <span className="text-2xl font-bold text-gray-900">
                                    {formatPrice(game.price)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Genres */}
                    {game.gameGenres && game.gameGenres.length > 0 && (
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                                {game.gameGenres.map((gameGenre) => (
                                    <Link
                                        key={gameGenre.genre.id}
                                        href={`/genres/${gameGenre.genre.id}`}
                                        className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full hover:bg-gray-200"
                                    >
                                        {gameGenre.genre.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            Description
                        </h2>
                        <div className="prose max-w-none">
                            <p className="text-gray-700 whitespace-pre-line">
                                {game.description}
                            </p>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Reviews {averageRating && `(${averageRating}★)`}
                            </h2>
                            <button
                                onClick={() => setReviewFormVisible(!reviewFormVisible)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                                {reviewFormVisible ? 'Cancel' : 'Write a Review'}
                            </button>
                        </div>

                        {/* Review Form */}
                        {reviewFormVisible && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">
                                    Write Your Review
                                </h3>
                                {reviewError && (
                                    <ErrorMessage
                                        message={`Failed to submit review: ${reviewError.message}`}
                                        className="mb-4"
                                    />
                                )}
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="rating"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Rating
                                        </label>
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() =>
                                                        setReviewData({ ...reviewData, rating: star })
                                                    }
                                                    className="text-2xl focus:outline-none"
                                                    aria-label={`Rate ${star} stars`}
                                                >
                                                    <span
                                                        className={
                                                            star <= reviewData.rating
                                                                ? 'text-yellow-400'
                                                                : 'text-gray-300'
                                                        }
                                                    >
                                                        ★
                                                    </span>
                                                </button>
                                            ))}
                                            <span className="ml-2 text-sm text-gray-500">
                                                {reviewData.rating} out of 5 stars
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="comment"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Comment (optional)
                                        </label>
                                        <textarea
                                            id="comment"
                                            rows={4}
                                            value={reviewData.comment}
                                            onChange={(e) =>
                                                setReviewData({
                                                    ...reviewData,
                                                    comment: e.target.value,
                                                })
                                            }
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Share your thoughts about this game..."
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setReviewFormVisible(false)}
                                            className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingReview}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                        >
                                            {isSubmittingReview ? (
                                                <>
                                                    <LoadingSpinner
                                                        size="small"
                                                        color="white"
                                                        className="mr-2"
                                                    />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Review'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Reviews List */}
                        {game.reviews && game.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {game.reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="bg-white border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                                                    {review.player.user.image ? (
                                                        <img
                                                            src={review.player.user.image}
                                                            alt={review.player.user.name || 'User'}
                                                            className="h-8 w-8 rounded-full"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {(review.player.user.name || 'U')
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-medium">
                                                    {review.player.user.name || 'Anonymous User'}
                                                </span>
                                            </div>
                                            <div className="text-yellow-400">
                                                {'★'.repeat(review.rating)}
                                                {'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-700 mt-2">{review.comment}</p>
                                        )}
                                        <p className="text-gray-500 text-sm mt-2">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">
                                    No reviews yet. Be the first to review this game!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}