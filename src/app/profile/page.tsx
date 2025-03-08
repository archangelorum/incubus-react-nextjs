"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayerType, PlatformStaffRole, PublisherStaffRole } from '@/types/enums';
import api from "@/utils/axios";
import { toast } from 'sonner';

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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user) return;

            try {
                const response = await api.get('/api/user/profile');
                setProfile(response.data.data as unknown as UserProfile);
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [session]);

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 border-t-transparent border-primary/20 rounded-full"></div>
                    <p className="mt-4 text-foreground/70">Loading...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <p className="text-foreground/70">Failed to load profile</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="space-y-8">
                    {/* Basic Information */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground/70">Name</label>
                                <p className="mt-1 text-foreground">{profile.name || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground/70">Email</label>
                                <p className="mt-1 text-foreground">{profile.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground/70">Account Created</label>
                                <p className="mt-1 text-foreground">{new Date(profile.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Role-specific Information */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Platform Staff Section */}
                        {profile.platformStaff && (
                            <div className="card p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">Platform Staff Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/70">Role</label>
                                        <p className="mt-1 text-foreground">{profile.platformStaff.role}</p>
                                    </div>
                                    <Link
                                        href="/admin/platform/players"
                                        className="action-button inline-flex items-center px-4 py-2 rounded-lg"
                                    >
                                        Go to Platform Dashboard
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Publisher Staff Section */}
                        {profile.publisherStaff && (
                            <div className="card p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">Publisher Staff Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/70">Role</label>
                                        <p className="mt-1 text-foreground">{profile.publisherStaff.role}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/70">Publisher</label>
                                        <p className="mt-1 text-foreground">{profile.publisherStaff.publisher.name}</p>
                                    </div>
                                    <Link
                                        href="/admin/publisher/games"
                                        className="action-button inline-flex items-center px-4 py-2 rounded-lg"
                                    >
                                        Go to Publisher Dashboard
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Player Section */}
                        {profile.player ? (
                            <div className="card p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">Player Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/70">Player Type</label>
                                        <p className="mt-1 text-foreground">{profile.player.type}</p>
                                    </div>
                                    <Link
                                        href="/games"
                                        className="action-button inline-flex items-center px-4 py-2 rounded-lg"
                                    >
                                        Browse Games
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="card p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">Register as a User</h2>
                                <div className="space-y-4">
                                    <p className="text-foreground/70">
                                        Choose your role and start your journey with us!
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Link
                                            href="/register/player"
                                            className="action-button inline-flex items-center justify-center px-4 py-2 rounded-lg"
                                        >
                                            Register as Player
                                        </Link>
                                        <Link
                                            href="/register/platform-staff"
                                            className="action-button inline-flex items-center justify-center px-4 py-2 rounded-lg"
                                        >
                                            Register as Platform Staff
                                        </Link>
                                        <Link
                                            href="/register/publisher-staff"
                                            className="action-button inline-flex items-center justify-center px-4 py-2 rounded-lg"
                                        >
                                            Register as Publisher Staff
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 