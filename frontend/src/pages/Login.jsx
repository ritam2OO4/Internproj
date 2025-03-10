import { Button } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const handleGoogleLogin = () => { window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google` };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Business Login
          </h2>
        </div>
        <Button
          variant="contained"
          fullWidth
          onClick={handleGoogleLogin}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
};

export default Login; 