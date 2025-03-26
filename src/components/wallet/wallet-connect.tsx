'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useWallet } from '@/components/wallet/wallet-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { useTranslations } from 'next-intl';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type WalletOption = {
  id: string;
  name: string;
  type: 'phantom' | 'solflare' | 'slope' | 'sollet' | 'other';
  logo: string;
  description: string;
};

const walletOptions: WalletOption[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    type: 'phantom',
    logo: '/wallets/phantom.png',
    description: 'The most popular Solana wallet with a focus on security and usability.',
  },
  {
    id: 'solflare',
    name: 'Solflare',
    type: 'solflare',
    logo: '/wallets/solflare.png',
    description: 'A non-custodial wallet built specifically for Solana.',
  },
  {
    id: 'slope',
    name: 'Slope',
    type: 'slope',
    logo: '/wallets/slope.png',
    description: 'A wallet built for the Solana ecosystem with cross-chain support.',
  },
  {
    id: 'sollet',
    name: 'Sollet',
    type: 'sollet',
    logo: '/wallets/sollet.png',
    description: 'A web wallet for Solana that supports SPL tokens and NFTs.',
  },
];

export function WalletConnect() {
  const t = useTranslations();
  const { user, isAuthenticated } = useAuth();
  const { 
    wallets, 
    isConnecting, 
    isConnected, 
    error, 
    connectWallet 
  } = useWallet();
  
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleConnectWallet = async (type: 'phantom' | 'solflare' | 'slope' | 'sollet' | 'other') => {
    setSelectedWallet(type);
    try {
      await connectWallet(type);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    } finally {
      setSelectedWallet(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          Please sign in to connect your wallet.
        </p>
      </div>
    );
  }

  return (
    <div id="wallet-connect-section" className="p-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {walletOptions.map((wallet) => {
          const isConnected = wallets.some(w => w.type === wallet.type);
          const isLoading = isConnecting && selectedWallet === wallet.type;
          
          return (
            <div 
              key={wallet.id} 
              className={`p-4 rounded-lg border ${
                isConnected 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-border hover:border-primary/30 hover:bg-accent transition-colors'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 overflow-hidden">
                    <Image
                      src={wallet.logo}
                      alt={wallet.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{wallet.name}</h4>
                    <p className="text-xs text-muted-foreground">{wallet.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleConnectWallet(wallet.type)}
                  disabled={isConnected || isLoading || isConnecting}
                  className={`px-3 py-1.5 rounded-md ${
                    isConnected 
                      ? 'bg-primary/20 text-primary cursor-default'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                  }`}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : isConnected ? (
                    'Connected'
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Don't have a wallet?{' '}
          <a 
            href="https://phantom.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Get Phantom
          </a>
        </p>
      </div>
    </div>
  );
}