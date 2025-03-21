import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authenticateRequest } from "../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  notFoundResponse 
} from "../utils/response";
import { 
  getPaginationParams, 
  getSortParams, 
  getFilterParams 
} from "../utils/query";
import { validateBody, validateQuery } from "../utils/validation";
import { createWalletSchema, walletQuerySchema } from "./schema";

/**
 * GET /api/wallets
 * 
 * Retrieves a paginated list of wallets for the authenticated user
 * Supports filtering and sorting
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @returns Paginated list of wallets
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate query parameters
    const queryResult = validateQuery(req, walletQuerySchema);
    if (queryResult instanceof Response) return queryResult;

    // Get pagination and sorting parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(
      req, 
      "createdAt", 
      "desc", 
      ["createdAt", "updatedAt", "balance", "label"]
    );
    
    // Get filters
    const url = new URL(req.url);
    const blockchainId = url.searchParams.get("blockchainId");
    const isDefault = url.searchParams.get("isDefault");
    
    // Build where clause
    const where: any = {
      userId: session.user.id
    };
    
    if (blockchainId) {
      where.blockchainId = blockchainId;
    }
    
    if (isDefault !== null) {
      where.isDefault = isDefault === "true";
    }

    // Fetch wallets with pagination
    const [wallets, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          blockchain: {
            select: {
              id: true,
              name: true,
              chainId: true,
              rpcUrl: true,
              explorerUrl: true,
              isActive: true,
              isDefault: true
            }
          }
        }
      }),
      prisma.wallet.count({ where })
    ]);

    return paginatedResponse(wallets, page, limit, total);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return errorResponse("Failed to fetch wallets", 500);
  }
}

/**
 * POST /api/wallets
 * 
 * Creates a new wallet for the authenticated user
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @returns The created wallet
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, createWalletSchema);
    if (validatedData instanceof Response) return validatedData;

    // Check if blockchain exists
    const blockchain = await prisma.blockchain.findUnique({
      where: { id: validatedData.blockchainId }
    });

    if (!blockchain) {
      return notFoundResponse("Blockchain");
    }

    // Check if blockchain is active
    if (!blockchain.isActive) {
      return errorResponse("The selected blockchain is not active", 400);
    }

    // Check if wallet with this address already exists for this user and blockchain
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        userId: session.user.id,
        blockchainId: validatedData.blockchainId,
        address: validatedData.address
      }
    });

    if (existingWallet) {
      return errorResponse("A wallet with this address already exists for this blockchain", 409);
    }

    // If this wallet is set as default, unset other default wallets for this blockchain
    if (validatedData.isDefault) {
      await prisma.wallet.updateMany({
        where: {
          userId: session.user.id,
          blockchainId: validatedData.blockchainId,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        blockchainId: validatedData.blockchainId,
        address: validatedData.address,
        isDefault: validatedData.isDefault,
        label: validatedData.label,
        balance: 0,
        lastSynced: null,
        createdAt: new Date(),
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

    // TODO: Sync wallet balance in background

    return successResponse(wallet, "Wallet created successfully", undefined, 201);
  } catch (error) {
    console.error("Error creating wallet:", error);
    return errorResponse("Failed to create wallet", 500);
  }
}