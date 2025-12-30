import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: () => void;
    loginWithEmail: (data: any) => Promise<User>;
    register: (data: any) => Promise<User>;
    login: () => void;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const data = await authApi.getMe();
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const loginWithGoogle = () => {
        window.location.href = authApi.getGoogleLoginUrl();
    };

    const login = loginWithGoogle;

    const loginWithEmail = async (data: any) => {
        const response = await authApi.login(data);
        setUser(response.user);
        return response.user;
    };

    const register = async (data: any) => {
        const response = await authApi.register(data);
        setUser(response.user);
        return response.user;
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, loginWithEmail, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
