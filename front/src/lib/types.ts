export interface AuthFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface UserPayload {
    userId: number;
    email: string;
    role: string;
    isHaveStores: boolean;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userPayload: UserPayload
}