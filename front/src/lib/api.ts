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
import { getCookie } from 'cookies-next';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

let csrfToken: string | null = null;

api.interceptors.request.use(async (config) => {
    const protectedEndpoints = [
        '/api/v1/auth/logout',
        '/api/v1/auth/refresh',
        '/api/v1/stores',
        '/api/v1/stores/my',
        '/api/v1/stores/',
    ];
    if (protectedEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
        const accessToken = getCookie('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
    }

    if (['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase())  && !config.headers['X-CSRF-Token']) {
        if (!csrfToken) {
            const response = await api.get<{ csrfToken: string }>(
                '/api/v1/auth/csrf-token',
                { withCredentials: true }
            );
            csrfToken = response.data.csrfToken;
        }
        config.headers['X-CSRF-Token'] = csrfToken;
    }
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
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
    return response.data;
};
export const loginUser = async (data: AuthFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
    return response.data;
};

export const refreshToken = async (refreshToken: string, userId: number): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken, userId });
    return response.data;
};

export const logoutUser = async () => {
    await api.post('/api/v1/auth/logout');
    csrfToken = null;
};

export const createStore = async (data: CreateStoreData): Promise<Store> => {
    const response = await api.post<Store>('/api/v1/stores', data);
    return response.data;
};

export const getStores = async (filters: StoresFilter = {}): Promise<StoresResponse> => {
    const response = await api.get<StoresResponse>('/api/v1/stores', { params: filters });
    return response.data;
};

export const getUserStores = async (): Promise<Store[]> => {
    const response = await api.get<Store[]>('/api/v1/stores/my');
    return response.data;
};

export const getStoreById = async (id: number): Promise<Store> => {
    const response = await api.get<Store>(`/api/v1/stores/${id}`);
    return response.data;
};

export const updateStore = async (id: number, data: UpdateStoreData): Promise<Store> => {
    const response = await api.patch<Store>(`/api/v1/stores/${id}`, data);
    return response.data;
};

export const deleteStore = async (id: number): Promise<void> => {
    await api.delete(`/api/v1/stores/${id}`);
};

export default api;