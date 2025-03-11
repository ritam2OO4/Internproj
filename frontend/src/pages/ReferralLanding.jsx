import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReferralLanding = () => {
  const { referralCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [successDetails, setSuccessDetails] = useState(null);
  const [user, setUser] = useState(null); // Track authenticated user

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/referrals/details/${referralCode}`
        );
        setCampaignDetails(response.data);
      } catch (error) {
        setError('Invalid or expired referral link');
      } finally {
        setLoading(false);
      }
    };

    // Fetch current user (authentication check)
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true });
        setUser(response.data); // Store authenticated user
      } catch {
        setUser(null);
      }
    };

    fetchCampaignDetails();
    fetchUser();
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
      setError(error.response?.data?.error || 'Failed to process referral');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReferral = () => {
    if (!user) {
      navigate('/'); // Redirect to login if not authenticated
    } else {
      navigate(`/generate-referral/${campaignDetails?.campaign.id}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-xl">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600 text-xl">{error}</div>;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
          <p className="text-gray-600">
            Your referral has been processed successfully. Thank you for your purchase!
          </p>

          <button
            onClick={handleGenerateReferral}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Generate Your Own Referral Link
          </button>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Amount</label>
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            {loading ? 'Processing...' : 'Complete Purchase'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReferralLanding;
