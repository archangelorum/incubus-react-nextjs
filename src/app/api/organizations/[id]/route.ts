import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdmin, authorizeOrganization } from "../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from "../../utils/response";
import { validateBody, validateParams } from "../../utils/validation";
import { updateOrganizationSchema, organizationIdSchema } from "../schema";

/**
 * GET /api/organizations/[id]
 * 
 * Retrieves a specific organization by ID
 * Users can access organizations they are members of, admins can access any organization
 * 
 * @requires Organization membership or Admin role
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The requested organization
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, organizationIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authorize access (user must be a member of the organization or an admin)
    const session = await authorizeOrganization(req, params.id);
    if (session instanceof Response) return session;

    // Fetch organization with members
    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        invitations: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            expiresAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!organization) {
      return notFoundResponse("Organization");
    }

    return successResponse(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return errorResponse("Failed to fetch organization", 500);
  }
}

/**
 * PUT /api/organizations/[id]
 * 
 * Updates a specific organization
 * Only organization owners and admins can update organizations
 * 
 * @requires Organization ownership or Admin role
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The updated organization
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, organizationIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Validate request body
    const validatedData = await validateBody(req, updateOrganizationSchema);
    if (validatedData instanceof Response) return validatedData;

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        members: {
          where: {
            userId: req.headers.get("X-User-ID") || "",
            role: "owner"
          }
        }
      }
    });

    if (!existingOrg) {
      return notFoundResponse("Organization");
    }

    // Authorize access (user must be an owner of the organization or an admin)
    const session = await authorizeOrganization(req, params.id, ["owner"]);
    if (session instanceof Response) {
      // Check if user is admin as a fallback
      const adminSession = await authorizeAdmin(req);
      if (adminSession instanceof Response) {
        return session; // Return the original error if not admin
      }
    }

    // If slug is being changed, check if it's already in use
    if (validatedData.slug && validatedData.slug !== existingOrg.slug) {
      const slugExists = await prisma.organization.findUnique({
        where: { slug: validatedData.slug }
      });

      if (slugExists) {
        return errorResponse("Slug is already in use", 409);
      }
    }

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id: params.id },
      data: validatedData
    });

    return successResponse(updatedOrg, "Organization updated successfully");
  } catch (error) {
    console.error("Error updating organization:", error);
    return errorResponse("Failed to update organization", 500);
  }
}

/**
 * DELETE /api/organizations/[id]
 * 
 * Deletes a specific organization
 * Only organization owners and admins can delete organizations
 * 
 * @requires Organization ownership or Admin role
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
    const validatedParams = validateParams(params, organizationIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id: params.id }
    });

    if (!existingOrg) {
      return notFoundResponse("Organization");
    }

    // Authorize access (user must be an owner of the organization or an admin)
    const session = await authorizeOrganization(req, params.id, ["owner"]);
    if (session instanceof Response) {
      // Check if user is admin as a fallback
      const adminSession = await authorizeAdmin(req);
      if (adminSession instanceof Response) {
        return session; // Return the original error if not admin
      }
    }

    // Delete organization (cascade will delete members and invitations)
    await prisma.organization.delete({
      where: { id: params.id }
    });

    return successResponse(null, "Organization deleted successfully");
  } catch (error) {
    console.error("Error deleting organization:", error);
    return errorResponse("Failed to delete organization", 500);
  }
}