/**
 * Games List Page
 * 
 * Displays a paginated list of games with search functionality
 * and links to individual game details
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GamesApi } from '@/utils/api';
import { useFetch } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';

export default function GamesPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch games data
  const { data, isLoading, error, refetch } = useFetch(
    () => GamesApi.getGames(page, pageSize, searchQuery),
    { dependencies: [page, pageSize, searchQuery] }
  );

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on new search
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Games</h1>
        <div className="w-full md:w-64">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search games..."
            initialValue={searchQuery}
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      )}

      {error && (
        <ErrorMessage
          message={`Failed to load games: ${error.message}`}
          onRetry={refetch}
          className="mb-6"
        />
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No games found</h3>
          <p className="mt-2 text-gray-500">
            {searchQuery
              ? `No games matching "${searchQuery}"`
              : 'There are no games available at the moment.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.data.map((game) => (
              <Link
                href={`/games/${game.id}`}
                key={game.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {game.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {game.publisher.name}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      {game.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-red-600">
                            {formatPrice(game.discountPrice)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(game.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(game.price)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(game.releaseDate)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(data.pagination.total / pageSize)}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}