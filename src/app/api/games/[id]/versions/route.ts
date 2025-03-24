import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, authorizeOrganization } from "../../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  notFoundResponse 
} from "../../../utils/response";
import { getPaginationParams, getSortParams } from "../../../utils/query";
import { validateBody, validateParams } from "../../../utils/validation";
import { gameIdSchema, createGameVersionSchema } from "../../schema";

/**
 * GET /api/games/[id]/versions
 * 
 * Retrieves a paginated list of versions for a specific game
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Paginated list of game versions
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, gameIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: params.id }
    });

    if (!game) {
      return notFoundResponse("Game");
    }

    // Get pagination and sorting parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(req, "createdAt", "desc", ["version", "createdAt"]);

    // Get active filter if provided
    const url = new URL(req.url);
    const activeFilter = url.searchParams.get("isActive");
    
    const where: any = { gameId: params.id };
    if (activeFilter !== null) {
      where.isActive = activeFilter === "true";
    }

    // Fetch versions with pagination
    const [versions, total] = await Promise.all([
      prisma.gameVersion.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          contentFiles: {
            select: {
              id: true,
              filename: true,
              mimeType: true,
              size: true,
              path: true,
              contentHash: true,
              contentCid: true,
              isPublic: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              contentFiles: true
            }
          }
        }
      }),
      prisma.gameVersion.count({ where })
    ]);

    return paginatedResponse(versions, page, limit, total);
  } catch (error) {
    console.error("Error fetching game versions:", error);
    return errorResponse("Failed to fetch game versions", 500);
  }
}

/**
 * POST /api/games/[id]/versions
 * 
 * Creates a new version for a game
 * 
 * @requires Authentication and publisher organization membership
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The created game version
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, gameIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, createGameVersionSchema);
    if (validatedData instanceof Response) return validatedData;

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: params.id },
      include: {
        publisher: true
      }
    });

    if (!game) {
      return notFoundResponse("Game");
    }

    // Check if user has permission to add versions to this game
    // If publisher is linked to an organization, check if user is a member with appropriate permissions
    if (game.publisher.organizationId) {
      const orgSession = await authorizeOrganization(
        req, 
        game.publisher.organizationId, 
        ["owner", "admin", "publisher"]
      );
      if (orgSession instanceof Response) return orgSession;
    } else {
      // If publisher is not linked to an organization, only admins can add versions
      if (session.user.role !== "admin") {
        return errorResponse("You don't have permission to add versions to this game", 403);
      }
    }

    // Check if version already exists
    const existingVersion = await prisma.gameVersion.findFirst({
      where: {
        gameId: params.id,
        version: validatedData.version
      }
    });

    if (existingVersion) {
      return errorResponse("A version with this number already exists for this game", 409);
    }

    // Extract content file IDs
    const { contentFileIds, ...versionData } = validatedData;

    // Create version in a transaction
    const version = await prisma.$transaction(async (tx) => {
      // Create the version
      const newVersion = await tx.gameVersion.create({
        data: {
          id: crypto.randomUUID(),
          gameId: params.id,
          ...versionData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Associate content files if provided
      if (contentFileIds && contentFileIds.length > 0) {
        await Promise.all(
          contentFileIds.map(fileId =>
            tx.contentFile.update({
              where: { id: fileId },
              data: {
                gameVersionId: newVersion.id
              }
            })
          )
        );
      }

      return newVersion;
    });

    // Fetch the complete version with relationships
    const completeVersion = await prisma.gameVersion.findUnique({
      where: { id: version.id },
      include: {
        contentFiles: true
      }
    });

    return successResponse(completeVersion, "Game version created successfully", undefined, 201);
  } catch (error) {
    console.error("Error creating game version:", error);
    return errorResponse("Failed to create game version", 500);
  }
}