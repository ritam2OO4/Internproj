import { useState, useEffect } from 'react';
import axios from 'axios';
import ReferralLink from './ReferralLink';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

import { RefreshCcw } from 'lucide-react';

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCampaigns();
        }
    }, [isAuthenticated]);

    const fetchCampaigns = async () => {
        try {
            setError(null);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/campaigns`, {
                withCredentials: true
            });
            if (!Array.isArray(response.data)) {
                throw new Error('Invalid response format');
            }
            console.log(response.data)
            setCampaigns(response.data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            setError(error.response?.data?.error || 'Failed to fetch campaigns');
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    const refreshCampaignStats = async (campaignId) => {
        try {
            setRefreshing(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/campaigns/stats/${campaignId}`,
                { withCredentials: true }
            );
            setCampaigns(prev => prev.map(camp =>
                camp._id === campaignId ? { ...camp, ...response.data } : camp
            ));
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to refresh campaign stats');
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) return <Skeleton className="h-16 w-full" />;
    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400">
            <Card className="bg-gray-800 p-6 text-center text-red-400">
                <p>{error}</p>
                <Button onClick={fetchCampaigns} className="mt-4 bg-red-500 hover:bg-red-600">Try Again</Button>
            </Card>
        </div>
    );
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white">Your Campaigns</h2>
                    <span className="text-gray-400">{campaigns.length} Campaigns</span>
                </div>
                {campaigns.length === 0 ? (
                    <div className="text-center py-16 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-lg">No campaigns found. Create your first campaign!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {campaigns.map((campaign) => (
                            <Card key={campaign._id} className="bg-gray-800 border border-gray-700 hover:border-blue-500">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-medium text-white">{campaign.name}</h3>
                                        <span className={`px-2 py-1 rounded text-sm ${campaign.active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{campaign.active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    <p className="text-gray-400 mt-2">{campaign.description}</p>
                                    <div className="mt-4 text-sm text-gray-400">
                                        Reward: {campaign.rewardType === 'FIXED' ? `$${campaign.rewardAmount}` : `${campaign.rewardAmount}%`}
                                    </div>
                                    <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="text-center p-3 bg-gray-700 rounded-lg">
                                            <div className="text-xl font-semibold text-blue-400">{campaign.referralCount}</div>
                                            <div className="text-xs text-gray-400">Total Links</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-700 rounded-lg">
                                            <div className="text-xl font-semibold text-blue-400">{campaign.successfulReferrals}</div>
                                            <div className="text-xs text-gray-400">Successful</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-700 rounded-lg">
                                            <div className="text-xl font-semibold text-blue-400">${Number(campaign.totalRewardsGiven || 0).toFixed(2)}</div>
                                            <div className="text-xs text-gray-400">Total Rewards</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-700 rounded-lg">
                                            <div className="text-xl font-semibold text-blue-400">${Number(campaign.totalPurchaseAmount || 0).toFixed(2)}</div>
                                            <div className="text-xs text-gray-400">Total Sales</div>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-700">
                                        {campaign._id && <ReferralLink campaignId={campaign._id} />}
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button onClick={() => refreshCampaignStats(campaign._id)} disabled={refreshing} className="bg-blue-500 hover:bg-blue-600 text-white flex items-center">
                                            <RefreshCcw className="w-5 h-5 mr-2" /> Refresh
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignList;