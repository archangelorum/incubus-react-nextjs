/**
 * Bundle Detail Page
 * 
 * Displays detailed information about a specific game bundle,
 * including included games, pricing, and savings
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BundlesApi, GamesApi } from '@/utils/api';
import { useFetch, useMutation } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface BundleDetailPageProps {
  params: {
    id: string;
  };
}

export default function BundleDetailPage({ params }: BundleDetailPageProps) {
  const bundleId = parseInt(params.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    discountPrice: '',
    gameIds: [] as number[],
  });
  const [selectedGames, setSelectedGames] = useState<Array<{ id: number; title: string; price: number }>>([]);
  const [searchGamesQuery, setSearchGamesQuery] = useState('');
  const [showGameSearch, setShowGameSearch] = useState(false);

  // Fetch bundle data
  const { data: bundle, isLoading, error, refetch } = useFetch(
    () => BundlesApi.getBundle(bundleId),
    { dependencies: [bundleId] }
  );

  // Fetch games for selection
  const { data: gamesData, isLoading: isLoadingGames, error: gamesError } = useFetch(
    () => GamesApi.getGames(1, 100, searchGamesQuery),
    { 
      dependencies: [searchGamesQuery],
      initialFetch: showGameSearch
    }
  );

  // Update bundle mutation
  const {
    mutate: updateBundle,
    isLoading: isUpdating,
    error: updateError,
  } = useMutation((data: { 
    title?: string; 
    discountPrice?: number | null; 
    gameIds?: number[] 
  }) => BundlesApi.updateBundle(bundleId, data));

  // Delete bundle mutation
  const {
    mutate: deleteBundle,
    isLoading: isDeleting,
    error: deleteError,
  } = useMutation((id: number) => BundlesApi.deleteBundle(id));

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Handle edit mode
  const handleEdit = () => {
    if (bundle) {
      setEditData({
        title: bundle.title,
        discountPrice: bundle.discountPrice?.toString() || '',
        gameIds: bundle.bundleGames.map(bg => bg.game.id)
      });
      setSelectedGames(bundle.bundleGames.map(bg => ({
        id: bg.game.id,
        title: bg.game.title,
        price: bg.game.price
      })));
      setIsEditing(true);
    }
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
      setEditData({
        ...editData,
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
    setEditData({
      ...editData,
      gameIds: updatedGames.map(g => g.id)
    });
  };

  // Calculate total price of selected games
  const calculateTotalPrice = () => {
    return selectedGames.reduce((sum, game) => sum + game.price, 0);
  };

  // Handle update form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedGames.length === 0) {
      alert('Please select at least one game for the bundle');
      return;
    }
    
    try {
      const bundleData = {
        title: editData.title,
        discountPrice: editData.discountPrice ? parseFloat(editData.discountPrice) : null,
        gameIds: editData.gameIds
      };
      
      await updateBundle(bundleData);
      setIsEditing(false);
      refetch(); // Refresh bundle data
    } catch (error) {
      console.error('Failed to update bundle:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this bundle? This action cannot be undone.')) {
      try {
        await deleteBundle(bundleId);
        // Redirect to bundles list after successful deletion
        window.location.href = '/bundles';
      } catch (error) {
        console.error('Failed to delete bundle:', error);
      }
    }
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
          message={`Failed to load bundle: ${error.message}`}
          onRetry={refetch}
          className="mb-6"
        />
        <Link
          href="/bundles"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Bundles
        </Link>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Bundle not found</h3>
          <p className="mt-2 text-gray-500">
            The bundle you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/bundles"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Bundles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/bundles"
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
          Back to Bundles
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {isEditing ? (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Edit Bundle</h2>
              {updateError && (
                <ErrorMessage
                  message={`Failed to update bundle: ${updateError.message}`}
                  className="mb-4"
                />
              )}
              <form onSubmit={handleUpdate}>
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
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
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
                        <input
                          type="text"
                          value={searchGamesQuery}
                          onChange={(e) => handleGameSearch(e.target.value)}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Search games to add..."
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
                      value={editData.discountPrice}
                      onChange={(e) =>
                        setEditData({ ...editData, discountPrice: e.target.value })
                      }
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  {selectedGames.length > 0 && editData.discountPrice && (
                    <div className="mt-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Original Price:</span>
                        <span>{formatPrice(calculateTotalPrice())}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Discount Price:</span>
                        <span>{formatPrice(parseFloat(editData.discountPrice))}</span>
                      </div>
                      <div className="flex justify-between font-medium text-green-600">
                        <span>Savings:</span>
                        <span>
                          {formatPrice(calculateTotalPrice() - parseFloat(editData.discountPrice))} 
                          ({Math.round((1 - parseFloat(editData.discountPrice) / calculateTotalPrice()) * 100)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isUpdating || 
                      !editData.title.trim() || 
                      selectedGames.length === 0 ||
                      (editData.discountPrice !== '' && parseFloat(editData.discountPrice) <= 0)
                    }
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <LoadingSpinner
                          size="small"
                          color="white"
                          className="mr-2"
                        />
                        Updating...
                      </>
                    ) : (
                      'Update Bundle'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {bundle.title}
                  </h1>
                  <p className="text-gray-500">
                    {bundle.bundleGames.length} games included
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-end">
                  {bundle.discountPrice ? (
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-red-600">
                        {formatPrice(bundle.discountPrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(bundle.pricing.totalOriginalPrice)}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        Save {bundle.pricing.savingsPercentage}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(bundle.pricing.totalOriginalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <LoadingSpinner
                        size="small"
                        color="white"
                        className="mr-2"
                      />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>

              {deleteError && (
                <ErrorMessage
                  message={`Failed to delete bundle: ${deleteError.message}`}
                  className="mb-6"
                />
              )}
            </>
          )}

          {!isEditing && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Included Games
              </h2>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Game
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Publisher
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bundle.bundleGames.map((bundleGame) => (
                      <tr
                        key={bundleGame.game.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {bundleGame.game.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {bundleGame.game.publisher.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900">
                            {formatPrice(bundleGame.game.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/games/${bundleGame.game.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          Total Original Price:
                        </div>
                      </td>
                      <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(bundle.pricing.totalOriginalPrice)}
                        </div>
                      </td>
                    </tr>
                    {bundle.discountPrice && (
                      <>
                        <tr className="bg-gray-50">
                          <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              Bundle Price:
                            </div>
                          </td>
                          <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-red-600">
                              {formatPrice(bundle.discountPrice)}
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              You Save:
                            </div>
                          </td>
                          <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-green-600">
                              {formatPrice(bundle.pricing.savings)} ({bundle.pricing.savingsPercentage}%)
                            </div>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}