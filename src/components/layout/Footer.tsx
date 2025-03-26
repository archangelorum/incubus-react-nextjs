'use client';

import { Link } from '@/i18n/navigation';

import {
  Github,
  Twitter,
  MessageCircle,
  Instagram,
  Youtube,
  ArrowRight
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Incubus
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The future of game distribution on the Polygon blockchain. Buy, sell, and trade games and in-game items as NFTs.
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('nav.home')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/games"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('nav.games')}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('nav.marketplace')}
                </Link>
              </li>
              <li>
                <Link
                  href="/library"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('nav.library')}
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('nav.wallet')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('footer.about')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.careers')}
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.press')}
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.support')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('footer.terms')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.cookies')}
                </Link>
              </li>
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm rounded-l-md bg-background border border-r-0 border-input focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  className="px-3 py-2 rounded-r-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {t('footer.terms')}
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              href="/cookies"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {t('footer.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}