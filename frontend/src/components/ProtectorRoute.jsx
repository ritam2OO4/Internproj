import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
// console.log(isAuthenticated,loading,user,allowedRole)
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

  // Validate if user is allowed to access this route
  if (allowedRole === 'business' && !user?.isBusiness) {
    return <Navigate to="/dashboard" replace />;
  }
  if (allowedRole === 'user' && user?.isBusiness) {
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
