import api from "@/utils/axios";
import { UserResponse } from "@/types/interfaces/player";

interface RegisterPlayerResponse {
    success: boolean;
    data?: UserResponse['users'][0];
    error?: string;
}

export const registerPlayer = async (): Promise<RegisterPlayerResponse> => {
    try {
        const response = await api.post<RegisterPlayerResponse>('/api/player/register');
        if (!response.data) {
            throw new Error('No data received from API');
        }
        return response.data;
    } catch (error) {
        console.error("Error registering player:", error);
        throw error;
    }
}; 