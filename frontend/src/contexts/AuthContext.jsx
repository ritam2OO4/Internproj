import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            let response;

            // First, check business authentication
            response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            if (response.data.isAuthenticated) {
                setIsAuthenticated(true);
                setUser({ ...response.data.user, isBusiness: true });
                localStorage.setItem("user", JSON.stringify({ ...response.data.user, isBusiness: true }));
                return;
            }

            // If business auth fails, check user authentication
            response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/auth/check`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });

            if (response.data.isAuthenticated) {
                setIsAuthenticated(true);
                setUser({ ...response.data.user, isBusiness: false });
                localStorage.setItem("user", JSON.stringify({ ...response.data.user, isBusiness: false }));
                return;
            }

            throw new Error('Not authenticated');
        } catch (error) {
            console.error('Auth check error:', error.message);
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem("user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
        const interval = setInterval(checkAuth, 5 * 60 * 1000); // Check every 5 mins
        return () => clearInterval(interval);
    }, []);

    const logout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, { withCredentials: true });
            setUser(null);
            setIsAuthenticated(false);
            localStorage.clear();
            sessionStorage.clear();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
