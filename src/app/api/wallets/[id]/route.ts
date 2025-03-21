import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authenticateRequest } from "../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../utils/response";
import { validateBody, validateParams } from "../../utils/validation";
import { updateWalletSchema, walletIdSchema, syncWalletSchema } from "../schema";

/**
 * GET /api/wallets/[id]
 * 
 * Retrieves a specific wallet by ID
 * Users can only access their own wallets
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The requested wallet
 */
export async function GET(
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

    // Fetch wallet with blockchain info
    const wallet = await prisma.wallet.findUnique({
      where: { id: params.id },
      include: {
        blockchain: {
          select: {
            id: true,
            name: true,
            chainId: true,
            rpcUrl: true,
            explorerUrl: true,
            isActive: true
          }
        },
        _count: {
          select: {
            transactions: true,
            ownedLicenses: true,
            ownedItems: true
          }
        }
      }
    });

    if (!wallet) {
      return notFoundResponse("Wallet");
    }

    // Check if user owns this wallet
    if (wallet.userId !== session.user.id) {
      return errorResponse("You don't have permission to access this wallet", 403);
    }

    return successResponse(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return errorResponse("Failed to fetch wallet", 500);
  }
}

/**
 * PUT /api/wallets/[id]
 * 
 * Updates a specific wallet
 * Users can only update their own wallets
 * Only label and isDefault properties can be updated
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated wallet
 */
export async function PUT(
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
    const validatedData = await validateBody(req, updateWalletSchema);
    if (validatedData instanceof Response) return validatedData;

    // Fetch wallet
    const wallet = await prisma.wallet.findUnique({
      where: { id: params.id }
    });

    if (!wallet) {
      return notFoundResponse("Wallet");
    }

    // Check if user owns this wallet
    if (wallet.userId !== session.user.id) {
      return errorResponse("You don't have permission to update this wallet", 403);
    }

    // If setting as default, unset other default wallets for this blockchain
    if (validatedData.isDefault) {
      await prisma.wallet.updateMany({
        where: {
          userId: session.user.id,
          blockchainId: wallet.blockchainId,
          isDefault: true,
          id: { not: params.id }
        },
        data: {
          isDefault: false
        }
      });
    }

    // Update wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
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
        }
      }
    });

    return successResponse(updatedWallet, "Wallet updated successfully");
  } catch (error) {
    console.error("Error updating wallet:", error);
    return errorResponse("Failed to update wallet", 500);
  }
}

/**
 * DELETE /api/wallets/[id]
 * 
 * Deletes a specific wallet
 * Users can only delete their own wallets
 * Cannot delete wallets with active licenses, items, or transactions
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Success message
 */
export async function DELETE(
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

    // Fetch wallet with counts
    const wallet = await prisma.wallet.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            transactions: true,
            ownedLicenses: true,
            ownedItems: true,
            escrowsAsDepositor: true,
            escrowsAsBeneficiary: true
          }
        }
      }
    });

    if (!wallet) {
      return notFoundResponse("Wallet");
    }

    // Check if user owns this wallet
    if (wallet.userId !== session.user.id) {
      return errorResponse("You don't have permission to delete this wallet", 403);
    }

    // Check if wallet has associated data
    if (
      wallet._count.transactions > 0 ||
      wallet._count.ownedLicenses > 0 ||
      wallet._count.ownedItems > 0 ||
      wallet._count.escrowsAsDepositor > 0 ||
      wallet._count.escrowsAsBeneficiary > 0
    ) {
      return errorResponse(
        "Cannot delete wallet with associated transactions, licenses, items, or escrows",
        400
      );
    }

    // Delete wallet
    await prisma.wallet.delete({
      where: { id: params.id }
    });

    return successResponse(null, "Wallet deleted successfully");
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return errorResponse("Failed to delete wallet", 500);
  }
}