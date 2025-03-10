import { useState } from "react";
import axios from "axios";

const CreateCampaign = ({ onSuccess }) => {
  const [campaign, setCampaign] = useState({
    name: "",
    description: "",
    rewardType: "FIXED",
    rewardAmount: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    active: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (campaign.rewardAmount < 0) {
      alert("Reward amount cannot be negative");
      return;
    }

    if (campaign.rewardType === 'PERCENTAGE' && campaign.rewardAmount > 100) {
      alert("Percentage reward cannot exceed 100%");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/campaigns`, campaign, {
        withCredentials: true,
      });
      if (onSuccess) onSuccess();
      alert("Campaign created successfully!");
      setCampaign({
        name: "",
        description: "",
        rewardType: "FIXED",
        rewardAmount: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        active: true,
      });
    } catch (error) {
      alert(error.response?.data?.error || "Error creating campaign.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950 p-4">
      <div className="w-full max-w-3xl bg-gray-900 text-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center text-blue-400">Create New Campaign</h2>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium">Campaign Name</label>
            <input
              type="text"
              value={campaign.name}
              onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
              className="mt-1 w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={campaign.description}
              onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
              className="mt-1 w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
              placeholder="Briefly describe your campaign"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Reward Type</label>
              <select
                value={campaign.rewardType}
                onChange={(e) => setCampaign({ ...campaign, rewardType: e.target.value })}
                className="mt-1 w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
              >
                <option value="FIXED">Fixed Amount</option>
                <option value="PERCENTAGE">Percentage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Reward Amount</label>
              <input
                type="number"
                value={campaign.rewardAmount}
                onChange={(e) => setCampaign({ ...campaign, rewardAmount: Number(e.target.value) })}
                className="mt-1 w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={campaign.startDate}
                onChange={(e) => setCampaign({ ...campaign, startDate: e.target.value })}
                className="mt-1 w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                value={campaign.endDate}
                onChange={(e) => setCampaign({ ...campaign, endDate: e.target.value })}
                className="mt-1 w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={campaign.active}
              onChange={(e) => setCampaign({ ...campaign, active: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">Active Campaign</label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition p-2 rounded-md text-white"
          >
            Create Campaign
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
