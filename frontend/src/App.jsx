import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/ProtectorRoute';
import ReferralLanding from './pages/ReferralLanding';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/refer/:referralCode" element={<ReferralLanding />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRole={"business"}>
              <Dashboard />
            </PrivateRoute >
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute allowedRole={"user"}>
              <UserDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
