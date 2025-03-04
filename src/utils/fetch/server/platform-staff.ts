import { prisma } from "@/prisma";
import { StaffWithUser } from "@/types/interfaces/player";

export const fetchPlatformStaffServer = async (page: number, limit: number) => {
    const staff: StaffWithUser[] = await prisma.platformStaff.findMany({
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

    const totalStaff = await prisma.platformStaff.count();

    return { staff, totalStaff };
}; 