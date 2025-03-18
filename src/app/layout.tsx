import SessionProvider from '@/components/providers/SessionProvider';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { AuthButton } from '@/components/auth/AuthButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Game Platform',
  description: 'A comprehensive game management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <SessionProvider>
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center">
                  <svg
                    className="h-8 w-8 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    Game Platform
                  </span>
                </Link>
                <div className="hidden md:flex space-x-4">
                  <Link
                    href="/games"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Games
                  </Link>
                  <Link
                    href="/publishers"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Publishers
                  </Link>
                  <Link
                    href="/genres"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Genres
                  </Link>
                  <Link
                    href="/bundles"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Bundles
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Import and use the AuthButton component */}
                <AuthButton />
              </div>
            </div>
            {/* Mobile menu - shown on small screens */}
            <div className="md:hidden mt-2 pt-2 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/games"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Games
                </Link>
                <Link
                  href="/publishers"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Publishers
                </Link>
                <Link
                  href="/genres"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Genres
                </Link>
                <Link
                  href="/bundles"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Bundles
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600">
                  &copy; {new Date().getFullYear()} Game Platform. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Terms of Service"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Privacy Policy"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Contact Us"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
