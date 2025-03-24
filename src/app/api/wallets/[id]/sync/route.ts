import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "../../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../../utils/response";
import { validateBody, validateParams } from "../../../utils/validation";
import { walletIdSchema, syncWalletSchema } from "../../schema";

/**
 * POST /api/wallets/[id]/sync
 * 
 * Syncs a wallet's balance with the blockchain
 * Users can only sync their own wallets
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated wallet with synced balance
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, walletIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, syncWalletSchema);
    if (validatedData instanceof Response) return validatedData;

    // Fetch wallet with blockchain info
    const wallet = await prisma.wallet.findUnique({
      where: { id: params.id },
      include: {
        blockchain: true
      }
    });

    if (!wallet) {
      return notFoundResponse("Wallet");
    }

    // Check if user owns this wallet
    if (wallet.userId !== session.user.id) {
      return errorResponse("You don't have permission to sync this wallet", 403);
    }

    // Check if blockchain is active
    if (!wallet.blockchain.isActive) {
      return errorResponse("The blockchain for this wallet is not active", 400);
    }

    // Check if we need to force sync
    const forceSync = validatedData.forceSync;
    
    // Check if wallet was synced recently (within the last hour) and not forcing sync
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (wallet.lastSynced && wallet.lastSynced > oneHourAgo && !forceSync) {
      return successResponse(
        wallet,
        "Wallet was synced recently. Use forceSync=true to sync again.",
        {
          lastSynced: wallet.lastSynced,
          nextSyncAvailable: new Date(wallet.lastSynced.getTime() + 60 * 60 * 1000)
        }
      );
    }

    // In a real implementation, we would call the blockchain API to get the balance
    // For this example, we'll simulate a blockchain call with a random balance update
    
    // Simulate blockchain API call
    const simulateBlockchainApiCall = async (address: string, chainId: string) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a random balance (for demonstration purposes only)
      const currentBalance = Number(wallet.balance);
      const randomChange = Math.random() * 0.1 * currentBalance; // Up to 10% change
      const newBalance = Math.max(0, currentBalance + (Math.random() > 0.5 ? randomChange : -randomChange));
      
      return {
        balance: newBalance,
        timestamp: new Date()
      };
    };

    // Get balance from blockchain
    const blockchainData = await simulateBlockchainApiCall(
      wallet.address,
      wallet.blockchain.chainId
    );

    // Update wallet with new balance
    const updatedWallet = await prisma.wallet.update({
      where: { id: params.id },
      data: {
        balance: blockchainData.balance,
        lastSynced: blockchainData.timestamp,
        updatedAt: new Date()
      },
      include: {
        blockchain: {
          select: {
            id: true,
            name: true,
            chainId: true,
            explorerUrl: true
          }
        }
      }
    });

    return successResponse(
      updatedWallet,
      "Wallet balance synced successfully",
      {
        previousBalance: Number(wallet.balance),
        newBalance: Number(updatedWallet.balance),
        change: Number(updatedWallet.balance) - Number(wallet.balance)
      }
    );
  } catch (error) {
    console.error("Error syncing wallet balance:", error);
    return errorResponse("Failed to sync wallet balance", 500);
  }
}