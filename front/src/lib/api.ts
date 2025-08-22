import axios, { AxiosError } from 'axios';
import {
    AuthFormData,
    AuthResponse,
    CreateStoreData,
    Store,
    StoresFilter,
    StoresResponse,
    UpdateStoreData
} from './types';
import {getCookie} from "@/utils/getCookie";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const protectedEndpoints = [
        '/api/auth/logout',
        '/api/auth/refresh',
        '/api/stores',
        '/api/stores/my',
        '/api/stores/',
    ];
    if (protectedEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
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

export const createStore = async (data: CreateStoreData): Promise<Store> => {
    const response = await api.post<Store>('/api/stores', data);
    return response.data;
};

export const getStores = async (filters: StoresFilter = {}): Promise<StoresResponse> => {
    const response = await api.get<StoresResponse>('/api/stores', { params: filters });
    return response.data;
};

export const getUserStores = async (): Promise<Store[]> => {
    const response = await api.get<Store[]>('/api/stores/my');
    return response.data;
};

export const getStoreById = async (id: number): Promise<Store> => {
    const response = await api.get<Store>(`/api/stores/${id}`);
    return response.data;
};

export const updateStore = async (id: number, data: UpdateStoreData): Promise<Store> => {
    const response = await api.patch<Store>(`/api/stores/${id}`, data);
    return response.data;
};

export const deleteStore = async (id: number): Promise<void> => {
    await api.delete(`/api/stores/${id}`);
};

export default api;