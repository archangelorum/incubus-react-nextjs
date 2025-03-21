import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authenticateRequest } from "../../../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../../../utils/response";
import { validateParams } from "../../../../utils/validation";
import { walletIdSchema } from "../../../schema";
import { z } from "zod";

// Schema for transaction ID parameter
const transactionIdSchema = z.object({
  transactionId: z.string().uuid({ message: "Invalid transaction ID format" })
});

/**
 * GET /api/wallets/[id]/transactions/[transactionId]
 * 
 * Retrieves a specific transaction for a wallet
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The requested transaction
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; transactionId: string } }
) {
  try {
    // Validate ID parameters
    const validatedWalletParams = validateParams({ id: params.id }, walletIdSchema);
    if (validatedWalletParams instanceof Response) return validatedWalletParams;
    
    const validatedTxParams = validateParams(
      { transactionId: params.transactionId }, 
      transactionIdSchema
    );
    if (validatedTxParams instanceof Response) return validatedTxParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Fetch wallet
    const wallet = await prisma.wallet.findUnique({
      where: { id: params.id }
    });

    if (!wallet) {
      return notFoundResponse("Wallet");
    }

    // Check if user owns this wallet
    if (wallet.userId !== session.user.id) {
      return errorResponse("You don't have permission to access this wallet's transactions", 403);
    }

    // Fetch transaction with all related data
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.transactionId,
        walletId: params.id
      },
      include: {
        blockchain: {
          select: {
            id: true,
            name: true,
            chainId: true,
            rpcUrl: true,
            explorerUrl: true
          }
        },
        wallet: {
          select: {
            id: true,
            address: true,
            label: true
          }
        },
        smartContract: {
          select: {
            id: true,
            address: true,
            name: true,
            type: true
          }
        },
        gameLicenseTransactions: {
          include: {
            license: {
              include: {
                game: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    coverImage: true
                  }
                }
              }
            }
          }
        },
        itemTransactions: {
          include: {
            item: {
              include: {
                game: {
                  select: {
                    id: true,
                    title: true,
                    slug: true
                  }
                },
                image: true
              }
            },
            ownership: true
          }
        },
        escrowTransactions: {
          include: {
            escrow: {
              include: {
                depositorWallet: {
                  select: {
                    id: true,
                    address: true,
                    label: true
                  }
                },
                beneficiaryWallet: {
                  select: {
                    id: true,
                    address: true,
                    label: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      return notFoundResponse("Transaction");
    }

    // Prepare transaction details based on type
    let details = null;
    
    if (transaction.type === "GAME_PURCHASE" || transaction.type === "GAME_TRANSFER") {
      if (transaction.gameLicenseTransactions.length > 0) {
        const licenseTransaction = transaction.gameLicenseTransactions[0];
        details = {
          type: "game",
          licenseId: licenseTransaction.license.id,
          game: licenseTransaction.license.game,
          transactionType: licenseTransaction.type
        };
      }
    } else if (transaction.type === "ITEM_PURCHASE" || transaction.type === "ITEM_TRANSFER") {
      if (transaction.itemTransactions.length > 0) {
        const itemTransaction = transaction.itemTransactions[0];
        details = {
          type: "item",
          itemId: itemTransaction.item.id,
          item: itemTransaction.item,
          quantity: itemTransaction.quantity,
          transactionType: itemTransaction.type
        };
      }
    } else if (
      transaction.type === "ESCROW_DEPOSIT" || 
      transaction.type === "ESCROW_RELEASE" || 
      transaction.type === "ESCROW_REFUND"
    ) {
      if (transaction.escrowTransactions.length > 0) {
        const escrowTransaction = transaction.escrowTransactions[0];
        details = {
          type: "escrow",
          escrowId: escrowTransaction.escrow.id,
          escrow: escrowTransaction.escrow,
          transactionType: escrowTransaction.type
        };
      }
    }

    // Construct response with transaction and details
    const response = {
      ...transaction,
      details
    };

    return successResponse(response);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return errorResponse("Failed to fetch transaction", 500);
  }
}