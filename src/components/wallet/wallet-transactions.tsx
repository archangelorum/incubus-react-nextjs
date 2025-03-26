'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useWallet } from '@/components/wallet/wallet-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { useTranslations } from 'next-intl';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type Transaction = {
  id: string;
  hash: string;
  type: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REVERTED';
  amount: number;
  fee: number;
  blockNumber?: number;
  timestamp: string;
  data?: any;
};

export function WalletTransactions() {
  const t = useTranslations();
  const { user, isAuthenticated } = useAuth();
  const { activeWallet, isConnected } = useWallet();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!activeWallet) return;
      
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '10');
        
        if (filter) {
          params.append('type', filter);
        }
        
        const response = await fetch(`/api/wallets/${activeWallet.id}/transactions?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        
        const data = await response.json();
        setTransactions(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isConnected && activeWallet) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isConnected, activeWallet, page, filter]);

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'GAME_PURCHASE':
      case 'ITEM_PURCHASE':
      case 'ESCROW_DEPOSIT':
      case 'PLATFORM_FEE':
      case 'ROYALTY_PAYMENT':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'GAME_TRANSFER':
      case 'ITEM_TRANSFER':
      case 'ESCROW_RELEASE':
      case 'ESCROW_REFUND':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'GAME_PURCHASE':
        return 'Game Purchase';
      case 'GAME_TRANSFER':
        return 'Game Transfer';
      case 'ITEM_PURCHASE':
        return 'Item Purchase';
      case 'ITEM_TRANSFER':
        return 'Item Transfer';
      case 'ESCROW_DEPOSIT':
        return 'Escrow Deposit';
      case 'ESCROW_RELEASE':
        return 'Escrow Release';
      case 'ESCROW_REFUND':
        return 'Escrow Refund';
      case 'PLATFORM_FEE':
        return 'Platform Fee';
      case 'ROYALTY_PAYMENT':
        return 'Royalty Payment';
      default:
        return 'Other';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="flex items-center text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      case 'REVERTED':
        return (
          <span className="flex items-center text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Reverted
          </span>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          Please sign in to view your transactions.
        </p>
      </div>
    );
  }

  if (!isConnected || !activeWallet) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          Connect a wallet to view your transactions.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`px-2 py-1 text-xs rounded-md ${
              filter === null 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('GAME_PURCHASE')}
            className={`px-2 py-1 text-xs rounded-md ${
              filter === 'GAME_PURCHASE' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20'
            }`}
          >
            Game Purchases
          </button>
          <button
            onClick={() => setFilter('ITEM_PURCHASE')}
            className={`px-2 py-1 text-xs rounded-md ${
              filter === 'ITEM_PURCHASE' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20'
            }`}
          >
            Item Purchases
          </button>
          <button
            onClick={() => setFilter('GAME_TRANSFER')}
            className={`px-2 py-1 text-xs rounded-md ${
              filter === 'GAME_TRANSFER' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20'
            }`}
          >
            Transfers
          </button>
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        <>
          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="mr-2">
                          {getTransactionTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="font-medium">{getTransactionTypeLabel(transaction.type)}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {transaction.hash}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-medium ${
                        ['GAME_PURCHASE', 'ITEM_PURCHASE', 'ESCROW_DEPOSIT', 'PLATFORM_FEE', 'ROYALTY_PAYMENT'].includes(transaction.type)
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}>
                        {['GAME_PURCHASE', 'ITEM_PURCHASE', 'ESCROW_DEPOSIT', 'PLATFORM_FEE', 'ROYALTY_PAYMENT'].includes(transaction.type)
                          ? `-${transaction.amount.toFixed(4)}`
                          : `+${transaction.amount.toFixed(4)}`
                        } SOL
                      </div>
                      {transaction.fee > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Fee: {transaction.fee.toFixed(4)} SOL
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`https://explorer.solana.com/tx/${transaction.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline text-sm"
                      >
                        View
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}