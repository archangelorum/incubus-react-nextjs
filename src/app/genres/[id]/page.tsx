/**
 * Genre Detail Page
 * 
 * Displays detailed information about a specific genre,
 * including all games in that genre
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GenresApi } from '@/utils/api';
import { useFetch, useMutation } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface GenreDetailPageProps {
  params: {
    id: string;
  };
}

export default function GenreDetailPage({ params }: GenreDetailPageProps) {
  const genreId = parseInt(params.id);
  const [isEditing, setIsEditing] = useState(false);
  const [genreName, setGenreName] = useState('');

  // Fetch genre data
  const { data: genre, isLoading, error, refetch } = useFetch(
    () => GenresApi.getGenre(genreId),
    { 
      dependencies: [genreId],
      initialFetch: true
    }
  );

  // Update genre mutation
  const {
    mutate: updateGenre,
    isLoading: isUpdating,
    error: updateError,
  } = useMutation((data: { name: string }) =>
    GenresApi.updateGenre(genreId, data)
  );

  // Delete genre mutation
  const {
    mutate: deleteGenre,
    isLoading: isDeleting,
    error: deleteError,
  } = useMutation((id: number) => GenresApi.deleteGenre(id));

  // Start editing
  const handleEdit = () => {
    if (genre) {
      setGenreName(genre.name);
      setIsEditing(true);
    }
  };

  // Handle update form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGenre({ name: genreName });
      setIsEditing(false);
      refetch(); // Refresh genre data
    } catch (error) {
      console.error('Failed to update genre:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this genre? This action cannot be undone.')) {
      try {
        await deleteGenre(genreId);
        // Redirect to genres list after successful deletion
        window.location.href = '/genres';
      } catch (error) {
        console.error('Failed to delete genre:', error);
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
          message={`Failed to load genre: ${error.message}`}
          onRetry={refetch}
          className="mb-6"
        />
        <Link
          href="/genres"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Genres
        </Link>
      </div>
    );
  }

  if (!genre) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Genre not found</h3>
          <p className="mt-2 text-gray-500">
            The genre you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/genres"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Genres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/genres"
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
          Back to Genres
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            {isEditing ? (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Edit Genre</h2>
                {updateError && (
                  <ErrorMessage
                    message={`Failed to update genre: ${updateError.message}`}
                    className="mb-4"
                  />
                )}
                <form onSubmit={handleUpdate} className="flex items-end gap-4">
                  <div className="flex-grow">
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
                      value={genreName}
                      onChange={(e) => setGenreName(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Genre name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating || !genreName.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <LoadingSpinner
                            size="small"
                            color="white"
                            className="mr-2"
                          />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {genre.name}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    {genre.gameGenres.length} games in this genre
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting || genre.gameGenres.length > 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                    title={
                      genre.gameGenres.length > 0
                        ? 'Cannot delete a genre that has games. Remove all games first.'
                        : 'Delete this genre'
                    }
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
              </>
            )}
          </div>

          {deleteError && (
            <ErrorMessage
              message={`Failed to delete genre: ${deleteError.message}`}
              className="mb-6"
            />
          )}

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Games in this Genre
            </h2>

            {genre.gameGenres.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  There are no games in this genre yet.
                </p>
              </div>
            ) : (
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {genre.gameGenres.map((gameGenre) => (
                      <tr
                        key={gameGenre.game.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {gameGenre.game.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {gameGenre.game.publisher.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/games/${gameGenre.game.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}