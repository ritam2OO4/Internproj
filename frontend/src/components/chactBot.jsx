import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Loader } from "lucide-react"; // Icon library for better UI

const Chatbot = ({ userId, campaignId }) => {
    const [messages, setMessages] = useState([
        { text: "Hi! I’m here to help. What do you need?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const sendMessage = async () => {
        if (!input.trim()) return; // Prevent sending empty messages

        const userMessage = { text: input, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/bot/chat`,
                { userId, campaignId, message: input }
            );

            const botMessage = { text: data.response, sender: "bot" };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages((prev) => [
                ...prev,
                { text: "Oops! Something went wrong. Try again.", sender: "bot" }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="w-full max-w-md mx-auto bg-gray-900 text-white rounded-lg shadow-xl flex flex-col h-[80vh] mt-10">
            {/* Chat Header */}
            <div className="bg-gray-800 py-3 px-4 text-lg font-semibold flex items-center justify-between">
                <span>AI Assistant</span>
                <span className="text-green-400 text-sm">Online</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"} shadow-md`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin text-gray-400" />
                        <span className="text-gray-400 text-sm">Typing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-gray-800 flex items-center gap-2">
                <input
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg outline-none border border-gray-600 focus:border-blue-400"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button 
                    className={`p-2 bg-blue-600 rounded-full text-white ${!input.trim() && "opacity-50 cursor-not-allowed"}`} 
                    onClick={sendMessage}
                    disabled={!input.trim()}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
