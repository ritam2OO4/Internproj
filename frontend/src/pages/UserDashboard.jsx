import { useUser } from "../contexts/userContext"; // Import the user context
import { useNavigate } from "react-router-dom"; // For navigation

const UserDashboard = () => {
    const { userDetails, clearUserDetails } = useUser();
    const navigate = useNavigate();
console.log(userDetails)
    // Handle logout
    const handleLogout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/user/auth/logout`, {
                method: "POST",
                credentials: "include", // Ensure cookies are cleared
            });

            clearUserDetails(); // Clear user data
            navigate("/"); // Redirect to home
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (!userDetails?._id) {
        return <p className="text-center text-white">Loading...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
            {/* User Info Section */}
            <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-blue-400 mb-4">
                    Welcome, {userDetails.name || "User"} 👋
                </h2>
                <p className="text-gray-300">Email: {userDetails.email || "N/A"}</p>
                <p className="text-gray-300">Rewards: {userDetails.rewardAmount || 0} points</p>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                >
                    Logout
                </button>
            </div>

            {/* Campaigns Section */}
            <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Your Campaigns</h3>
                {userDetails.campaigns && userDetails.campaigns.length > 0 ? (
                    <ul>
                        {userDetails.campaigns.map((campaign) => (
                            <li
                                key={campaign._id}
                                className="bg-gray-700 p-4 rounded-lg mb-3 shadow-md hover:bg-gray-600 transition"
                            >
                                <h4 className="text-xl font-semibold">{campaign.title}</h4>
                                <p className="text-gray-300">{campaign.description}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">You haven't joined any campaigns yet.</p>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
