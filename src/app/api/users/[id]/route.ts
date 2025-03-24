import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin, authorizeUser } from "../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../utils/response";
import { validateBody, validateParams } from "../../utils/validation";
import { updateUserSchema, userIdSchema } from "../schema";

/**
 * GET /api/users/[id]
 * 
 * Retrieves a specific user by ID
 * Users can access their own data, admins can access any user
 * 
 * @requires User or Admin role
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The requested user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, userIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authorize access (user can access their own data, admin can access any)
    const session = await authorizeUser(req, params.id);
    if (session instanceof Response) return session;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        // Include memberships for organizations
        members: {
          select: {
            id: true,
            organizationId: true,
            role: true,
            createdAt: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return notFoundResponse("User");
    }

    return successResponse(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return errorResponse("Failed to fetch user", 500);
  }
}

/**
 * PUT /api/users/[id]
 * 
 * Updates a specific user
 * Users can update their own data, admins can update any user
 * Only admins can update role, banned status, and ban details
 * 
 * @requires User or Admin role
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated user
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, userIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Validate request body
    const validatedData = await validateBody(req, updateUserSchema);
    if (validatedData instanceof Response) return validatedData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return notFoundResponse("User");
    }

    // Authorize access (user can update their own data, admin can update any)
    const session = await authorizeUser(req, params.id);
    if (session instanceof Response) return session;

    // If not admin, remove admin-only fields
    if (session.user.role !== 'admin') {
      delete validatedData.role;
      delete validatedData.banned;
      delete validatedData.banReason;
      delete validatedData.banExpires;
    }

    // If email is being changed, check if it's already in use
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (emailExists) {
        return errorResponse("Email is already in use", 409);
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true
      }
    });

    return successResponse(updatedUser, "User updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    return errorResponse("Failed to update user", 500);
  }
}

/**
 * DELETE /api/users/[id]
 * 
 * Deletes a specific user
 * Only admins can delete users
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
    const validatedParams = validateParams(params, userIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authorize admin access
    const session = await authorizeAdmin(req);
    if (session instanceof Response) return session;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return notFoundResponse("User");
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id }
    });

    return successResponse(null, "User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorResponse("Failed to delete user", 500);
  }
}