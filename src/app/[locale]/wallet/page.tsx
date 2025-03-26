import { Suspense } from 'react';
import { WalletDashboard } from '@/components/wallet/wallet-dashboard';
import { WalletConnect } from '@/components/wallet/wallet-connect';
import { WalletTransactions } from '@/components/wallet/wallet-transactions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Wallet, ArrowUpDown, CreditCard, History } from 'lucide-react';

export const metadata = {
  title: 'Wallet | Incubus',
  description: 'Manage your Solana wallet, view transactions, and connect to the blockchain',
};

export default function WalletPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Wallet</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Dashboard */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">Wallet Dashboard</h2>
                </div>
              </div>
              
              <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                <WalletDashboard />
              </Suspense>
            </div>
            
            {/* Transactions */}
            <div className="bg-card rounded-lg shadow-md overflow-hidden mt-6">
              <div className="p-6 border-b border-border">
                <div className="flex items-center">
                  <History className="w-5 h-5 mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">Transaction History</h2>
                </div>
              </div>
              
              <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                <WalletTransactions />
              </Suspense>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connect Wallet */}
            <div className="bg-card rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">Connect Wallet</h2>
                </div>
              </div>
              
              <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
                <WalletConnect />
              </Suspense>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-card rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center">
                  <ArrowUpDown className="w-5 h-5 mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">Quick Actions</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <button className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center">
                  Send SOL
                </button>
                
                <button className="w-full py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors flex items-center justify-center">
                  Receive SOL
                </button>
                
                <button className="w-full py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center">
                  Buy SOL
                </button>
                
                <button className="w-full py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center">
                  Swap Tokens
                </button>
              </div>
            </div>
            
            {/* Resources */}
            <div className="bg-card rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Resources</h2>
              </div>
              
              <div className="p-6">
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://solana.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      Solana Blockchain Explorer
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://phantom.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      Phantom Wallet
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://solflare.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      Solflare Wallet
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="text-primary hover:underline flex items-center"
                    >
                      Wallet Security Guide
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="text-primary hover:underline flex items-center"
                    >
                      NFT Trading Guide
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}