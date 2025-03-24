import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateCampaign from '../components/CreateCampaign';
import CampaignList from '../components/CampaignList';
import LogoutButton from '../components/LogoutButton';

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name} 👋</h1>
        <LogoutButton />
      </div>

      <button
        onClick={() => setShowCreateForm(prev => !prev)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        {showCreateForm ? 'Close Form' : 'Create Campaign'}
      </button>

      {showCreateForm && <CreateCampaign onSuccess={() => { setShowCreateForm(false); setRefreshKey(prev => prev + 1); }} />}

      <CampaignList key={refreshKey} />
    </div>
  );
};

export default Dashboard;
