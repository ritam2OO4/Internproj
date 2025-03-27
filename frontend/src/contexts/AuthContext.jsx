import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Function to check authentication status
    const checkAuth = async () => {
        try {
            let userData = null;

            // Check business authentication first
            const businessAuth = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });

            if (businessAuth.data.isAuthenticated) {
                userData = { ...businessAuth.data.user, isBusiness: true };
            } else {
                // If business auth fails, check user authentication
                const userAuth = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/auth/check`, {
                    withCredentials: true,
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                });

                if (userAuth.data.isAuthenticated) {
                    userData = { ...userAuth.data.user, isBusiness: false };
                }
            }

            if (userData) {
                setIsAuthenticated(true);
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
            } else {
                throw new Error('Not authenticated');
            }
        } catch (error) {
            console.error('Auth check error:', error.message);
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem("user");
        } finally {
            setLoading(false);
        }
    };

    // Logout function
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

    useEffect(() => {
        checkAuth();
        const interval = setInterval(checkAuth, 5 * 60 * 1000); // Check auth every 5 minutes

        // Detect if the user manually clears localStorage and logout
        const storageListener = () => {
            if (!localStorage.getItem("user")) {
                logout();  // If the user key is removed, force logout
            }
        };
        window.addEventListener("storage", storageListener);

        return () => {
            clearInterval(interval);
            window.removeEventListener("storage", storageListener);
        };
    }, []);

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
