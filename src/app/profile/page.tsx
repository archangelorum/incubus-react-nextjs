"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayerType, PlatformStaffRole, PublisherStaffRole } from '@/types/enums';

interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
    platformStaff?: {
        role: PlatformStaffRole;
        userId: string;
    } | null;
    publisherStaff?: {
        role: PublisherStaffRole;
        publisherId: number;
        userId: string;
        publisher: {
            id: number;
            name: string;
            contactInfo: string | null;
        };
    } | null;
    player?: {
        userId: string;
        type: PlayerType;
    } | null;
    accounts: {
        provider: string;
        providerAccountId: string;
    }[];
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: ''
    });
    const [editError, setEditError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!session?.user) {
                    setError('No active session found');
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/profile');
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                const data = await response.json();
                setProfile(data);
                setEditForm({
                    name: data.name || '',
                    email: data.email
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchProfile();
        } else if (status === 'unauthenticated') {
            setError('Please sign in to view your profile');
            setLoading(false);
        }
    }, [session, status]);

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError(null);

        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update profile');
            }

            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            setIsEditing(false);
        } catch (err) {
            setEditError(err instanceof Error ? err.message : 'Failed to update profile');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Please Sign In</h2>
                    <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                    <p className="text-gray-300">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">No Profile Found</h2>
                    <Link href="/auth/login" className="text-blue-500 hover:text-blue-400">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Main Content */}
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {profile.name?.[0]?.toUpperCase() || (profile.email?.[0]?.toUpperCase() || '?')}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{profile.name || 'Anonymous User'}</h1>
                                <p className="text-gray-300">{profile.email || 'No email provided'}</p>
                            </div>
                            <div className="ml-auto">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    {isEditing ? 'Cancel' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Edit Profile Form */}
                    {isEditing && (
                        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold text-white mb-4">Edit Profile</h2>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                {editError && (
                                    <div className="bg-red-500 text-white p-3 rounded">
                                        {editError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Role-specific Information */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Platform Staff Section */}
                        {profile.platformStaff && (
                            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Platform Staff Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Role</label>
                                        <p className="mt-1 text-white">{profile.platformStaff.role}</p>
                                    </div>
                                    <Link
                                        href="/admin/platform/players"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Go to Platform Dashboard
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Publisher Staff Section */}
                        {profile.publisherStaff && (
                            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Publisher Staff Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Role</label>
                                        <p className="mt-1 text-white">{profile.publisherStaff.role}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Publisher</label>
                                        <p className="mt-1 text-white">{profile.publisherStaff.publisher.name}</p>
                                    </div>
                                    <Link
                                        href="/admin/publisher/games"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                    >
                                        Go to Publisher Dashboard
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Player Section */}
                        {profile.player && (
                            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Player Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Player Type</label>
                                        <p className="mt-1 text-white">{profile.player.type}</p>
                                    </div>
                                    <Link
                                        href="/games"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                                    >
                                        Browse Games
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Account Settings */}
                        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Account Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Connected Accounts</label>
                                    <div className="mt-2 space-y-2">
                                        {(profile.accounts || []).map((account) => (
                                            <div key={account.provider} className="flex items-center space-x-2">
                                                <span className="text-white">{account.provider}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-300">{account.providerAccountId}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Email Verification</label>
                                    <p className="mt-1 text-white">
                                        {profile.emailVerified ? 'Verified' : 'Not Verified'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Member Since</label>
                                    <p className="mt-1 text-white">
                                        {new Date(profile.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Last Updated</label>
                                    <p className="mt-1 text-white">
                                        {new Date(profile.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 