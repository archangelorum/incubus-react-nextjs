import { prisma } from "@/prisma";
import { PlatformStaffRole } from "@prisma/client";
import { createSuccessResponse, createErrorResponse } from "../../types";
import { auth } from "@/auth";

export const POST = auth(async function POST(request) {
    try {
        const user = request.auth?.user;
        
        if (!user) {
            return createErrorResponse('Unauthorized access', 401);
        }

        // Check if platform staff already exists
        const existingStaff = await prisma.platformStaff.findUnique({
            where: { userId: user.id },
        });

        if (existingStaff) {
            return createErrorResponse('Already registered as platform staff', 400);
        }

        // Create new platform staff
        const staff = await prisma.platformStaff.create({
            data: {
                userId: user.id,
                role: PlatformStaffRole.Support, // Default role for new registrations
            },
        });

        return createSuccessResponse(staff);
    } catch (error) {
        console.error('Error registering platform staff:', error);
        return createErrorResponse('Error registering platform staff', 500);
    }
}); 