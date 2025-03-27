import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/userContext"; // ✅ Correct Import

const PrivateRoute = ({ children, allowedRole }) => {
  const { userDetails, isAuthenticated, loading } = useUser(); // ✅ Use context
console.log(userDetails)
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
  if (userDetails) {
    if (allowedRole === "business" && !userDetails.isBusiness) {
      return <Navigate to="user-dashboard" replace />;
    }
    if (allowedRole === "user" && userDetails.isBusiness) {
      return <Navigate to="dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
