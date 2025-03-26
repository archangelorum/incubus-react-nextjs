'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useWallet } from '@/components/wallet/wallet-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { useTranslations } from 'next-intl';
import { 
  Copy, 
  CheckCircle, 
  RefreshCw, 
  Wallet as WalletIcon, 
  Plus, 
  ExternalLink, 
  Trash, 
  Star, 
  StarOff 
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function WalletDashboard() {
  const t = useTranslations();
  const { user, isAuthenticated } = useAuth();
  const { 
    wallets, 
    activeWallet, 
    isConnecting, 
    isConnected, 
    error, 
    connectWallet, 
    disconnectWallet, 
    setActiveWallet, 
    refreshBalance 
  } = useWallet();
  
  const [copied, setCopied] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const copyToClipboard = (text: string, walletId: string) => {
    navigator.clipboard.writeText(text);
    setCopied(walletId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRefreshBalance = async (walletId: string) => {
    setRefreshing(walletId);
    await refreshBalance(walletId);
    setRefreshing(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <WalletIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
        <p className="text-muted-foreground mb-4">
          Please sign in to view and manage your wallets.
        </p>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4">Connecting to wallet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      </div>
    );
  }

  if (!isConnected || wallets.length === 0) {
    return (
      <div className="p-8 text-center">
        <WalletIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Wallets Connected</h3>
        <p className="text-muted-foreground mb-6">
          Connect a wallet to start buying, selling, and trading NFTs.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Active Wallet */}
      {activeWallet && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Active Wallet</h3>
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <WalletIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{activeWallet.label || `My ${activeWallet.type} Wallet`}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="truncate max-w-[180px]">{activeWallet.address}</span>
                    <button
                      onClick={() => copyToClipboard(activeWallet.address, activeWallet.id)}
                      className="ml-1 p-1 hover:text-primary transition-colors"
                      aria-label="Copy address"
                    >
                      {copied === activeWallet.id ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold">{activeWallet.balance.toFixed(4)} SOL</div>
                <button
                  onClick={() => handleRefreshBalance(activeWallet.id)}
                  disabled={refreshing === activeWallet.id}
                  className="text-sm text-primary hover:underline flex items-center justify-end ml-auto"
                >
                  {refreshing === activeWallet.id ? (
                    <LoadingSpinner size="sm" className="mr-1" />
                  ) : (
                    <RefreshCw className="w-3 h-3 mr-1" />
                  )}
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://explorer.solana.com/address/${activeWallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm bg-secondary/10 text-secondary-foreground rounded-md hover:bg-secondary/20 transition-colors flex items-center"
              >
                View on Explorer
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              
              <button
                onClick={() => disconnectWallet(activeWallet.id)}
                className="px-3 py-1.5 text-sm bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors flex items-center"
              >
                Disconnect
                <Trash className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Wallets */}
      <div>
        <h3 className="text-lg font-semibold mb-4">My Wallets</h3>
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id} 
              className={`rounded-lg p-4 flex items-center justify-between ${
                activeWallet?.id === wallet.id 
                  ? 'bg-primary/5 border border-primary/20' 
                  : 'bg-card hover:bg-accent transition-colors border border-border'
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <WalletIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{wallet.label || `My ${wallet.type} Wallet`}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="truncate max-w-[180px]">{wallet.address}</span>
                    <button
                      onClick={() => copyToClipboard(wallet.address, wallet.id)}
                      className="ml-1 p-1 hover:text-primary transition-colors"
                      aria-label="Copy address"
                    >
                      {copied === wallet.id ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <div className="font-bold">{wallet.balance.toFixed(4)} SOL</div>
                  <div className="text-xs text-muted-foreground">
                    {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  {activeWallet?.id !== wallet.id && (
                    <button
                      onClick={() => setActiveWallet(wallet.id)}
                      className="p-1.5 rounded-md hover:bg-primary/10 transition-colors"
                      aria-label="Set as active wallet"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  
                  {activeWallet?.id === wallet.id && (
                    <button
                      disabled
                      className="p-1.5 rounded-md text-primary"
                      aria-label="Active wallet"
                    >
                      <Star className="w-4 h-4 fill-primary" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleRefreshBalance(wallet.id)}
                    disabled={refreshing === wallet.id}
                    className="p-1.5 rounded-md hover:bg-primary/10 transition-colors"
                    aria-label="Refresh balance"
                  >
                    {refreshing === wallet.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Wallet Button */}
          <button
            onClick={() => {
              // Open wallet selection modal
              document.getElementById('wallet-connect-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full py-3 border border-dashed border-primary/50 rounded-lg flex items-center justify-center text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Another Wallet
          </button>
        </div>
      </div>
    </div>
  );
}