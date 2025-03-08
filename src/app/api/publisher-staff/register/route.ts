import { prisma } from "@/prisma";
import { PublisherStaffRole } from "@prisma/client";
import { createSuccessResponse, createErrorResponse } from "../../types";
import { auth } from "@/auth";

export const POST = auth(async function POST(request) {
    try {
        const user = request.auth?.user;
        
        if (!user) {
            return createErrorResponse('Unauthorized access', 401);
        }

        // Check if publisher staff already exists
        const existingStaff = await prisma.publisherStaff.findUnique({
            where: { userId: user.id },
        });

        if (existingStaff) {
            return createErrorResponse('Already registered as publisher staff', 400);
        }

        // Get the publisher ID from the request body
        const { role, publisherId } = await request.json();

        if (!publisherId) {
            return createErrorResponse('Publisher ID is required', 400);
        }

        // Create new publisher staff
        const staff = await prisma.publisherStaff.create({
            data: {
                userId: user.id,
                role: role as PublisherStaffRole,
                publisherId: publisherId,
            },
        });

        return createSuccessResponse(staff);
    } catch (error) {
        console.error('Error registering publisher staff:', error);
        return createErrorResponse('Error registering publisher staff', 500);
    }
}); 