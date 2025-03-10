import { useState } from "react";
import axios from "axios";

const ReferralLink = ({ campaignId }) => {
  const [email, setEmail] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const generateLink = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setCopySuccess(false);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/referrals/generate/${campaignId}`,
        { email },
        { withCredentials: true }
      );
      if (!response.data?.referralLink) {
        throw new Error('Invalid response from server');
      }
      setReferralLink(response.data.referralLink);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to generate referral link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy link");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-900 text-white rounded-lg shadow-lg w-full max-w-lg mx-auto">
      {!referralLink ? (
        <form onSubmit={generateLink} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Enter Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="example@email.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-800 transition-all"
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Generating...
              </>
            ) : (
              "Generate Referral Link"
            )}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      ) : (
        <div className="w-full space-y-4">
          <p className="text-lg font-semibold text-gray-300">Your Referral Link</p>
          <div className="relative flex items-center p-3 bg-gray-800 rounded-md">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-transparent border-none text-gray-300 truncate"
            />
            <button
              onClick={copyToClipboard}
              className="ml-2 p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
            {copySuccess && (
              <span className="absolute right-12 bg-green-600 text-xs px-2 py-1 rounded-md animate-fadeIn">
                Copied!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralLink;
