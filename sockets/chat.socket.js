/**
 * Socket.io handler for chat functionality with AI assistant integration.
 * Handles client connections, joining chat rooms, receiving new messages, and sending AI responses.
 *
 * @param {import('socket.io').Server} io - The Socket.io server instance.
 */
import * as chatController from "../controllers/chat.controller.js";

/**
 * Handles socket connections for chat and messaging.
 * - Listens for client connections.
 * - Handles joining chat rooms and sending chat history.
 * - Handles new messages, emits them to the room, and triggers AI responses for user messages.
 * - Handles client disconnections.
 *
 * @param {import('socket.io').Server} io - The Socket.io server instance.
 */
export default function handleSocket(io) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    /**
     * Handles a new message event.
     * Adds the message to the chat, emits it to the room, and if from user, gets AI response.
     * @param {Object} data - The message data.
     * @param {string} data.chatId - The chat room ID.
     * @param {string} data.role - The role of the sender (e.g., 'User').
     * @param {string} data.message - The message content.
     */
    socket.on("newMessage", async (data) => {
      try {
        const { chatId, role, message } = data;
        if (!chatId || !role || !message) {
          socket.emit("error", { message: "Invalid message data" });
          return;
        }

        const msg = await chatController.addMessageToChat(chatId, {
          role,
          message,
        });

        if (msg) {
          io.to(chatId).emit("message", msg);

          if (role.toLowerCase() === "user") {
            try {
              const history = await chatController.getChatHistory(chatId);
              const aiResponse = await chatController.getAIResponse(history);
              const aiMsg = await chatController.addMessageToChat(chatId, {
                role: "Assistant",
                message: aiResponse,
              });

              if (aiMsg) io.to(chatId).emit("message", aiMsg);
            } catch (aiError) {
              console.error("Error getting AI response:", aiError);
              socket.emit("message", {
                role: "Assistant",
                message: "Sorry, I could not get a response from the AI.",
              });
            }
          }
        }
      } catch (err) {
        console.error("Error handling newMessage:", err);
        socket.emit("error", { message: "Failed to process new message" });
      }
    });

    /**
     * Handles a client joining a chat room.
     * Sends the chat history to the client.
     * @param {Object} data - The join data.
     * @param {string} data.chatId - The chat room ID.
     */
    socket.on("joinChat", async (data) => {
      try {
        const { chatId } = data;
        if (!chatId) {
          socket.emit("error", { message: "Chat ID is required to join" });
          return;
        }

        socket.join(chatId);

        const history = await chatController.getChatHistory(chatId);
        socket.emit("chatHistory", { messageHistory: history });
      } catch (err) {
        console.error("Error handling joinChat:", err);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
