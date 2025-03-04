import { auth } from "@/auth";
import logger from "@/logger";
import { prisma } from "@/prisma";
import { PlatformStaffRole } from "@prisma/client";
import { NextResponse } from "next/server";

const validRoles: PlatformStaffRole[] = [
    PlatformStaffRole.Owner,
    PlatformStaffRole.Admin,
    PlatformStaffRole.Moderator
];

export const GET = auth(async function GET(request) {
    if (!(await request.auth)) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    const platformStaff = await prisma.platformStaff.findUnique({
        where: {
            userId: request.auth?.user.id
        },
    });

    if (
        !platformStaff ||
        !validRoles.includes(platformStaff.role)
    ) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const page = Number(request.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;

    try {
        const players = await prisma.player.findMany({
            select: {
                type: true,
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

        const totalPlayers = await prisma.player.count();

        return NextResponse.json({ success: true, players, totalPlayers, page, limit });
    } catch (error) {
        logger.error(`Error fetching players: ${(error as Error).message}`);
        return NextResponse.json({ success: false, error: 'Error fetching players' }, { status: 500 });
    }
});
