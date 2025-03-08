import { Inter } from 'next/font/google';
import SessionProvider from '@/components/providers/SessionProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MainContent from '@/components/layout/MainContent';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider>
                    <SessionProvider>
                        <Header />
                        <MainContent>
                            {children}
                        </MainContent>
                        <Footer />
                        <Toaster />
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
