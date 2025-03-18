/**
 * Bundles List Page
 * 
 * Displays a paginated list of game bundles with search functionality
 * and links to individual bundle details
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BundlesApi, GamesApi } from '@/utils/api';
import { useFetch, useMutation } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';

export default function BundlesPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBundle, setNewBundle] = useState({
    title: '',
    discountPrice: '',
    gameIds: [] as number[],
  });
  const [selectedGames, setSelectedGames] = useState<Array<{ id: number; title: string; price: number }>>([]);
  const [searchGamesQuery, setSearchGamesQuery] = useState('');
  const [showGameSearch, setShowGameSearch] = useState(false);

  // Fetch bundles data
  const { data, isLoading, error, refetch } = useFetch(
    () => BundlesApi.getBundles(page, pageSize, searchQuery),
    { dependencies: [page, pageSize, searchQuery] }
  );

  // Fetch games for selection
  const { data: gamesData, isLoading: isLoadingGames, error: gamesError } = useFetch(
    () => GamesApi.getGames(1, 100, searchGamesQuery),
    { 
      dependencies: [searchGamesQuery],
      initialFetch: showGameSearch
    }
  );

  // Create bundle mutation
  const {
    mutate: createBundle,
    isLoading: isCreating,
    error: createError,
  } = useMutation((data: { 
    title: string; 
    discountPrice?: number; 
    gameIds: number[] 
  }) => BundlesApi.createBundle(data));

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

  // Handle game search
  const handleGameSearch = (query: string) => {
    setSearchGamesQuery(query);
  };

  // Handle game selection
  const handleSelectGame = (game: { id: number; title: string; price: number }) => {
    if (!selectedGames.some(g => g.id === game.id)) {
      const updatedGames = [...selectedGames, game];
      setSelectedGames(updatedGames);
      setNewBundle({
        ...newBundle,
        gameIds: updatedGames.map(g => g.id)
      });
    }
    setShowGameSearch(false);
    setSearchGamesQuery('');
  };

  // Handle game removal
  const handleRemoveGame = (gameId: number) => {
    const updatedGames = selectedGames.filter(g => g.id !== gameId);
    setSelectedGames(updatedGames);
    setNewBundle({
      ...newBundle,
      gameIds: updatedGames.map(g => g.id)
    });
  };

  // Calculate total price of selected games
  const calculateTotalPrice = () => {
    return selectedGames.reduce((sum, game) => sum + game.price, 0);
  };

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedGames.length === 0) {
      alert('Please select at least one game for the bundle');
      return;
    }
    
    try {
      const bundleData = {
        title: newBundle.title,
        discountPrice: newBundle.discountPrice ? parseFloat(newBundle.discountPrice) : undefined,
        gameIds: newBundle.gameIds
      };
      
      await createBundle(bundleData);
      setNewBundle({ title: '', discountPrice: '', gameIds: [] });
      setSelectedGames([]);
      setShowCreateForm(false);
      refetch(); // Refresh bundles list
    } catch (error) {
      console.error('Failed to create bundle:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Game Bundles</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search bundles..."
              initialValue={searchQuery}
            />
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Bundle'}
          </button>
        </div>
      </div>

      {/* Create Bundle Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Bundle</h2>
          {createError && (
            <ErrorMessage
              message={`Failed to create bundle: ${createError.message}`}
              className="mb-4"
            />
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bundle Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={newBundle.title}
                onChange={(e) =>
                  setNewBundle({ ...newBundle, title: e.target.value })
                }
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter bundle title"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Games in Bundle *
              </label>
              
              {selectedGames.length > 0 && (
                <div className="mb-4">
                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Games:</h4>
                    <ul className="space-y-2">
                      {selectedGames.map(game => (
                        <li key={game.id} className="flex justify-between items-center">
                          <span>{game.title} - {formatPrice(game.price)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveGame(game.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between font-medium">
                        <span>Total Original Price:</span>
                        <span>{formatPrice(calculateTotalPrice())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {showGameSearch ? (
                <div className="mb-4">
                  <div className="flex mb-2">
                    <SearchBar
                      onSearch={handleGameSearch}
                      placeholder="Search games to add..."
                      className="flex-grow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGameSearch(false)}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {isLoadingGames ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner size="medium" />
                    </div>
                  ) : gamesError ? (
                    <ErrorMessage
                      message={`Failed to load games: ${gamesError.message}`}
                      className="mb-2"
                    />
                  ) : gamesData && gamesData.data.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No games found</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {gamesData?.data.map(game => (
                          <li 
                            key={game.id}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelectGame({
                              id: game.id,
                              title: game.title,
                              price: game.price
                            })}
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">{game.title}</span>
                              <span>{formatPrice(game.price)}</span>
                            </div>
                            <p className="text-sm text-gray-500">{game.publisher.name}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGameSearch(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Add Games
                </button>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="discountPrice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Discount Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  step="0.01"
                  value={newBundle.discountPrice}
                  onChange={(e) =>
                    setNewBundle({ ...newBundle, discountPrice: e.target.value })
                  }
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
              {selectedGames.length > 0 && newBundle.discountPrice && (
                <div className="mt-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Original Price:</span>
                    <span>{formatPrice(calculateTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Discount Price:</span>
                    <span>{formatPrice(parseFloat(newBundle.discountPrice))}</span>
                  </div>
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Savings:</span>
                    <span>
                      {formatPrice(calculateTotalPrice() - parseFloat(newBundle.discountPrice))} 
                      ({Math.round((1 - parseFloat(newBundle.discountPrice) / calculateTotalPrice()) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewBundle({ title: '', discountPrice: '', gameIds: [] });
                  setSelectedGames([]);
                }}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isCreating ||
                  !newBundle.title.trim() ||
                  selectedGames.length === 0 ||
                  (newBundle.discountPrice !== '' && parseFloat(newBundle.discountPrice) <= 0)
                }
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner
                      size="small"
                      color="white"
                      className="mr-2"
                    />
                    Creating...
                  </>
                ) : (
                  'Create Bundle'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      )}

      {error && (
        <ErrorMessage
          message={`Failed to load bundles: ${error.message}`}
          onRetry={refetch}
          className="mb-6"
        />
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No bundles found</h3>
          <p className="mt-2 text-gray-500">
            {searchQuery
              ? `No bundles matching "${searchQuery}"`
              : 'There are no bundles available at the moment.'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((bundle) => (
              <Link
                href={`/bundles/${bundle.id}`}
                key={bundle.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {bundle.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {bundle.bundleGames.length} games
                  </p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      {bundle.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-red-600">
                            {formatPrice(bundle.discountPrice)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(bundle.pricing.totalOriginalPrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(bundle.pricing.totalOriginalPrice)}
                        </span>
                      )}
                    </div>
                    
                    {bundle.pricing.savingsPercentage > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Save {bundle.pricing.savingsPercentage}%
                      </span>
                    )}
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