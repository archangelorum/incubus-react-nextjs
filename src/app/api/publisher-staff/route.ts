import { auth } from "@/auth";
import logger from "@/logger";
import { prisma } from "@/prisma";
import { PublisherStaffRole } from "@prisma/client";
import { NextResponse } from "next/server";

const validRoles: PublisherStaffRole[] = [
    PublisherStaffRole.Owner,
    PublisherStaffRole.Admin,
    PublisherStaffRole.Moderator
];

export const GET = auth(async function GET(request) {
    if (!(await request.auth)) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    const publisherStaff = await prisma.publisherStaff.findUnique({
        where: {
            userId: request.auth?.user.id
        },
    });

    if (
        !publisherStaff ||
        !validRoles.includes(publisherStaff.role)
    ) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const page = Number(request.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;

    try {
        const staff = await prisma.publisherStaff.findMany({
            select: {
                role: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalStaff = await prisma.publisherStaff.count();

        return NextResponse.json({ success: true, staff, totalStaff, page, limit });
    } catch (error) {
        logger.error(`Error fetching publisher staff: ${(error as Error).message}`);
        return NextResponse.json({ success: false, error: 'Error fetching publisher staff' }, { status: 500 });
    }
});

export const POST = auth(async function POST(request) {
    if (!(await request.auth)) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    const publisherStaff = await prisma.publisherStaff.findUnique({
        where: {
            userId: request.auth?.user.id
        },
    });

    if (
        !publisherStaff ||
        !validRoles.includes(publisherStaff.role)
    ) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    try {
        const { email, name, role } = await request.json();

        if (!email || !name || !role) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Create user first
        const user = await prisma.user.create({
            data: {
                email,
                name,
                emailVerified: new Date(),
            }
        });

        // Then create publisher staff
        const newStaff = await prisma.publisherStaff.create({
            data: {
                userId: user.id,
                role: role as PublisherStaffRole
            },
            select: {
                role: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            }
        });

        return NextResponse.json({ success: true, staff: newStaff });
    } catch (error) {
        logger.error(`Error creating publisher staff: ${(error as Error).message}`);
        return NextResponse.json({ success: false, error: 'Error creating publisher staff' }, { status: 500 });
    }
});

export const DELETE = auth(async function DELETE(request) {
    if (!(await request.auth)) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    const publisherStaff = await prisma.publisherStaff.findUnique({
        where: {
            userId: request.auth?.user.id
        },
    });

    if (
        !publisherStaff ||
        !validRoles.includes(publisherStaff.role)
    ) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        // Delete publisher staff first (due to foreign key constraint)
        await prisma.publisherStaff.delete({
            where: { userId }
        });

        // Then delete the user
        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error(`Error deleting publisher staff: ${(error as Error).message}`);
        return NextResponse.json({ success: false, error: 'Error deleting publisher staff' }, { status: 500 });
    }
}); 