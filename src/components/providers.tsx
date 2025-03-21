'use client';

import { ThemeProvider } from '@/components/theme/theme-provider';
import { I18nProvider } from '@/components/i18n/i18n-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { WalletProvider } from '@/components/wallet/wallet-provider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <WalletProvider>
            {children}
            <Toaster position="top-right" closeButton richColors />
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}