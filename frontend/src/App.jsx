import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/ProtectorRoute";
import PrivateRoute2 from "./components/PrivateRoute2";
import ReferralLanding from "./pages/ReferralLanding";
import UserDashboard from "./pages/UserDashboard";
import CampaignPage from "./pages/newUser";

function App() {
  return (
    <AuthProvider> {/* ✅ Ensure entire app is inside AuthProvider */}
      <UserProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/refer/:referralCode" element={<ReferralLanding />} />
          <Route path="/campaign/:campaignId" element={<CampaignPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRole="business">
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute2 allowedRole="user">
                <UserDashboard />
              </PrivateRoute2>
            }
          />
        </Routes>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
