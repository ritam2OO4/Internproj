import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import CreateCampaign from '../components/CreateCampaign';
import CampaignList from '../components/CampaignList';
import LogoutButton from '../components/LogoutButton';

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleCampaignCreated = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name}
            </h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {showCreateForm ? 'Close Form' : 'Create Campaign'}
            </button>
          </div>

          {showCreateForm && <CreateCampaign onSuccess={handleCampaignCreated} />}

          <CampaignList key={refreshKey} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 