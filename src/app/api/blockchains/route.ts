import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authenticateRequest, authorizeAdmin } from "../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  notFoundResponse 
} from "../utils/response";
import { 
  getPaginationParams, 
  getSortParams, 
  getSearchParams 
} from "../utils/query";
import { validateBody, validateQuery } from "../utils/validation";
import { createBlockchainSchema, blockchainQuerySchema } from "./schema";

/**
 * GET /api/blockchains
 * 
 * Retrieves a paginated list of blockchains
 * Supports filtering, sorting, and searching
 * 
 * @param req - The incoming request
 * @returns Paginated list of blockchains
 */
export async function GET(req: NextRequest) {
  try {
    // Validate query parameters
    const queryResult = validateQuery(req, blockchainQuerySchema);
    if (queryResult instanceof Response) return queryResult;

    // Get pagination and sorting parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(
      req, 
      "name", 
      "asc", 
      ["name", "createdAt"]
    );
    
    // Get filters
    const url = new URL(req.url);
    const isActiveFilter = url.searchParams.get("isActive");
    const isDefaultFilter = url.searchParams.get("isDefault");
    
    // Build where clause
    let where: any = {};
    
    if (isActiveFilter !== null) {
      where.isActive = isActiveFilter === "true";
    }
    
    if (isDefaultFilter !== null) {
      where.isDefault = isDefaultFilter === "true";
    }
    
    // Add search filter if provided
    const searchParams = getSearchParams(req, ["name", "chainId"]);
    if (searchParams.OR) {
      where.OR = searchParams.OR;
    }

    // Fetch blockchains with pagination
    const [blockchains, total] = await Promise.all([
      prisma.blockchain.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          chainId: true,
          rpcUrl: true,
          explorerUrl: true,
          isActive: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              wallets: true,
              smartContracts: true,
              transactions: true,
              nftCollections: true
            }
          }
        }
      }),
      prisma.blockchain.count({ where })
    ]);

    return paginatedResponse(blockchains, page, limit, total);
  } catch (error) {
    console.error("Error fetching blockchains:", error);
    return errorResponse("Failed to fetch blockchains", 500);
  }
}

/**
 * POST /api/blockchains
 * 
 * Creates a new blockchain
 * 
 * @requires Admin role
 * 
 * @param req - The incoming request
 * @returns The created blockchain
 */
export async function POST(req: NextRequest) {
  try {
    // Authorize admin access
    const session = await authorizeAdmin(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, createBlockchainSchema);
    if (validatedData instanceof Response) return validatedData;

    // Check if blockchain with this chainId already exists
    const existingBlockchain = await prisma.blockchain.findFirst({
      where: { chainId: validatedData.chainId }
    });

    if (existingBlockchain) {
      return errorResponse("A blockchain with this chain ID already exists", 409);
    }

    // If this blockchain is set as default, unset other default blockchains
    if (validatedData.isDefault) {
      await prisma.blockchain.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    // Create blockchain
    const blockchain = await prisma.blockchain.create({
      data: {
        id: crypto.randomUUID(),
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return successResponse(blockchain, "Blockchain created successfully", undefined, 201);
  } catch (error) {
    console.error("Error creating blockchain:", error);
    return errorResponse("Failed to create blockchain", 500);
  }
}