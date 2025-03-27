import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [loginType, setLoginType] = useState(null); // Track login type (user/business)

  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Redirect based on the last selected login type
      if (loginType === 'business') {
      console.log("dashboard")
      navigate('/dashboard');
    } else if (loginType === 'user') {
        console.log("user-dashboard")
        navigate('/user-dashboard');
      }
    }
  }, [isAuthenticated, loading, loginType, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Separate authentication URLs for Business and Users
  const handleGoogleLogin = (type) => {
    setLoginType(type); // Store selected login type before redirection
    console.log(type)
    const apiUrl =
      type === 'business'
        ? `${import.meta.env.VITE_API_URL}/api/auth/google`
        : `${import.meta.env.VITE_API_URL}/api/user/auth/google`;

    window.location.href = apiUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login
          </h2>
        </div>

        <Button
          variant="contained"
          fullWidth
          onClick={() => handleGoogleLogin('business')}
          className="bg-blue-600 hover:bg-blue-700 mb-3"
        >
          Login as Business
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={() => handleGoogleLogin('user')}
          className="bg-green-600 hover:bg-green-700 mt-3"
        >
          Login as User
        </Button>
      </div>
    </div>
  );
};

export default Login;
