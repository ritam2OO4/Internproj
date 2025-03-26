import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/ProtectorRoute";
import ReferralLanding from "./pages/ReferralLanding";
import UserDashboard from "./pages/UserDashboard";
import CampaignPage from "./pages/newUser"; // Import the new campaign page

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/refer/:referralCode" element={<ReferralLanding />} />
        
        {/* Campaign route (public, no authentication required) */}
        <Route path="/campaign/:campaignId" element={<CampaignPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRole={"business"}>
              <Dashboard />
            </PrivateRoute>
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
