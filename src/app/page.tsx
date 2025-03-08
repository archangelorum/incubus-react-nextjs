import Link from 'next/link';
import { auth } from '@/auth';
import { getUserRole } from './actions';

export default async function HomePage() {
    const session = await auth();
    const userRole = session?.user ? await getUserRole(session.user.id) : null;

    return (
        <div>
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl">
                                    <span className="block">Welcome to</span>
                                    <span className="block text-blue-500">Game Platform</span>
                                </h1>
                                <p className="mt-3 text-base text-foreground/70 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Your one-stop destination for gaming excellence. Access your dashboard, manage games, and connect with the community.
                                </p>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Role-based Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {/* Platform Staff Card */}
                    {userRole === 'platform' && (
                        <Link href="/admin/platform/players" className="group">
                            <div className="bg-background border border-foreground/10 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">Platform Admin</h3>
                                <p className="text-foreground/70">Manage players, staff, and platform settings</p>
                            </div>
                        </Link>
                    )}

                    {/* Publisher Staff Card */}
                    {userRole === 'publisher' && (
                        <Link href="/admin/publisher/games" className="group">
                            <div className="bg-background border border-foreground/10 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">Publisher Dashboard</h3>
                                <p className="text-foreground/70">Manage your games and publisher staff</p>
                            </div>
                        </Link>
                    )}

                    {/* Player Card */}
                    {userRole === 'player' && (
                        <Link href="/profile" className="group">
                            <div className="bg-background border border-foreground/10 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mb-4">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">Player Profile</h3>
                                <p className="text-foreground/70">View your profile, games, and achievements</p>
                            </div>
                        </Link>
                    )}

                    {/* Common Cards */}
                    <Link href="/games" className="group">
                        <div className="bg-background border border-foreground/10 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Browse Games</h3>
                            <p className="text-foreground/70">Explore our collection of games</p>
                        </div>
                    </Link>

                    <Link href="/community" className="group">
                        <div className="bg-background border border-foreground/10 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Community</h3>
                            <p className="text-foreground/70">Connect with other players</p>
                        </div>
                    </Link>

                    <Link href="/support" className="group">
                        <div className="bg-background border border-foreground/10 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Support</h3>
                            <p className="text-foreground/70">Get help and contact support</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
} 