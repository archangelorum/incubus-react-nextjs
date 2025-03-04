"use client";

import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <SessionProvider>
                    <div className="min-h-screen bg-gray-900 flex flex-col">
                        <Header />
                        <main className="flex-grow">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </SessionProvider>
            </body>
        </html>
    );
}
