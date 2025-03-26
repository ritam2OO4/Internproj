import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

const CampaignDetails = () => {
    const { campaignId } = useParams(); // Captures '67e2991e36d0b0ed46fe0df3'
    const [campaign, setCampaign] = useState(null);

    useEffect(() => {
        const fetchCampaignDetails = async () => {
            try {
                const token = localStorage.getItem("user") || null; // Send null if no token
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/newUser/${campaignId}`, 
                    { campaignId ,token}, // Send campaignId in the body
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token._id}` : "", // Send token if available
                        },
                    }
                );
        
                setCampaign(response.data); // Set fetched campaign data
            } catch (error) {
                console.error("Error fetching campaign:", error);
            }
        };
        

        if (campaignId) {
            fetchCampaignDetails();
        }
    }, [campaignId]);

    if (!campaign) return <p>Loading campaign details...</p>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-6">
        <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-4">{campaign.title}</h2>
            <p className="text-gray-300 text-lg">{campaign.description}</p>
        </div>
    </div>
    );
};

export default CampaignDetails;
