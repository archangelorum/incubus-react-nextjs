import api from "@/utils/axios";
import { PublisherStaffRole } from "@/types/enums";
import { UserResponse } from "@/types/interfaces/player";

interface RegisterPublisherStaffResponse {
    success: boolean;
    data?: UserResponse['users'][0];
    error?: string;
}

export const registerPublisherStaff = async (role: PublisherStaffRole): Promise<RegisterPublisherStaffResponse> => {
    try {
        const response = await api.post<RegisterPublisherStaffResponse>('/api/publisher-staff/register', { role });
        if (!response.data) {
            throw new Error('No data received from API');
        }
        return response.data;
    } catch (error) {
        console.error("Error registering publisher staff:", error);
        throw error;
    }
}; 