import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { RefreshCcw, Sparkles, Mail } from "lucide-react";
import emailjs from "@emailjs/browser";

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]); // Store users' email data
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { isAuthenticated } = useAuth();

    const [selectedEmail, setSelectedEmail] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCampaigns();
        }
    }, [isAuthenticated]);

    // Fetch campaigns
    const fetchCampaigns = async (campaignId = null) => {
        try {
            setError(null);
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/campaigns/data`,
                campaignId ? { campaignId } : {}, // Send campaignId only if available
                { withCredentials: true }
            );
            setCampaigns(response.data);
        } catch (error) {
            setError("Failed to fetch campaigns");
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user emails from the backend
    const fetchUsers = async (campaignId) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users`,
                { campaignId },
                { withCredentials: true }
            );
            setUsers(response.data.users); // Store users with name & email
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };


    // Generate AI Draft
    const generateDraftMessage = async (campaignId) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/ai/generate-draft`,
                { campaignId },
                { withCredentials: true }
            );
            setSelectedEmail(response.data);
            setShowModal(true);
            fetchUsers(campaignId); // Fetch user emails on mount

        } catch (error) {
            alert("Failed to generate draft message");
        }
    };

    // Send email to all users using EmailJS
    const sendEmailsToAllUsers = async () => {
        if (!selectedEmail) {
            alert("Please generate an email first.");
            return;
        }
        if (users.length === 0) {
            alert("No users found to send emails.");
            return;
        }

        const serviceId = import.meta.env.VITE_SERVICEID;
        const templateId = import.meta.env.VITE_TEMPLAT_EKEY;
        const publicKey = import.meta.env.VITE_PUBLIC_KEY;

        try {
            // Create an array of email sending promises
            const emailPromises = users.map((user) => {
                const emailParams = {
                    user_name: user.name,
                    user_email: user.email,
                    subject: selectedEmail.subject,
                    message: selectedEmail.body.replace("[Friend's Name]", user.name),
                };

                return emailjs.send(serviceId, templateId, emailParams, publicKey);
            });

            // Wait for all emails to be sent
            await Promise.all(emailPromises);

            alert("✅ Emails sent to all users successfully!");
        } catch (error) {
            console.error("❌ Failed to send some emails:", error);
            alert("❌ Some emails failed to send. Check the console for details.");
        }
    };


    if (loading) return <Skeleton className="h-16 w-full" />;
    if (error) return <p className="text-red-400">{error}</p>;
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
                                    <h3 className="text-lg font-medium text-white">{campaign.name}</h3>
                                    <p className="text-gray-400 mt-2">{campaign.description}</p>

                                    <div className="mt-6 pt-6 border-t border-gray-700 flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Generate AI-Powered Emails</span>
                                        <button
                                            onClick={() => generateDraftMessage(campaign._id)}
                                            className="text-blue-400 hover:text-blue-500"
                                        >
                                            <Sparkles className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            onClick={() => sendEmailsToAllUsers()}
                                            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center"
                                        >
                                            <Mail className="w-5 h-5 mr-2" /> Send Emails to All
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Email Preview */}
            {showModal && selectedEmail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-900 p-6 rounded-lg w-auto">
                        <h3 className="text-lg font-bold text-white">Email Preview</h3>
                        <p className="text-gray-300 mt-2"><strong>Subject:</strong> {selectedEmail.subject}</p>
                        <p className="text-gray-400 mt-4">{selectedEmail.body}</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <Button onClick={() => setShowModal(false)} className="bg-gray-700">Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignList;
