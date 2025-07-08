import * as chatController from "../controllers/chat.controller.js";
import asyncHandler from "../utils/async-handler.utils.js";

export default function handleSocket(io) {
    io.on("connection", (socket) => {
        console.log("Client connected");

        const newMessageHandler = asyncHandler(async({ chatId, role, message }) => {
            const msg = await chatController.addMessageToChat(chatId, { role, message });

            if (msg) {
                io.to(chatId).emit("message", msg);

                if (role.toLowerCase() === 'user') {
                    try {
                        const history = await chatController.getChatHistory(chatId);
                        const aiResponse = await chatController.getAIResponse(history);
                        const aiMsg = await chatController.addMessageToChat(chatId, { role: 'Assistant', message: aiResponse });
                        
                        if (aiMsg) io.to(chatId).emit("message", aiMsg);
                    } catch (err) {
                        console.error("Error getting AI response:", err);
                        socket.emit("message", { role: 'Assistant', message: 'Sorry, I could not get a response from the AI.' });
                    }
                }
            }
        });

        const joinChatHandler = asyncHandler(async({ chatId }) => {
            socket.join(chatId);

            const history = await chatController.getChatHistory(chatId);

            socket.emit("chatHistory", { messageHistory: history });
        });

        socket.on("joinChat", joinChatHandler);
        socket.on("newMessage", newMessageHandler);
        socket.on("disconnect", () => console.log("Client disconnected"));
    });
}
