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
import { organizationIdSchema, addMemberSchema } from "../../schema";

/**
 * GET /api/organizations/[id]/members
 * 
 * Retrieves a paginated list of members for a specific organization
 * 
 * @requires Organization membership
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns Paginated list of organization members
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
    const { orderBy } = getSortParams(req, "createdAt", "asc", ["createdAt", "role"]);

    // Fetch members with pagination
    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: { organizationId: params.id },
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
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
      }),
      prisma.member.count({
        where: { organizationId: params.id }
      })
    ]);

    return paginatedResponse(members, page, limit, total);
  } catch (error) {
    console.error("Error fetching organization members:", error);
    return errorResponse("Failed to fetch organization members", 500);
  }
}

/**
 * POST /api/organizations/[id]/members
 * 
 * Adds a new member to an organization
 * 
 * @requires Organization ownership
 * 
 * @param req - The incoming request
 * @param params - Route parameters
 * @returns The created member
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
    const validatedData = await validateBody(req, addMemberSchema);
    if (validatedData instanceof Response) return validatedData;

    // Authorize access (user must be an owner of the organization)
    const session = await authorizeOrganization(req, params.id, ["owner"]);
    if (session instanceof Response) return session;

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: params.id }
    });

    if (!organization) {
      return notFoundResponse("Organization");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    });

    if (!user) {
      return notFoundResponse("User");
    }

    // Check if user is already a member
    const existingMember = await prisma.member.findFirst({
      where: {
        organizationId: params.id,
        userId: validatedData.userId
      }
    });

    if (existingMember) {
      return errorResponse("User is already a member of this organization", 409);
    }

    // Add member to organization
    const member = await prisma.member.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: params.id,
        userId: validatedData.userId,
        role: validatedData.role,
        createdAt: new Date()
      },
      select: {
        id: true,
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
    });

    return successResponse(member, "Member added successfully", undefined, 201);
  } catch (error) {
    console.error("Error adding organization member:", error);
    return errorResponse("Failed to add organization member", 500);
  }
}