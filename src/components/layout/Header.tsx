"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState<'platform' | 'publisher' | 'player' | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkUserRole = async () => {
            if (!session?.user) return;

            try {
                const response = await fetch('/api/user/role');
                if (!response.ok) {
                    throw new Error('Failed to fetch user role');
                }
                const data = await response.json();
                setUserRole(data.role);
            } catch (error) {
                console.error('Error checking user role:', error);
            }
        };

        checkUserRole();
    }, [session]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Main Navigation */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-2xl font-bold text-white">
                                Game Platform
                            </Link>
                        </div>
                        <nav className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
                            <Link
                                href="/games"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Games
                            </Link>
                            <Link
                                href="/community"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Community
                            </Link>
                            <Link
                                href="/support"
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Support
                            </Link>
                        </nav>
                    </div>

                    {/* Account Controls */}
                    <div className="flex items-center">
                        {session ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
                                >
                                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                                        <span className="text-white font-medium">
                                            {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden sm:block">{session.user?.name || session.user?.email}</span>
                                    <svg
                                        className={`h-5 w-5 transform ${isMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                                        <div className="py-1" role="menu">
                                            {/* Admin Dashboard Links */}
                                            {userRole === 'platform' && (
                                                <Link
                                                    href="/admin/platform/players"
                                                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                                    role="menuitem"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    Platform Dashboard
                                                </Link>
                                            )}
                                            {userRole === 'publisher' && (
                                                <Link
                                                    href="/admin/publisher/games"
                                                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                                    role="menuitem"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    Publisher Dashboard
                                                </Link>
                                            )}
                                            {/* Common Menu Items */}
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                                role="menuitem"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                                role="menuitem"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Settings
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                                role="menuitem"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {/* Admin Dashboard Links for Mobile */}
                        {userRole === 'platform' && (
                            <Link
                                href="/admin/platform/players"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Platform Dashboard
                            </Link>
                        )}
                        {userRole === 'publisher' && (
                            <Link
                                href="/admin/publisher/games"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Publisher Dashboard
                            </Link>
                        )}
                        {/* Common Mobile Menu Items */}
                        <Link
                            href="/games"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Games
                        </Link>
                        <Link
                            href="/community"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Community
                        </Link>
                        <Link
                            href="/support"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Support
                        </Link>
                        {session ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/settings"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Settings
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
} 