'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { refreshToken, logoutUser } from '@/lib/api';
import { AuthResponse, UserPayload } from '@/lib/types';
import { getCookie } from 'cookies-next';

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    user: UserPayload | null;
    setAuth: (data: AuthResponse) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshTokenState, setRefreshToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserPayload | null>(null);

    useEffect(() => {
        const storedAccessToken = getCookie('accessToken');
        const storedRefreshToken = getCookie('refreshToken');
        const storedUser = localStorage.getItem('user');

        if (storedAccessToken && storedRefreshToken && storedUser) {
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const setAuth = (data: AuthResponse) => {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setUser(data.userPayload);
        document.cookie = `accessToken=${data.accessToken}; path=/; Secure; SameSite=Strict`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/; Secure; SameSite=Strict`;
        localStorage.setItem('user', JSON.stringify(data.userPayload));
    };

    const logout = async () => {
        try {
            await logoutUser();
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
            localStorage.removeItem('user');
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            if (refreshTokenState && user?.userId) {
                try {
                    const response = await refreshToken(refreshTokenState, user.userId);
                    setAuth(response);
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    logout();
                }
            }
        }, 15 * 60 * 1000);

        return () => clearInterval(interval);
    }, [refreshTokenState, user]);

    return (
        <AuthContext.Provider value={{ accessToken, refreshToken: refreshTokenState, user, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}