import { ThemeProvider } from '@/components/theme/theme-provider';
import { I18nProvider } from '@/components/i18n/i18n-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { WalletProvider } from '@/components/wallet/wallet-provider';
import { Toaster } from 'sonner';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function Providers({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider initialSession={session}>
          <WalletProvider>
            {children}
            <Toaster position="top-right" closeButton richColors />
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}