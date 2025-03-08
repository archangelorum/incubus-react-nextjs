import { prisma } from "@/prisma";

export interface AdminStats {
    totalUsers: number;
    totalPlayers: number;
    totalGames: number;
    totalPublishers: number;
}

export const fetchAdminStats = async (): Promise<AdminStats> => {
    const [totalUsers, totalPlayers, totalGames, totalPublishers] = await Promise.all([
        prisma.user.count(),
        prisma.player.count(),
        prisma.game.count(),
        prisma.publisher.count()
    ]);

    return {
        totalUsers,
        totalPlayers,
        totalGames,
        totalPublishers
    };
}; 