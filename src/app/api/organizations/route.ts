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
  getSearchParams 
} from "../utils/query";
import { validateBody, validateQuery } from "../utils/validation";
import { createOrganizationSchema, organizationQuerySchema } from "./schema";

/**
 * GET /api/organizations
 * 
 * Retrieves a paginated list of organizations
 * Users can see organizations they are members of
 * Admins can see all organizations
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @returns Paginated list of organizations
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate query parameters
    const queryResult = validateQuery(req, organizationQuerySchema);
    if (queryResult instanceof Response) return queryResult;

    // Get pagination and sorting parameters
    const { page, limit, skip } = getPaginationParams(req);
    const { orderBy } = getSortParams(
      req, 
      "createdAt", 
      "desc", 
      ["name", "createdAt"]
    );
    
    const searchParams = getSearchParams(req, ["name", "slug"]);
    
    // Build where clause based on user role
    let where = searchParams;
    
    // If not admin, only show organizations the user is a member of
    if (session.user.role !== 'admin') {
      where = {
        ...searchParams,
        members: {
          some: {
            userId: session.user.id
          }
        }
      };
    }

    // Fetch organizations with pagination
    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          createdAt: true,
          metadata: true,
          _count: {
            select: {
              members: true,
              invitations: true
            }
          }
        }
      }),
      prisma.organization.count({ where })
    ]);

    return paginatedResponse(organizations, page, limit, total);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return errorResponse("Failed to fetch organizations", 500);
  }
}

/**
 * POST /api/organizations
 * 
 * Creates a new organization
 * 
 * @requires Authentication
 * 
 * @param req - The incoming request
 * @returns The created organization
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const session = await authenticateRequest(req);
    if (session instanceof Response) return session;

    // Validate request body
    const validatedData = await validateBody(req, createOrganizationSchema);
    if (validatedData instanceof Response) return validatedData;

    // Generate slug if not provided
    if (!validatedData.slug) {
      validatedData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingOrg) {
      return errorResponse("An organization with this slug already exists", 409);
    }

    // Create new organization and add current user as owner
    const organization = await prisma.$transaction(async (tx) => {
      // Create the organization
      const org = await tx.organization.create({
        data: {
          id: crypto.randomUUID(),
          ...validatedData,
          createdAt: new Date()
        }
      });

      // Add current user as owner
      await tx.member.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: org.id,
          userId: session.user.id,
          role: "owner",
          createdAt: new Date()
        }
      });

      return org;
    });

    return successResponse(
      organization, 
      "Organization created successfully", 
      undefined, 
      201
    );
  } catch (error) {
    console.error("Error creating organization:", error);
    return errorResponse("Failed to create organization", 500);
  }
}