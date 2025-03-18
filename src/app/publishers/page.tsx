/**
 * Publishers List Page
 * 
 * Displays a paginated list of publishers with search functionality
 * and links to individual publisher details
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublishersApi } from '@/utils/api';
import { useFetch, useMutation } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';

export default function PublishersPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPublisher, setNewPublisher] = useState({
    name: '',
    contactInfo: '',
  });

  // Fetch publishers data
  const { data, isLoading, error, refetch } = useFetch(
    () => PublishersApi.getPublishers(page, pageSize, searchQuery),
    { dependencies: [page, pageSize, searchQuery] }
  );

  // Create publisher mutation
  const {
    mutate: createPublisher,
    isLoading: isCreating,
    error: createError,
  } = useMutation((data: typeof newPublisher) =>
    PublishersApi.createPublisher(data)
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPublisher(newPublisher);
      setNewPublisher({ name: '', contactInfo: '' });
      setShowCreateForm(false);
      refetch(); // Refresh publishers list
    } catch (error) {
      console.error('Failed to create publisher:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Publishers</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search publishers..."
              initialValue={searchQuery}
            />
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Add Publisher'}
          </button>
        </div>
      </div>

      {/* Create Publisher Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Publisher</h2>
          {createError && (
            <ErrorMessage
              message={`Failed to create publisher: ${createError.message}`}
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
                value={newPublisher.name}
                onChange={(e) =>
                  setNewPublisher({ ...newPublisher, name: e.target.value })
                }
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Publisher name"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="contactInfo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Information
              </label>
              <input
                type="text"
                id="contactInfo"
                value={newPublisher.contactInfo}
                onChange={(e) =>
                  setNewPublisher({
                    ...newPublisher,
                    contactInfo: e.target.value,
                  })
                }
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Email or phone number"
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
                disabled={isCreating || !newPublisher.name.trim()}
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
                  'Create Publisher'
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
          message={`Failed to load publishers: ${error.message}`}
          onRetry={refetch}
          className="mb-6"
        />
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">
            No publishers found
          </h3>
          <p className="mt-2 text-gray-500">
            {searchQuery
              ? `No publishers matching "${searchQuery}"`
              : 'There are no publishers available at the moment.'}
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
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact Info
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Games
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
                {data.data.map((publisher) => (
                  <tr
                    key={publisher.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {publisher.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {publisher.contactInfo || 'Not provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {publisher._count.games} games
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/publishers/${publisher.id}`}
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