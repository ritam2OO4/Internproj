import { useState } from 'react';
import axios from 'axios';

const CreateCampaignWithAI = ({ onSuccess }) => {
  const [userCommand, setUserCommand] = useState('');
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    rewardAmount: '',
    landingPage: '',
  });
  const [loading, setLoading] = useState(false);

  const handleGenerateCampaign = async () => {
    if (!userCommand) return alert('Please enter a campaign idea.');
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/generate-campaign`,
        { userInput: userCommand },
        { withCredentials: true } // ✅ Ensures cookies are included
      );
      onSuccess();
      setCampaignData(response.data); // ✅ Update form with AI-generated campaign details
    } catch (error) {
      console.error('Error extracting campaign details:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!campaignData.name || !campaignData.description || !campaignData.rewardAmount) {
      alert('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/campaigns/create`, campaignData);
      onSuccess();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Campaign with help of AI</h2>

      <textarea
        placeholder="Describe your campaign (e.g., 'My campaign is Summer Sale, buy 1 get 2 free, win coupon upto 4000')"
        value={userCommand}
        onChange={(e) => setUserCommand(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <button
        onClick={handleGenerateCampaign}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition mb-4"
      >
        {loading ? 'Generating...' : 'Generate Campaign'}
      </button>

      {campaignData.name && (
        <>
          <input
            type="text"
            placeholder="Campaign Name"
            value={campaignData.name}
            readOnly
            className="w-full p-2 border rounded mb-2 bg-gray-100"
          />
          <textarea
            placeholder="Campaign Description"
            value={campaignData.description}
            readOnly
            className="w-full p-2 border rounded mb-2 bg-gray-100"
          />
          <input
            type="number"
            placeholder="Reward Amount"
            value={campaignData.rewardAmount}
            readOnly
            className="w-full p-2 border rounded mb-2 bg-gray-100"
          />
        </>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !campaignData.name}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
      >
        {loading ? 'Creating...' : 'Create Campaign'}
      </button>
    </div>
  );
};

export default CreateCampaignWithAI;
