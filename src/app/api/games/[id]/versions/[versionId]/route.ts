import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authenticateRequest, authorizeOrganization } from "../../../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../../../utils/response";
import { validateParams } from "../../../../utils/validation";
import { gameIdSchema } from "../../../schema";
import { z } from "zod";

// Schema for version ID parameter
const versionIdSchema = z.object({
  versionId: z.string().uuid({ message: "Invalid version ID format" })
});

// Schema for updating a game version
const updateGameVersionSchema = z.object({
  isActive: z.boolean().optional(),
  releaseNotes: z.string().optional().nullable()
});

/**
 * GET /api/games/[id]/versions/[versionId]
 * 
 * Retrieves a specific game version
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The requested game version
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    // Validate ID parameters
    const validatedGameParams = validateParams({ id: params.id }, gameIdSchema);
    if (validatedGameParams instanceof Response) return validatedGameParams;
    
    const validatedVersionParams = validateParams({ versionId: params.versionId }, versionIdSchema);
    if (validatedVersionParams instanceof Response) return validatedVersionParams;

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: params.id }
    });

    if (!game) {
      return notFoundResponse("Game");
    }

    // Fetch version with relationships
    const version = await prisma.gameVersion.findFirst({
      where: {
        id: params.versionId,
        gameId: params.id
      },
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
        }
      }
    });

    if (!version) {
      return notFoundResponse("Game version");
    }

    return successResponse(version);
  } catch (error) {
    console.error("Error fetching game version:", error);
    return errorResponse("Failed to fetch game version", 500);
  }
}

/**
 * PUT /api/games/[id]/versions/[versionId]
 * 
 * Updates a specific game version
 * Only allows updating isActive status and releaseNotes
 * 
 * @requires Authentication and publisher organization membership
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated game version
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    // Validate ID parameters
    const validatedGameParams = validateParams({ id: params.id }, gameIdSchema);
    if (validatedGameParams instanceof Response) return validatedGameParams;
    
    const validatedVersionParams = validateParams({ versionId: params.versionId }, versionIdSchema);
    if (validatedVersionParams instanceof Response) return validatedVersionParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return errorResponse("Invalid JSON in request body", 400);
    }

    const validationResult = updateGameVersionSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(`Validation error: ${validationResult.error.message}`, 400);
    }

    const validatedData = validationResult.data;

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

    // Check if version exists
    const version = await prisma.gameVersion.findFirst({
      where: {
        id: params.versionId,
        gameId: params.id
      }
    });

    if (!version) {
      return notFoundResponse("Game version");
    }

    // Check if user has permission to update versions for this game
    // If publisher is linked to an organization, check if user is a member with appropriate permissions
    if (game.publisher.organizationId) {
      const orgSession = await authorizeOrganization(
        req, 
        game.publisher.organizationId, 
        ["owner", "admin", "publisher"]
      );
      if (orgSession instanceof Response) return orgSession;
    } else {
      // If publisher is not linked to an organization, only admins can update versions
      if (session.user.role !== "admin") {
        return errorResponse("You don't have permission to update versions for this game", 403);
      }
    }

    // If setting this version as active, deactivate other versions
    if (validatedData.isActive) {
      await prisma.gameVersion.updateMany({
        where: {
          gameId: params.id,
          id: { not: params.versionId }
        },
        data: {
          isActive: false
        }
      });
    }

    // Update version
    const updatedVersion = await prisma.gameVersion.update({
      where: { id: params.versionId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        contentFiles: true
      }
    });

    return successResponse(updatedVersion, "Game version updated successfully");
  } catch (error) {
    console.error("Error updating game version:", error);
    return errorResponse("Failed to update game version", 500);
  }
}

/**
 * DELETE /api/games/[id]/versions/[versionId]
 * 
 * Deletes a specific game version
 * Cannot delete the only active version of a game
 * 
 * @requires Authentication and publisher organization membership
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Success message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    // Validate ID parameters
    const validatedGameParams = validateParams({ id: params.id }, gameIdSchema);
    if (validatedGameParams instanceof Response) return validatedGameParams;
    
    const validatedVersionParams = validateParams({ versionId: params.versionId }, versionIdSchema);
    if (validatedVersionParams instanceof Response) return validatedVersionParams;

    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

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

    // Check if version exists
    const version = await prisma.gameVersion.findFirst({
      where: {
        id: params.versionId,
        gameId: params.id
      }
    });

    if (!version) {
      return notFoundResponse("Game version");
    }

    // Check if user has permission to delete versions for this game
    // If publisher is linked to an organization, check if user is a member with appropriate permissions
    if (game.publisher.organizationId) {
      const orgSession = await authorizeOrganization(
        req, 
        game.publisher.organizationId, 
        ["owner", "admin"]
      );
      if (orgSession instanceof Response) return orgSession;
    } else {
      // If publisher is not linked to an organization, only admins can delete versions
      if (session.user.role !== "admin") {
        return errorResponse("You don't have permission to delete versions for this game", 403);
      }
    }

    // Check if this is the only active version
    if (version.isActive) {
      const activeVersionsCount = await prisma.gameVersion.count({
        where: {
          gameId: params.id,
          isActive: true
        }
      });

      if (activeVersionsCount <= 1) {
        return errorResponse(
          "Cannot delete the only active version of a game. Make another version active first.",
          400
        );
      }
    }

    // Delete version
    await prisma.gameVersion.delete({
      where: { id: params.versionId }
    });

    return successResponse(null, "Game version deleted successfully");
  } catch (error) {
    console.error("Error deleting game version:", error);
    return errorResponse("Failed to delete game version", 500);
  }
}