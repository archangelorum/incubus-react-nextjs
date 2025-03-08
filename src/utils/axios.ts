import axios, { AxiosResponse, AxiosError, AxiosInstance } from 'axios';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: unknown;
    };
}

// Create axios instance with default config
const api: AxiosInstance = axios.create({
    // Set base URL to the current origin for client-side requests
    baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

export default api; 