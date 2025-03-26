'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'trustwallet' | 'other';

type WalletInfo = {
  id: string;
  address: string;
  label?: string;
  type: WalletType;
  balance: number;
  isDefault: boolean;
  blockchainId: string;
};

type WalletContextType = {
  wallets: WalletInfo[];
  activeWallet: WalletInfo | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connectWallet: (type: WalletType) => Promise<void>;
  disconnectWallet: (walletId: string) => Promise<void>;
  setActiveWallet: (walletId: string) => void;
  refreshBalance: (walletId: string) => Promise<void>;
  sendTransaction: (to: string, amount: number) => Promise<string>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [activeWallet, setActiveWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user wallets when authenticated
  useEffect(() => {
    const fetchWallets = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await fetch(`/api/wallets?userId=${user.id}`);
          if (!response.ok) throw new Error('Failed to fetch wallets');
          
          const data = await response.json();
          setWallets(data.data || []);
          
          // Set active wallet to default or first wallet
          const defaultWallet = data.data.find((w: WalletInfo) => w.isDefault) || data.data[0] || null;
          setActiveWallet(defaultWallet);
        } catch (err) {
          console.error('Error fetching wallets:', err);
          setError('Failed to load wallets');
        }
      } else {
        // Reset state when not authenticated
        setWallets([]);
        setActiveWallet(null);
      }
    };

    fetchWallets();
  }, [isAuthenticated, user]);

  const connectWallet = async (type: WalletType) => {
    if (!isAuthenticated) {
      setError('You must be signed in to connect a wallet');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Check if wallet adapter is available
      const walletAdapter = await getWalletAdapter(type);
      if (!walletAdapter) {
        throw new Error(`${type} wallet not installed`);
      }

      // Connect to wallet
      await walletAdapter.connect();
      const publicKey = await walletAdapter.getPublicKey();
      
      // Register wallet with backend
      const response = await fetch('/api/wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: publicKey.toString(),
          type,
          blockchainId: 'polygon-mainnet', // Default to Polygon mainnet
          label: `My ${type} wallet`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register wallet');
      }

      const data = await response.json();
      
      // Add new wallet to state
      const newWallet = data.data;
      setWallets(prev => [...prev, newWallet]);
      
      // Set as active wallet
      setActiveWallet(newWallet);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async (walletId: string) => {
    try {
      const response = await fetch(`/api/wallets/${walletId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to disconnect wallet');
      }

      // Remove wallet from state
      setWallets(prev => prev.filter(w => w.id !== walletId));
      
      // If active wallet was disconnected, set a new active wallet
      if (activeWallet && activeWallet.id === walletId) {
        const newActiveWallet = wallets.find(w => w.id !== walletId) || null;
        setActiveWallet(newActiveWallet);
      }
    } catch (err: any) {
      console.error('Error disconnecting wallet:', err);
      setError(err.message || 'Failed to disconnect wallet');
    }
  };

  const changeActiveWallet = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
      setActiveWallet(wallet);
    } else {
      setError('Wallet not found');
    }
  };

  const refreshBalance = async (walletId: string) => {
    try {
      const response = await fetch(`/api/wallets/${walletId}/sync`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to refresh balance');
      }

      const data = await response.json();
      
      // Update wallet in state
      setWallets(prev => 
        prev.map(w => w.id === walletId ? { ...w, balance: data.data.balance } : w)
      );
      
      // Update active wallet if needed
      if (activeWallet && activeWallet.id === walletId) {
        setActiveWallet(prev => prev ? { ...prev, balance: data.data.balance } : null);
      }
    } catch (err: any) {
      console.error('Error refreshing balance:', err);
      setError(err.message || 'Failed to refresh balance');
    }
  };

  const sendTransaction = async (to: string, amount: number): Promise<string> => {
    if (!activeWallet) {
      throw new Error('No active wallet');
    }

    try {
      // Get wallet adapter
      const walletAdapter = await getWalletAdapter(activeWallet.type);
      if (!walletAdapter) {
        throw new Error(`${activeWallet.type} wallet not available`);
      }

      // Create and sign transaction
      // This is a simplified version - in a real app, you'd use the Polygon Web3.js library
      const transaction = await createTransaction(activeWallet.address, to, amount);
      const signature = await walletAdapter.signAndSendTransaction(transaction);
      
      // Register transaction with backend
      const response = await fetch(`/api/wallets/${activeWallet.id}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash: signature,
          type: 'TRANSFER',
          amount,
          to,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Transaction recorded but failed to register');
      }

      // Refresh balance
      await refreshBalance(activeWallet.id);
      
      return signature;
    } catch (err: any) {
      console.error('Error sending transaction:', err);
      setError(err.message || 'Failed to send transaction');
      throw err;
    }
  };

  // Helper function to get wallet adapter
  const getWalletAdapter = async (type: WalletType) => {
    // This is a placeholder - in a real app, you'd use the actual wallet adapters
    // For example, with Phantom: window.phantom?.solana
    return {
      connect: async () => console.log(`Connecting to ${type} wallet`),
      disconnect: async () => console.log(`Disconnecting from ${type} wallet`),
      getPublicKey: async () => ({ toString: () => '8xh3hFcGpDBRQaLbXQXCnmRWNNF1WMNuMNs7SvFTDMH5' }),
      signAndSendTransaction: async (tx: any) => 'simulated-transaction-signature',
    };
  };

  // Helper function to create a transaction
  const createTransaction = async (from: string, to: string, amount: number) => {
    // This is a placeholder - in a real app, you'd use the Polygon Web3.js library
    return {
      from,
      to,
      amount,
    };
  };

  return (
    <WalletContext.Provider
      value={{
        wallets,
        activeWallet,
        isConnecting,
        isConnected: !!activeWallet,
        error,
        connectWallet,
        disconnectWallet,
        setActiveWallet: changeActiveWallet,
        refreshBalance,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}