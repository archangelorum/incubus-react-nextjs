import api from "@/utils/axios";
import { PlatformStaffRole } from "@/types/enums";
import { UserResponse } from "@/types/interfaces/player";

interface RegisterPlatformStaffResponse {
    success: boolean;
    data?: UserResponse['users'][0];
    error?: string;
}

export const registerPlatformStaff = async (role: PlatformStaffRole): Promise<RegisterPlatformStaffResponse> => {
    try {
        const response = await api.post<RegisterPlatformStaffResponse>('/api/platform-staff/register', { role });
        if (!response.data) {
            throw new Error('No data received from API');
        }
        return response.data;
    } catch (error) {
        console.error("Error registering platform staff:", error);
        throw error;
    }
}; 