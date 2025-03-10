import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check`, {
                withCredentials: true,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response || !response.data) {
                throw new Error('Invalid response from server');
            }

            if (!response.data.isAuthenticated) {
                setUser(null);
                setIsAuthenticated(false);
                return;
            }

            setIsAuthenticated(response.data.isAuthenticated);
            setUser(response.data.user);
        } catch (error) {
            console.error('Auth check error:', error.message);
            setIsAuthenticated(false);
            setUser(null);
            if (error.response?.status === 401) {
                setUser(null);
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
        // Set up interval to periodically check auth status
        const interval = setInterval(checkAuth, 5 * 60 * 1000); // Check every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const logout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, {
                withCredentials: true
            });
            setUser(null);
            setIsAuthenticated(false);
            localStorage.clear();
            sessionStorage.clear();
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 