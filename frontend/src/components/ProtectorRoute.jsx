import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Ensure user exists before checking roles
  if (user) {
    if (allowedRole === "business" && !user.isBusiness) {
      return <Navigate to="/user-dashboard" replace />;
    }
    if (allowedRole === "user" && user.isBusiness) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
