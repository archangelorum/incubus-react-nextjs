import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authorizeAdmin } from "../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../utils/response";
import { validateBody, validateParams } from "../../utils/validation";
import { updateBlockchainSchema, blockchainIdSchema } from "../schema";

/**
 * GET /api/blockchains/[id]
 * 
 * Retrieves a specific blockchain by ID
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The requested blockchain
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, blockchainIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Fetch blockchain with related counts
    const blockchain = await prisma.blockchain.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            wallets: true,
            smartContracts: true,
            transactions: true,
            nftCollections: true,
            publisherWallets: true,
            blockchainIndices: true
          }
        }
      }
    });

    if (!blockchain) {
      return notFoundResponse("Blockchain");
    }

    return successResponse(blockchain);
  } catch (error) {
    console.error("Error fetching blockchain:", error);
    return errorResponse("Failed to fetch blockchain", 500);
  }
}

/**
 * PUT /api/blockchains/[id]
 * 
 * Updates a specific blockchain
 * 
 * @requires Admin role
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated blockchain
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, blockchainIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authorize admin access
    const session = await authorizeAdmin(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, updateBlockchainSchema);
    if (validatedData instanceof Response) return validatedData;

    // Check if blockchain exists
    const blockchain = await prisma.blockchain.findUnique({
      where: { id: params.id }
    });

    if (!blockchain) {
      return notFoundResponse("Blockchain");
    }

    // If setting as default, unset other default blockchains
    if (validatedData.isDefault) {
      await prisma.blockchain.updateMany({
        where: {
          id: { not: params.id },
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    // Update blockchain
    const updatedBlockchain = await prisma.blockchain.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    });

    return successResponse(updatedBlockchain, "Blockchain updated successfully");
  } catch (error) {
    console.error("Error updating blockchain:", error);
    return errorResponse("Failed to update blockchain", 500);
  }
}

/**
 * DELETE /api/blockchains/[id]
 * 
 * Deletes a specific blockchain
 * Cannot delete blockchains with associated data
 * 
 * @requires Admin role
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
    const validatedParams = validateParams(params, blockchainIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authorize admin access
    const session = await authorizeAdmin(req);
    if (session instanceof Response) return session;

    // Check if blockchain exists with counts of related data
    const blockchain = await prisma.blockchain.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            wallets: true,
            smartContracts: true,
            transactions: true,
            nftCollections: true,
            publisherWallets: true,
            blockchainIndices: true
          }
        }
      }
    });

    if (!blockchain) {
      return notFoundResponse("Blockchain");
    }

    // Check if blockchain has associated data
    const hasAssociatedData = 
      blockchain._count.wallets > 0 ||
      blockchain._count.smartContracts > 0 ||
      blockchain._count.transactions > 0 ||
      blockchain._count.nftCollections > 0 ||
      blockchain._count.publisherWallets > 0 ||
      blockchain._count.blockchainIndices > 0;

    if (hasAssociatedData) {
      return errorResponse(
        "Cannot delete blockchain with associated data. Deactivate it instead.",
        400
      );
    }

    // Delete blockchain
    await prisma.blockchain.delete({
      where: { id: params.id }
    });

    return successResponse(null, "Blockchain deleted successfully");
  } catch (error) {
    console.error("Error deleting blockchain:", error);
    return errorResponse("Failed to delete blockchain", 500);
  }
}