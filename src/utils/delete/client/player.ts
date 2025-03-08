import api from "@/utils/axios";

interface DeletePlayerResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export const deletePlayer = async (userId: string): Promise<DeletePlayerResponse> => {
    try {
        const response = await api.delete<DeletePlayerResponse>('/api/player', {
            data: { userId }
        });
        if (!response.data) {
            throw new Error('No data received from API');
        }
        return response.data;
    } catch (error) {
        console.error("Error deleting player:", error);
        throw error;
    }
};