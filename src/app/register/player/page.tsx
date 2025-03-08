"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { registerPlayer } from '@/utils/register/client/player';
import { toast } from 'sonner';

export default function PlayerRegistrationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await registerPlayer();
            toast.success('Successfully registered as a player!');
            router.push('/profile');
        } catch (error: any) {
            // Handle specific error cases
            if (error.response?.status === 400) {
                toast.error('You are already registered as a player.');
                router.push('/profile');
            } else {
                toast.error(error.response?.data?.error || 'Failed to register as a player. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 border-t-transparent border-gray-200 rounded-full"></div>
                    <p className="mt-4 text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Register as a Player
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Join our gaming community and start playing amazing games!
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <p className="text-gray-300 mb-4">
                                By registering as a player, you'll get access to:
                            </p>
                            <ul className="list-disc list-inside text-gray-300 space-y-2">
                                <li>Browse and play games</li>
                                <li>Track your achievements</li>
                                <li>Write reviews and ratings</li>
                                <li>Connect with other players</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registering...
                                </span>
                            ) : (
                                'Register as Player'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 