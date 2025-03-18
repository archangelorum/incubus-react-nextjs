import { NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { createSuccessResponse, createErrorResponse, handleApiError } from "../../../types";
import { PlatformStaffRole, PublisherStaffRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const staffCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.nativeEnum(PublisherStaffRole)
});

const staffUpdateSchema = z.object({
  role: z.nativeEnum(PublisherStaffRole)
});

// Helper function to check roles for auth-wrapped handlers
const checkAuthRole = async (request: any, publisherId: number) => {
  if (!request.auth?.user?.id) {
    throw new Error('Unauthorized access');
  }

  const userId = request.auth.user.id;

  // Check if user is platform admin
  const platformStaff = await prisma.platformStaff.findUnique({
    where: { userId }
  });

  const isPlatformAdmin = platformStaff && (
    platformStaff.role === PlatformStaffRole.Admin || 
    platformStaff.role === PlatformStaffRole.Owner
  );

  // Check if user is publisher staff with Publisher role
  const publisherStaff = await prisma.publisherStaff.findFirst({
    where: { 
      userId,
      publisherId,
      role: PublisherStaffRole.Publisher
    }
  });

  if (!isPlatformAdmin && !publisherStaff) {
    throw new Error('Insufficient permissions');
  }

  return { userId, isPlatformAdmin };
};

/**
 * @route GET /api/publishers/:publisherId/staff
 * @description Get all staff members for a publisher
 * @access Private - Platform Admin or Publisher Staff
 */
export const GET = auth(async function GET(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const publisherIdStr = params[params.length - 2]; // Get publisherId from URL
    const publisherId = parseInt(publisherIdStr);
    
    if (isNaN(publisherId)) {
      return createErrorResponse("Invalid publisher ID", 400);
    }

    // Check if publisher exists
    const publisher = await prisma.publisher.findUnique({
      where: { id: publisherId }
    });

    if (!publisher) {
      return createErrorResponse("Publisher not found", 404);
    }

    // Check permissions
    await checkAuthRole(request, publisherId);

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Get staff members
    const staff = await prisma.publisherStaff.findMany({
      where: { publisherId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalStaff = await prisma.publisherStaff.count({
      where: { publisherId }
    });

    return createSuccessResponse({
      staff,
      pagination: {
        page,
        limit,
        total: totalStaff
      }
    });
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

/**
 * @route POST /api/publishers/:publisherId/staff
 * @description Add a new staff member to a publisher
 * @access Private - Platform Admin or Publisher Staff with Publisher role
 */
export const POST = auth(async function POST(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const publisherIdStr = params[params.length - 2]; // Get publisherId from URL
    const publisherId = parseInt(publisherIdStr);
    
    if (isNaN(publisherId)) {
      return createErrorResponse("Invalid publisher ID", 400);
    }

    // Check if publisher exists
    const publisher = await prisma.publisher.findUnique({
      where: { id: publisherId }
    });

    if (!publisher) {
      return createErrorResponse("Publisher not found", 404);
    }

    // Check permissions
    await checkAuthRole(request, publisherId);

    // Validate request body
    const body = await request.json();
    const validation = staffCreateSchema.safeParse(body);
    
    if (!validation.success) {
      return createErrorResponse(validation.error.message, 400);
    }

    const { email, name, role } = validation.data;

    // Check if user with email exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Create user if not exists
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          emailVerified: new Date()
        }
      });
    }

    // Check if user is already a staff member for this publisher
    const existingStaff = await prisma.publisherStaff.findFirst({
      where: {
        userId: user.id,
        publisherId
      }
    });

    if (existingStaff) {
      return createErrorResponse("User is already a staff member for this publisher", 409);
    }

    // Create publisher staff
    const staff = await prisma.publisherStaff.create({
      data: {
        userId: user.id,
        publisherId,
        role
      },
      include: {
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

    return createSuccessResponse(staff);
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

/**
 * @route DELETE /api/publishers/:publisherId/staff
 * @description Remove a staff member from a publisher
 * @access Private - Platform Admin or Publisher Staff with Publisher role
 */
export const DELETE = auth(async function DELETE(request) {
  try {
    const params = request.nextUrl.pathname.split('/');
    const publisherIdStr = params[params.length - 2]; // Get publisherId from URL
    const publisherId = parseInt(publisherIdStr);
    
    if (isNaN(publisherId)) {
      return createErrorResponse("Invalid publisher ID", 400);
    }

    // Check if publisher exists
    const publisher = await prisma.publisher.findUnique({
      where: { id: publisherId }
    });

    if (!publisher) {
      return createErrorResponse("Publisher not found", 404);
    }

    // Check permissions
    const { userId, isPlatformAdmin } = await checkAuthRole(request, publisherId);

    // Get staff member ID from request body
    const { staffUserId } = await request.json();
    
    if (!staffUserId) {
      return createErrorResponse("Staff user ID is required", 400);
    }

    // Check if staff member exists
    const staff = await prisma.publisherStaff.findFirst({
      where: {
        userId: staffUserId,
        publisherId
      }
    });

    if (!staff) {
      return createErrorResponse("Staff member not found", 404);
    }

    // Prevent publisher from removing themselves
    if (staffUserId === userId && !isPlatformAdmin) {
      return createErrorResponse("You cannot remove yourself as a publisher", 403);
    }

    // Delete publisher staff
    await prisma.publisherStaff.deleteMany({
      where: {
        userId: staffUserId,
        publisherId
      }
    });

    return createSuccessResponse({ message: "Staff member removed successfully" });
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