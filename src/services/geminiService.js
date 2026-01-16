import axios from "axios";
import { apis } from "../types";
import { getUserData } from "../userStore/userData";

export const generateChatResponse = async (history, currentMessage, systemInstruction, attachment) => {
    try {
        const token = getUserData()?.token;
        const payload = {
            content: currentMessage,
            history: history,
            systemInstruction: systemInstruction,
            attachment: attachment // Pass attachment to backend
        };

        console.log("📡 Sending to backend:", {
            url: apis.chatAgent,
            hasContent: !!currentMessage,
            attachmentCount: attachment?.length || 0
        });

        // Make token optional - allow unauthenticated access
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const result = await axios.post(apis.chatAgent, payload, {
            headers: headers,
            timeout: 120000 // 2 minutes for large file processing
        });

        console.log("📥 Backend response status:", result.status);
        return result.data.reply || "I'm sorry, I couldn't generate a response.";

    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        return "Sorry, I am having trouble connecting to the AI Mall network right now.";
    }
};
