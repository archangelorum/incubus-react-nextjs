import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/app/api/utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "@/app/api/utils/response";
import { validateBody } from "@/app/api/utils/validation";
import { purchaseMarketplaceListingSchema } from "../../../schema";

/**
 * POST /api/marketplace/listings/[id]/purchase
 * 
 * Purchases a marketplace listing
 * Handles both game license and game item purchases
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters containing the listing ID
 * @returns The purchase result
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, purchaseMarketplaceListingSchema);
    if (validatedData instanceof Response) return validatedData;

    const { walletId } = validatedData;

    // Find the listing
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true
          }
        },
        game: true,
        item: true
      }
    });

    if (!listing) {
      return notFoundResponse("Marketplace listing");
    }

    // Check if listing is active
    if (listing.status !== "ACTIVE") {
      return errorResponse("This listing is no longer available for purchase", 400);
    }

    // Check if listing has expired
    if (listing.expiresAt && new Date(listing.expiresAt) < new Date()) {
      return errorResponse("This listing has expired", 400);
    }

    // Check if user is trying to buy their own listing
    if (listing.sellerId === session.user.id) {
      return errorResponse("You cannot purchase your own listing", 400);
    }

    // Verify the wallet belongs to the user
    const wallet = await prisma.wallet.findUnique({
      where: {
        id: walletId,
        userId: session.user.id
      }
    });

    if (!wallet) {
      return errorResponse("Invalid wallet", 400);
    }

    // Check if wallet has sufficient balance
    if (wallet.balance.lessThan(listing.price)) {
      return errorResponse("Insufficient balance in wallet", 400);
    }

    // Process the purchase in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update listing status
      const updatedListing = await tx.marketplaceListing.update({
        where: { id },
        data: {
          status: "SOLD",
          updatedAt: new Date()
        }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          id: crypto.randomUUID(),
          hash: `tx-${crypto.randomUUID()}`, // In a real app, this would be the blockchain transaction hash
          blockchainId: wallet.blockchainId,
          walletId: wallet.id,
          type: listing.type === "GAME_LICENSE" ? "GAME_PURCHASE" : "ITEM_PURCHASE",
          status: "CONFIRMED",
          amount: listing.price,
          fee: listing.price.mul(0.05), // 5% platform fee
          data: {
            listingId: listing.id,
            sellerId: listing.sellerId,
            buyerId: session.user.id
          },
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Update buyer's wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance.sub(listing.price),
          updatedAt: new Date()
        }
      });

      // Update seller's wallet balance
      const sellerWallet = await tx.wallet.findFirst({
        where: {
          userId: listing.sellerId,
          blockchainId: wallet.blockchainId,
          isDefault: true
        }
      });

      if (sellerWallet) {
        await tx.wallet.update({
          where: { id: sellerWallet.id },
          data: {
            balance: sellerWallet.balance.add(listing.price.mul(0.95)), // 95% to seller after platform fee
            updatedAt: new Date()
          }
        });
      }

      // Handle game license transfer
      if (listing.type === "GAME_LICENSE" && listing.gameId) {
        // Check if buyer already has a license for this game
        const existingLicense = await tx.gameLicense.findUnique({
          where: {
            gameId_walletId: {
              gameId: listing.gameId,
              walletId: wallet.id
            }
          }
        });

        if (existingLicense) {
          throw new Error("You already own a license for this game");
        }

        // Create new license for buyer
        const newLicense = await tx.gameLicense.create({
          data: {
            id: crypto.randomUUID(),
            gameId: listing.gameId,
            walletId: wallet.id,
            licenseType: "STANDARD",
            isActive: true,
            acquiredAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        // Create license transaction record
        await tx.gameLicenseTransaction.create({
          data: {
            id: crypto.randomUUID(),
            licenseeId: newLicense.id,
            transactionId: transaction.id,
            type: "PURCHASE",
            price: listing.price,
            createdAt: new Date()
          }
        });
      }

      // Handle game item transfer
      if (listing.type === "GAME_ITEM" && listing.itemId) {
        // Check if buyer already owns this item
        const existingOwnership = await tx.itemOwnership.findUnique({
          where: {
            itemId_walletId: {
              itemId: listing.itemId,
              walletId: wallet.id
            }
          }
        });

        if (existingOwnership) {
          // Update existing ownership
          await tx.itemOwnership.update({
            where: {
              itemId_walletId: {
                itemId: listing.itemId,
                walletId: wallet.id
              }
            },
            data: {
              quantity: existingOwnership.quantity + listing.quantity
            }
          });
        } else {
          // Create new ownership
          const newOwnership = await tx.itemOwnership.create({
            data: {
              id: crypto.randomUUID(),
              itemId: listing.itemId,
              walletId: wallet.id,
              quantity: listing.quantity,
              acquiredAt: new Date()
            }
          });

          // Create item transaction record
          await tx.itemTransaction.create({
            data: {
              id: crypto.randomUUID(),
              itemId: listing.itemId,
              ownershipId: newOwnership.id,
              transactionId: transaction.id,
              type: "PURCHASE",
              quantity: listing.quantity,
              price: listing.price,
              createdAt: new Date()
            }
          });
        }
      }

      return {
        listing: updatedListing,
        transaction: transaction
      };
    });

    return successResponse(result, "Purchase successful", undefined, 201);
  } catch (error) {
    console.error("Error purchasing marketplace listing:", error);
    return errorResponse(error instanceof Error ? error.message : "Failed to purchase listing", 500);
  }
}