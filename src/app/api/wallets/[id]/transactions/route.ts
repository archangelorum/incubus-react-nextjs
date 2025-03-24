import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "../../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  notFoundResponse 
} from "../../../utils/response";
import { getPaginationParams, getSortParams } from "../../../utils/query";
import { validateParams } from "../../../utils/validation";
import { walletIdSchema } from "../../schema";
import { z } from "zod";

// Schema for transaction query parameters
const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["timestamp", "amount", "fee"]).default("timestamp"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  type: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional()
});

/**
 * GET /api/wallets/[id]/transactions
 * 
 * Retrieves a paginated list of transactions for a specific wallet
 * Supports filtering by type, status, date range, and amount range
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Paginated list of transactions
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

    // Validate query parameters
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    const validationResult = transactionQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return errorResponse(`Validation error: ${validationResult.error.message}`, 400);
    }
    
    const validatedQuery = validationResult.data;

    // Get pagination and sorting parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(
      req, 
      "timestamp", 
      "desc", 
      ["timestamp", "amount", "fee"]
    );
    
    // Build where clause
    const where: any = { walletId: params.id };
    
    if (validatedQuery.type) {
      where.type = validatedQuery.type;
    }
    
    if (validatedQuery.status) {
      where.status = validatedQuery.status;
    }
    
    // Date range filter
    if (validatedQuery.startDate || validatedQuery.endDate) {
      where.timestamp = {};
      
      if (validatedQuery.startDate) {
        where.timestamp.gte = new Date(validatedQuery.startDate);
      }
      
      if (validatedQuery.endDate) {
        where.timestamp.lte = new Date(validatedQuery.endDate);
      }
    }
    
    // Amount range filter
    if (validatedQuery.minAmount !== undefined || validatedQuery.maxAmount !== undefined) {
      where.amount = {};
      
      if (validatedQuery.minAmount !== undefined) {
        where.amount.gte = validatedQuery.minAmount;
      }
      
      if (validatedQuery.maxAmount !== undefined) {
        where.amount.lte = validatedQuery.maxAmount;
      }
    }

    // Fetch transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
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
              explorerUrl: true
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
                select: {
                  id: true,
                  gameId: true,
                  game: {
                    select: {
                      id: true,
                      title: true,
                      slug: true
                    }
                  }
                }
              }
            }
          },
          itemTransactions: {
            include: {
              item: {
                select: {
                  id: true,
                  name: true,
                  itemType: true,
                  rarity: true
                }
              }
            }
          },
          escrowTransactions: {
            include: {
              escrow: {
                select: {
                  id: true,
                  status: true,
                  amount: true
                }
              }
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    // Calculate total amounts
    const totalAmount = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalFees = transactions.reduce((sum, tx) => sum + Number(tx.fee), 0);

    return paginatedResponse(
      transactions, 
      page, 
      limit, 
      total, 
      undefined, 
      {
        totalAmount,
        totalFees,
        walletId: wallet.id,
        walletAddress: wallet.address,
        blockchainId: wallet.blockchainId
      }
    );
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    return errorResponse("Failed to fetch wallet transactions", 500);
  }
}