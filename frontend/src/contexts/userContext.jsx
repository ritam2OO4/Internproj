import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userDetails, setUserDetails] = useState(
        JSON.parse(localStorage.getItem("userDetails")) || null
    );
    const [loading, setLoading] = useState(true);

    // Fetch user details
    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/auth/check`, {
                withCredentials: true
            });

            if (response.data?.isAuthenticated) {
                setUserDetails(response.data.user);
                setIsAuthenticated(true);
                localStorage.setItem("userDetails", JSON.stringify(response.data.user));
            } else {
                console.warn("User not authenticated.");
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        } finally {
            setLoading(false);
        }
    };

    // Function to update user details dynamically
    const updateUserDetails = (data) => {
        setUserDetails((prevDetails) => {
            const updatedDetails = { ...prevDetails, ...data };
            localStorage.setItem("userDetails", JSON.stringify(updatedDetails));
            setIsAuthenticated(true);
            console.log(userDetails)
            return updatedDetails;
            
        });
    };

    // Clear user details (on logout)
    const clearUserDetails = () => {
        setUserDetails(null);
        setIsAuthenticated(false);
        // ❌ No longer removing from localStorage
    };

    useEffect(() => {
        fetchUserDetails();
        const interval = setInterval(fetchUserDetails, 5 * 60 * 1000); // Refresh user data every 5 minutes
        return () => clearInterval(interval);
    }, []);

    return (
        <UserContext.Provider value={{ userDetails, isAuthenticated, loading, updateUserDetails, clearUserDetails }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};
