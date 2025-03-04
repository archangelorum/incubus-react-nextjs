import { PlayerResponse } from "@/types/interfaces/player";

// utils/fetchPlayers.ts
export const fetchPlayersClient = async (
    page: number,
    limit: number
): Promise<PlayerResponse> => {
    const response = await fetch(`http://localhost:3000/api/players?page=${page}&limit=${limit}`);

    if (!response.ok) {
        throw new Error('Failed to fetch players ' + response.status);
    }

    return response.json();
};
