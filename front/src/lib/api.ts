import axios, { AxiosError } from 'axios';
import {AuthFormData, AuthResponse} from './types';
import {getCookie} from "@/utils/getCookie";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (config.url?.includes('/api/auth/logout') || config.url?.includes('/api/auth/refresh')) {
        const accessToken = getCookie('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
    }
    // CSRF token in future
    // config.headers['X-CSRF-Token'] = getCookie('csrfToken') || '';
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 429) {
            throw new Error('Too many requests, please try again later');
        }
        if (error.response?.status === 401) {
            throw new Error('Invalid credentials');
        }
        return Promise.reject(error);
    }
);

export const registerUser = async (data: AuthFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
};

export const loginUser = async (data: AuthFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
};

export const refreshToken = async (refreshToken: string, userId: number): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/refresh', { refreshToken, userId });
    return response.data;
};

export const logoutUser = async () => {
    await api.post('/api/auth/logout');
};

export default api;