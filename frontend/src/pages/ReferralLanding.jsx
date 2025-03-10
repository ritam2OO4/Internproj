import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ReferralLanding = () => {
  const { referralCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [successDetails, setSuccessDetails] = useState(null);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        console.log(referralCode)
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/referrals/details/${referralCode}`
        );
        console.log(response.data)
        setCampaignDetails(response.data);
      } catch (error) {
        setError('Invalid or expired referral link');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [referralCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/referrals/complete/${referralCode}`,
        { email, purchaseAmount: Number(purchaseAmount) }
      );
      setSuccess(true);
      setSuccessDetails(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error;
      if (errorMessage === 'Referral not found or already used') {
        setError('This referral link has already been used');
      } else if (errorMessage === 'This email has already been used for this campaign') {
        setError('You have already participated in this campaign');
      } else {
        setError(errorMessage || 'Failed to process referral');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            {successDetails?.calculationType === 'PERCENTAGE' ? (
              <>
                <p className="text-green-800 mb-2">
                  Purchase Amount: ${Number(successDetails?.purchaseAmount).toFixed(2)}
                </p>
                <p className="text-green-800 mb-2">
                  Reward Rate: {successDetails?.calculationDetails.percentage}%
                </p>
                <p className="text-green-800 font-bold">
                  Your Reward: ${Number(successDetails?.rewardAmount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  (${successDetails?.purchaseAmount} × {successDetails?.calculationDetails.percentage}%)
                </p>
              </>
            ) : (
              <p className="text-green-800">
                Your reward amount: ${Number(successDetails?.rewardAmount).toFixed(2)}
              </p>
            )}
          </div>
          <p className="text-gray-600">
            Your referral has been processed successfully. Thank you for your purchase!
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Share this referral link with others to help them get rewards too!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          {campaignDetails?.campaign.name}
        </h2>
        <p className="text-gray-600 mb-6">
          {campaignDetails?.campaign.description}
        </p>
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="text-blue-800">
            <p className="font-bold mb-2">Reward Details:</p>
            {campaignDetails?.campaign.rewardType === 'FIXED' ? (
              <p>${Number(campaignDetails?.campaign.rewardAmount).toFixed(2)} fixed reward</p>
            ) : (
              <>
                <p className="mb-2">
                  <span className="font-semibold">{campaignDetails?.campaign.rewardAmount}%</span> of your purchase amount
                </p>
                {campaignDetails?.campaign.minRewardAmount && (
                  <p className="text-sm">
                    Minimum reward: ${Number(campaignDetails?.campaign.minRewardAmount).toFixed(2)}
                  </p>
                )}
                {campaignDetails?.campaign.maxRewardAmount && (
                  <p className="text-sm">
                    Maximum reward: ${Number(campaignDetails?.campaign.maxRewardAmount).toFixed(2)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {campaignDetails?.campaign.rewardType === 'PERCENTAGE' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Example: For a purchase of $100, you would receive ${Number((100 * campaignDetails?.campaign.rewardAmount / 100)).toFixed(2)} in rewards
              <span className="block text-xs text-gray-500 mt-1">
                (Calculation: $100 × {campaignDetails?.campaign.rewardAmount}%)
              </span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Purchase Amount
            </label>
            <input
              type="number"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              min="0"
              step="0.01"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Processing...' : 'Complete Purchase'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReferralLanding; 