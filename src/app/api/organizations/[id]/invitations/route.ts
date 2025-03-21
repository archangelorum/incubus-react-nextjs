import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { authorizeOrganization } from "../../../utils/auth";
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  notFoundResponse 
} from "../../../utils/response";
import { getPaginationParams, getSortParams } from "../../../utils/query";
import { validateBody, validateParams } from "../../../utils/validation";
import { organizationIdSchema, createInvitationSchema } from "../../schema";

/**
 * GET /api/organizations/[id]/invitations
 * 
 * Retrieves a paginated list of invitations for a specific organization
 * 
 * @requires Organization membership
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Paginated list of organization invitations
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, organizationIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Authorize access (user must be a member of the organization)
    const session = await authorizeOrganization(req, params.id);
    if (session instanceof Response) return session;

    // Get pagination and sorting parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(req, "expiresAt", "asc", ["expiresAt", "status"]);

    // Get status filter if provided
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");
    
    const where: any = { organizationId: params.id };
    if (statusFilter) {
      where.status = statusFilter;
    }

    // Fetch invitations with pagination
    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      }),
      prisma.invitation.count({ where })
    ]);

    return paginatedResponse(invitations, page, limit, total);
  } catch (error) {
    console.error("Error fetching organization invitations:", error);
    return errorResponse("Failed to fetch organization invitations", 500);
  }
}

/**
 * POST /api/organizations/[id]/invitations
 * 
 * Creates a new invitation for an organization
 * 
 * @requires Organization ownership or admin role
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The created invitation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const validatedParams = validateParams(params, organizationIdSchema);
    if (validatedParams instanceof Response) return validatedParams;

    // Validate request body
    const validatedData = await validateBody(req, createInvitationSchema);
    if (validatedData instanceof Response) return validatedData;

    // Authorize access (user must be an owner or admin of the organization)
    const session = await authorizeOrganization(req, params.id, ["owner", "admin"]);
    if (session instanceof Response) return session;

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: params.id }
    });

    if (!organization) {
      return notFoundResponse("Organization");
    }

    // Check if user with this email already exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    // If user exists, check if they're already a member
    if (user) {
      const existingMember = await prisma.member.findFirst({
        where: {
          organizationId: params.id,
          userId: user.id
        }
      });

      if (existingMember) {
        return errorResponse("User is already a member of this organization", 409);
      }
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        organizationId: params.id,
        email: validatedData.email,
        status: "PENDING"
      }
    });

    if (existingInvitation) {
      return errorResponse("An invitation has already been sent to this email", 409);
    }

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: params.id,
        email: validatedData.email,
        role: validatedData.role || "member",
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        inviterId: session.user.id
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // TODO: Send invitation email

    return successResponse(invitation, "Invitation sent successfully", undefined, 201);
  } catch (error) {
    console.error("Error creating organization invitation:", error);
    return errorResponse("Failed to create organization invitation", 500);
  }
}