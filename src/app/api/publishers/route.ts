import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError } from "../types";
import { PlatformStaffRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const publisherCreateSchema = z.object({
  name: z.string().min(2).max(100),
  contactInfo: z.string().optional()
});

const publisherUpdateSchema = publisherCreateSchema.partial();

/**
 * @route GET /api/publishers
 * @description Get all publishers with pagination
 * @access Public
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';

    const where = search ? {
      name: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {};

    const publishers = await prisma.publisher.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            games: true
          }
        }
      }
    });

    const total = await prisma.publisher.count({ where });

    return createSuccessResponse({
      data: publishers,
      pagination: { page, pageSize, total }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * @route POST /api/publishers
 * @description Create a new publisher
 * @access Private - Platform Admin only
 */
export const POST = auth(async function POST(request) {
  try {
    // Check role - only platform admins can create publishers
    const { userId } = await checkAuthRole(request, [
      PlatformStaffRole.Admin,
      PlatformStaffRole.Owner
    ]);

    // Validate request body
    const body = await request.json();
    const validation = publisherCreateSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    const publisherData = validation.data;
    
    // Check if publisher with same name already exists
    const existingPublisher = await prisma.publisher.findUnique({
      where: { name: publisherData.name }
    });

    if (existingPublisher) {
      return createErrorResponse("Publisher with this name already exists", 409);
    }

    // Create publisher
    const publisher = await prisma.publisher.create({
      data: publisherData
    });

    return createSuccessResponse(publisher);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Insufficient permissions') {
        return createErrorResponse('Insufficient permissions', 403);
      }
      if (error.message === 'Unauthorized access') {
        return createErrorResponse('Unauthorized access', 401);
      }
    }
    return handleApiError(error);
  }
});

// Helper function to check roles for auth-wrapped handlers
const checkAuthRole = async (request: any, allowedRoles: PlatformStaffRole[]) => {
  if (!request.auth?.user?.id) {
    throw new Error('Unauthorized access');
  }

  const platformStaff = await prisma.platformStaff.findUnique({
    where: { userId: request.auth.user.id }
  });

  if (!platformStaff) {
    throw new Error('Insufficient permissions');
  }

  const hasValidRole = allowedRoles.includes(platformStaff.role);
  if (!hasValidRole) {
    throw new Error('Insufficient permissions');
  }

  return { userId: request.auth.user.id, role: platformStaff.role };
};