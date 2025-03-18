/**
 * Publisher Detail Page
 * 
 * Displays detailed information about a specific publisher,
 * including their games and staff members
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublishersApi } from '@/utils/api';
import { useFetch, useMutation } from '@/hooks/useFetch';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface PublisherDetailPageProps {
    params: Promise<{
        id: string;
    }>
}

export default function PublisherDetailPage({ params }: PublisherDetailPageProps) {
    const publisherId = parseInt(React.use(params).id);
    const [activeTab, setActiveTab] = useState<'games' | 'staff'>('games');
    const [showAddStaffForm, setShowAddStaffForm] = useState(false);
    const [newStaff, setNewStaff] = useState({
        email: '',
        name: '',
        role: 'Publisher',
    });

    // Fetch publisher data
    const { data: publisher, isLoading, error, refetch } = useFetch(
        () => PublishersApi.getPublisher(publisherId),
        { dependencies: [publisherId] }
    );

    // Fetch publisher staff
    const { data: staffData, isLoading: isLoadingStaff, error: staffError, refetch: refetchStaff } = useFetch(
        () => PublishersApi.getPublisherStaff(publisherId),
        { dependencies: [publisherId] }
    );

    // Add staff mutation
    const {
        mutate: addStaff,
        isLoading: isAddingStaff,
        error: addStaffError,
    } = useMutation((data: typeof newStaff) =>
        PublishersApi.addPublisherStaff(publisherId, data)
    );

    // Remove staff mutation
    const {
        mutate: removeStaff,
        isLoading: isRemovingStaff,
    } = useMutation((staffUserId: string) =>
        PublishersApi.removePublisherStaff(publisherId, staffUserId)
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

    // Handle add staff form submission
    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addStaff(newStaff);
            setNewStaff({ email: '', name: '', role: 'Publisher' });
            setShowAddStaffForm(false);
            refetchStaff(); // Refresh staff list
        } catch (error) {
            console.error('Failed to add staff:', error);
        }
    };

    // Handle remove staff
    const handleRemoveStaff = async (staffUserId: string) => {
        if (confirm('Are you sure you want to remove this staff member?')) {
            try {
                await removeStaff(staffUserId);
                refetchStaff(); // Refresh staff list
            } catch (error) {
                console.error('Failed to remove staff:', error);
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
                    message={`Failed to load publisher: ${error.message}`}
                    onRetry={refetch}
                    className="mb-6"
                />
                <Link
                    href="/publishers"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    Back to Publishers
                </Link>
            </div>
        );
    }

    if (!publisher) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">
                        Publisher not found
                    </h3>
                    <p className="mt-2 text-gray-500">
                        The publisher you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        href="/publishers"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Back to Publishers
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    href="/publishers"
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
                    Back to Publishers
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {publisher.name}
                            </h1>
                            {publisher.contactInfo && (
                                <p className="text-gray-600">
                                    Contact: {publisher.contactInfo}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('games')}
                                className={`${activeTab === 'games'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Games ({publisher.games.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('staff')}
                                className={`${activeTab === 'staff'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Staff ({publisher.PublisherStaff.length})
                            </button>
                        </nav>
                    </div>

                    {/* Games Tab */}
                    {activeTab === 'games' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Games</h2>
                                <Link
                                    href="/games/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Add Game
                                </Link>
                            </div>

                            {publisher.games.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">
                                        This publisher doesn't have any games yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {publisher.games.map((game) => (
                                        <Link
                                            href={`/games/${game.id}`}
                                            key={game.id}
                                            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                                        >
                                            <div className="p-5">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {game.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    Released: {formatDate(game.releaseDate)}
                                                </p>
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
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Staff Tab */}
                    {activeTab === 'staff' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Staff</h2>
                                <button
                                    onClick={() => setShowAddStaffForm(!showAddStaffForm)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    {showAddStaffForm ? 'Cancel' : 'Add Staff'}
                                </button>
                            </div>

                            {/* Add Staff Form */}
                            {showAddStaffForm && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                                        Add Staff Member
                                    </h3>
                                    {addStaffError && (
                                        <ErrorMessage
                                            message={`Failed to add staff: ${addStaffError.message}`}
                                            className="mb-4"
                                        />
                                    )}
                                    <form onSubmit={handleAddStaff}>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                value={newStaff.email}
                                                onChange={(e) =>
                                                    setNewStaff({ ...newStaff, email: e.target.value })
                                                }
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                placeholder="staff@example.com"
                                            />
                                        </div>
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
                                                value={newStaff.name}
                                                onChange={(e) =>
                                                    setNewStaff({ ...newStaff, name: e.target.value })
                                                }
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                placeholder="Staff name"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="role"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Role *
                                            </label>
                                            <select
                                                id="role"
                                                required
                                                value={newStaff.role}
                                                onChange={(e) =>
                                                    setNewStaff({ ...newStaff, role: e.target.value })
                                                }
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            >
                                                <option value="Publisher">Publisher</option>
                                                <option value="Developer">Developer</option>
                                                <option value="Artist">Artist</option>
                                                <option value="Tester">Tester</option>
                                                <option value="QA">QA</option>
                                                <option value="Marketing">Marketing</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddStaffForm(false)}
                                                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={
                                                    isAddingStaff ||
                                                    !newStaff.email.trim() ||
                                                    !newStaff.name.trim()
                                                }
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                            >
                                                {isAddingStaff ? (
                                                    <>
                                                        <LoadingSpinner
                                                            size="small"
                                                            color="white"
                                                            className="mr-2"
                                                        />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    'Add Staff'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {isLoadingStaff ? (
                                <div className="flex justify-center items-center h-32">
                                    <LoadingSpinner size="medium" />
                                </div>
                            ) : staffError ? (
                                <ErrorMessage
                                    message={`Failed to load staff: ${staffError.message}`}
                                    onRetry={refetchStaff}
                                    className="mb-4"
                                />
                            ) : staffData && staffData.staff.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">
                                        This publisher doesn't have any staff members yet.
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
                                                    Name
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Email
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Role
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
                                            {staffData?.staff.map((staff) => (
                                                <tr
                                                    key={staff.userId}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                                                                {staff.user.image ? (
                                                                    <img
                                                                        src={staff.user.image}
                                                                        alt={staff.user.name || 'Staff'}
                                                                        className="h-8 w-8 rounded-full"
                                                                    />
                                                                ) : (
                                                                    <span>
                                                                        {(staff.user.name || 'S')
                                                                            .charAt(0)
                                                                            .toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {staff.user.name || 'Unnamed Staff'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {staff.user.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {staff.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleRemoveStaff(staff.userId)}
                                                            disabled={isRemovingStaff}
                                                            className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}