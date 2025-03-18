/**
 * Genres List Page
 * 
 * Displays a list of game genres with search functionality
 * and links to individual genre details
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GenresApi } from '@/utils/api';
import { useFetch, useMutation } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SearchBar from '@/components/ui/SearchBar';

export default function GenresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGenre, setNewGenre] = useState({
    name: '',
  });

  // Fetch genres data
  const { data: genres, isLoading, error, refetch } = useFetch(
    () => GenresApi.getGenres(searchQuery),
    { dependencies: [searchQuery] }
  );

  // Create genre mutation
  const {
    mutate: createGenre,
    isLoading: isCreating,
    error: createError,
  } = useMutation((data: typeof newGenre) => GenresApi.createGenre(data));

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGenre(newGenre);
      setNewGenre({ name: '' });
      setShowCreateForm(false);
      refetch(); // Refresh genres list
    } catch (error) {
      console.error('Failed to create genre:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Genres</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search genres..."
              initialValue={searchQuery}
            />
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Add Genre'}
          </button>
        </div>
      </div>

      {/* Create Genre Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Genre</h2>
          {createError && (
            <ErrorMessage
              message={`Failed to create genre: ${createError.message}`}
              className="mb-4"
            />
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={newGenre.name}
                onChange={(e) =>
                  setNewGenre({ ...newGenre, name: e.target.value })
                }
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Genre name"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !newGenre.name.trim()}
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
                  'Create Genre'
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
          message={`Failed to load genres: ${error.message}`}
          onRetry={refetch}
          className="mb-6"
        />
      )}

      {genres && genres.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No genres found</h3>
          <p className="mt-2 text-gray-500">
            {searchQuery
              ? `No genres matching "${searchQuery}"`
              : 'There are no genres available at the moment.'}
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

      {genres && genres.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {genres.map((genre) => (
            <Link
              href={`/genres/${genre.id}`}
              key={genre.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {genre.name}
              </h2>
              <p className="text-sm text-gray-500">
                {genre._count.gameGenres} games
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}