import { headers } from 'next/headers';
import Link from 'next/link';
import { auth } from '@/auth';
import { fetchAdminStats, type AdminStats } from '@/utils/fetch/server/admin';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/admin';
    const session = await auth();

    if (!session?.user) {
        return null;
    }

    let stats: AdminStats | null = null;
    let error: string | null = null;
    
    try {
        stats = await fetchAdminStats();
    } catch (error) {
        console.error('Failed to fetch admin stats:', {
            error,
            session: session,
            user: session?.user,
            pathname
        });
        error = error instanceof Error ? error.message : 'Failed to fetch admin stats';
    }

    return (
        <div className="min-h-screen bg-background">
            <nav className="bg-background border-b border-foreground/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-foreground text-xl font-bold">Admin Dashboard</span>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <Link
                                        href="/admin"
                                        className={`${
                                            pathname === '/admin'
                                                ? 'nav-link-active'
                                                : 'nav-link'
                                        } px-3 py-2 rounded-md text-sm font-medium`}
                                    >
                                        Overview
                                    </Link>
                                    <Link
                                        href="/admin/users"
                                        className={`${
                                            pathname === '/admin/users'
                                                ? 'nav-link-active'
                                                : 'nav-link'
                                        } px-3 py-2 rounded-md text-sm font-medium`}
                                    >
                                        Users
                                    </Link>
                                    <Link
                                        href="/admin/games"
                                        className={`${
                                            pathname === '/admin/games'
                                                ? 'nav-link-active'
                                                : 'nav-link'
                                        } px-3 py-2 rounded-md text-sm font-medium`}
                                    >
                                        Games
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                        {error}
                    </div>
                )}
                {stats && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="card p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-foreground/70 truncate">Total Users</dt>
                                        <dd className="text-lg font-medium text-foreground">{stats.totalUsers}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="card p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-foreground/70 truncate">Total Players</dt>
                                        <dd className="text-lg font-medium text-foreground">{stats.totalPlayers}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="card p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-foreground/70 truncate">Total Games</dt>
                                        <dd className="text-lg font-medium text-foreground">{stats.totalGames}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="card p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-foreground/70 truncate">Total Publishers</dt>
                                        <dd className="text-lg font-medium text-foreground">{stats.totalPublishers}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card p-6">
                    {children}
                </div>
            </main>
        </div>
    );
} 