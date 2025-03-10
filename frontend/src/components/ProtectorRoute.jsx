import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!redirecting) {
      setRedirecting(true);
      setTimeout(() => {
        return <Navigate to="/" />;
      }, 100);
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Redirecting to login...</div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute; 