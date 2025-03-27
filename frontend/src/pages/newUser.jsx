import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Chatbot from "../components/chactBot";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CampaignDetails = () => {
    const { campaignId } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [taskCompleted, setTaskCompleted] = useState(false);
    const [step, setStep] = useState(1);
    const [aiResponse, setAiResponse] = useState("");
    const [userInput, setUserInput] = useState("");
    const [userId] = useState(() => crypto.randomUUID()); // Generate random user ID once

    useEffect(() => {
        const fetchCampaignDetails = async () => {
            try {
                const token = localStorage.getItem("user") || null;
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/newUser/${campaignId}`,
                    { campaignId, token },
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token._id}` : "",
                        },
                    }
                );
                setCampaign(response.data);
                if (response.data.taskCompleted) {
                    setTaskCompleted(true);
                }
            } catch (error) {
                console.error("Error fetching campaign:", error);
            }
        };

        if (campaignId) {
            fetchCampaignDetails();
        }
    }, [campaignId]);

    // Function to submit task after completion
    const submitTask = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/task/submit`, {
                campaignId,
                userId,
            });
            toast.success("Task submitted successfully! 🎉");
        } catch (error) {
            console.error("Task submission error:", error);
            toast.error("Failed to submit the task.");
        }
    };

    const completeTaskWithAI = async () => {
        if (taskCompleted || !userInput.trim()) return;

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/completeTaskWithAI`,
                { campaignId, userId, userMessage: userInput, step }
            );

            setAiResponse(response.data.response);
            setUserInput("");

            if (step < 6) {
                setStep(step + 1);
            } else {
                setTaskCompleted(true);
                toast.success("Task completed with AI! You will receive your reward soon.");
                await submitTask(); // Call submitTask when the task is fully completed
            }
        } catch (error) {
            console.error("AI task verification error:", error);
            toast.error("Error verifying task with AI.");
        }
    };

    useEffect(() => {
        if (!taskCompleted) {
            const interval = setInterval(() => {
                toast.info("Reminder: Complete your task to earn rewards!", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                });
            }, 120000); // Every 2 minutes

            return () => clearInterval(interval);
        }
    }, [taskCompleted]);

    if (!campaign) return <p>Loading campaign details...</p>;

    return (
        <>
            <ToastContainer />
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-6 flex-col">
                <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold text-blue-400 mb-4">{campaign.title}</h2>
                    <p className="text-gray-300 text-lg">{campaign.description}</p>
                </div>

                {!taskCompleted && (
                    <div className="mt-4 w-full max-w-md">
                        <input
                            type="text"
                            className="w-full p-2 text-white rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500"
                            placeholder="Type Start... To Complete Your Task and Redeem Code!!"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            disabled={taskCompleted} // Disable input if task is completed
                        />
                        <button
                            onClick={completeTaskWithAI}
                            className={`mt-2 w-full px-6 py-2 font-semibold rounded-lg ${
                                taskCompleted
                                    ? "bg-gray-500 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                            disabled={taskCompleted} // Disable button if task is completed
                        >
                            Click me to Start!!
                        </button>
                    </div>
                )}

                {taskCompleted && (
                    <button
                        className="mt-4 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg"
                        disabled
                    >
                        Task Completed 🎉
                    </button>
                )}

                {aiResponse && (
                    <div className="mt-4 p-4 bg-gray-700 text-white rounded-lg shadow-md">
                        <strong>AI:</strong> {aiResponse}
                    </div>
                )}

                <Chatbot />
            </div>
        </>
    );
};

export default CampaignDetails;