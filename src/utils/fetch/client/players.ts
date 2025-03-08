import { UserResponse } from "@/types/interfaces/player";
import api from "@/utils/axios";

interface PlayersResponse {
    players: UserResponse['users'];
    totalPlayers: number;
    page: number;
    limit: number;
}

// utils/fetchPlayers.ts
export const fetchPlayersClient = async (
    page: number,
    limit: number
): Promise<PlayersResponse> => {
    const response = await api.get<PlayersResponse>(`/api/players`, {
        params: { page, limit }
    });
    
    if (!response.data?.data) {
        throw new Error('No data received from API');
    }
    
    return response.data.data;
};
