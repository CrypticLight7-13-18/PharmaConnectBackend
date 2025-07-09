import mongoose from "mongoose";

/**
 * MessageSchema fields:
 * - role: The sender's role ("System", "User", or "Assistant"). Required.
 * - message: The message content. Required.
 * - timestamp: The time the message was sent (default: now).
 * @typedef {Object} Message
 * @property {String} role - The role of the message sender ("System", "User", "Assistant").
 * @property {String} message - The content of the message.
 * @property {Date} timestamp - The time the message was sent.
 */
const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["System", "User", "Assistant"],
    required: true,
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

/**
 * Mongoose schema for Chat documents.
 * Represents a chat session with a title, the last message, and a history of messages.
 *
 * ChatSchema fields:
 * - title: The chat's title. Required.
 * - lastMessage: The most recent message object (role, message, timestamp).
 * - messageHistory: Array of message objects following MessageSchema.
 * @typedef {Object} Chat
 * @property {String} title - The title of the chat.
 * @property {Object} lastMessage - The most recent message (role, message, timestamp).
 * @property {Message[]} messageHistory - Array of message objects.
 */
const ChatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lastMessage: {
    role: String,
    message: String,
    timestamp: Date,
  },
  messageHistory: [MessageSchema],
});

export default mongoose.model("Chat", ChatSchema);
