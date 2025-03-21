'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/theme/theme-provider';
import { useI18n } from '@/components/i18n/i18n-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { useWallet } from '@/components/wallet/wallet-provider';
import {
    Menu,
    Search,
    ShoppingCart,
    User,
    LogOut,
    Settings,
    Moon,
    Sun,
    Globe,
    Wallet,
    Library,
    ChevronDown
} from 'lucide-react';
import { languageNames, Language } from '@/components/i18n/i18n-provider';

export function Header() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { t, language, setLanguage } = useI18n();
    const { user, isAuthenticated, signOut } = useAuth();
    const { activeWallet, isConnected } = useWallet();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setIsUserMenuOpen(false);
            setIsLanguageMenuOpen(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setIsLanguageMenuOpen(false);
    };

    const handleSignOut = async () => {
        await signOut();
        setIsUserMenuOpen(false);
    };

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-background/95 backdrop-blur-md shadow-md'
                    : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            Incubus
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className={isActive('/') ? 'nav-link-active' : 'nav-link'}
                        >
                            {t('nav.home')}
                        </Link>
                        <Link
                            href="/games"
                            className={isActive('/games') ? 'nav-link-active' : 'nav-link'}
                        >
                            {t('nav.games')}
                        </Link>
                        <Link
                            href="/marketplace"
                            className={isActive('/marketplace') ? 'nav-link-active' : 'nav-link'}
                        >
                            {t('nav.marketplace')}
                        </Link>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Search */}
                        <button
                            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                            aria-label={t('common.search')}
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        {/* Language Selector */}
                        <div className="relative dropdown-container">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLanguageMenuOpen(!isLanguageMenuOpen);
                                }}
                                className="flex items-center space-x-1 p-2 rounded-full hover:bg-primary/10 transition-colors"
                            >
                                <Globe className="w-5 h-5" />
                                <span className="text-sm font-medium">{/*language.toUpperCase()*/}</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isLanguageMenuOpen && (
                                <>
                                    <div className="dropdown-bridge" />
                                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg overflow-hidden z-20 dropdown-menu">
                                        <div className="py-1">
                                            {Object.entries(languageNames).map(([code, name]) => (
                                                <button
                                                    key={code}
                                                    onClick={() => handleLanguageChange(code as Language)}
                                                    className={`w-full text-left px-4 py-2 text-sm ${language === code
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'hover:bg-primary/5'
                                                        }`}
                                                >
                                                    {name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Auth / User Menu */}
                        {isAuthenticated ? (
                            <div className="relative dropdown-container">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsUserMenuOpen(!isUserMenuOpen);
                                    }}
                                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-primary/10 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                        {user?.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {isUserMenuOpen && (
                                    <>
                                        <div className="dropdown-bridge" />
                                        <div className="absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg overflow-hidden z-20 dropdown-menu">
                                            <div className="py-1">
                                                <div className="px-4 py-2 border-b border-border">
                                                    <p className="text-sm font-medium">{user?.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                                </div>

                                                <Link
                                                    href="/profile"
                                                    className="flex items-center px-4 py-2 text-sm hover:bg-primary/5"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <User className="w-4 h-4 mr-2" />
                                                    {t('nav.profile')}
                                                </Link>

                                                <Link
                                                    href="/library"
                                                    className="flex items-center px-4 py-2 text-sm hover:bg-primary/5"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <Library className="w-4 h-4 mr-2" />
                                                    {t('nav.library')}
                                                </Link>

                                                <Link
                                                    href="/wallet"
                                                    className="flex items-center px-4 py-2 text-sm hover:bg-primary/5"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <Wallet className="w-4 h-4 mr-2" />
                                                    {t('nav.wallet')}
                                                    {isConnected && (
                                                        <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                            {activeWallet?.balance.toFixed(2)} SOL
                                                        </span>
                                                    )}
                                                </Link>

                                                <Link
                                                    href="/settings"
                                                    className="flex items-center px-4 py-2 text-sm hover:bg-primary/5"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    {t('nav.settings')}
                                                </Link>

                                                {user?.role === 'admin' && (
                                                    <Link
                                                        href="/admin"
                                                        className="flex items-center px-4 py-2 text-sm hover:bg-primary/5"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <Settings className="w-4 h-4 mr-2" />
                                                        {t('nav.admin')}
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/5"
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" />
                                                    {t('auth.signOut')}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    href="/auth/signin"
                                    className="px-4 py-2 text-sm rounded-md hover:bg-primary/10 transition-colors"
                                >
                                    {t('auth.signIn')}
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    {t('auth.signUp')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-full hover:bg-primary/10 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-background border-t border-border">
                    <div className="container mx-auto px-4 py-4">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                href="/"
                                className={`px-2 py-2 rounded-md ${isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t('nav.home')}
                            </Link>
                            <Link
                                href="/games"
                                className={`px-2 py-2 rounded-md ${isActive('/games') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t('nav.games')}
                            </Link>
                            <Link
                                href="/marketplace"
                                className={`px-2 py-2 rounded-md ${isActive('/marketplace') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t('nav.marketplace')}
                            </Link>

                            {isAuthenticated && (
                                <>
                                    <Link
                                        href="/library"
                                        className={`px-2 py-2 rounded-md ${isActive('/library') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('nav.library')}
                                    </Link>
                                    <Link
                                        href="/wallet"
                                        className={`px-2 py-2 rounded-md ${isActive('/wallet') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('nav.wallet')}
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className={`px-2 py-2 rounded-md ${isActive('/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('nav.profile')}
                                    </Link>
                                </>
                            )}

                            <div className="pt-2 border-t border-border flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                    >
                                        {theme === 'dark' ? (
                                            <Sun className="w-5 h-5" />
                                        ) : (
                                            <Moon className="w-5 h-5" />
                                        )}
                                    </button>

                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value as Language)}
                                        className="bg-transparent border border-border rounded-md text-sm p-1"
                                    >
                                        {Object.entries(languageNames).map(([code, name]) => (
                                            <option key={code} value={code}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {isAuthenticated ? (
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center px-3 py-1 text-sm text-destructive hover:bg-destructive/5 rounded-md"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        {t('auth.signOut')}
                                    </button>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Link
                                            href="/auth/signin"
                                            className="px-3 py-1 text-sm rounded-md hover:bg-primary/10 transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {t('auth.signIn')}
                                        </Link>
                                        <Link
                                            href="/auth/signup"
                                            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {t('auth.signUp')}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}