import { prisma } from "@/prisma";
import { PlayerWithUser } from "@/types/interfaces/player";

export const fetchPlayersServer = async (page: number, limit: number) => {
    const players: PlayerWithUser[] = await prisma.player.findMany({
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
        skip: (page - 1) * (limit),
        take: limit,
    });

    const totalPlayers = await prisma.player.count();

    return { players, totalPlayers};
}