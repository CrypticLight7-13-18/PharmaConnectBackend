import Chat from "../models/chat.model.js";
import Patient from "../models/patient.model.js";
import genAI from "../utils/ai-client.utils.js";
import asyncHandler from "../utils/async-handler.utils.js";
import AppError from "../utils/app-error.utils.js";

/**
 * Retrieves a summary list of all chats for the authenticated user.
 * Each summary includes chat ID, title, last message, and timestamp, sorted by most recent activity.
 * @param {Object} req - The request object containing user information.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const getChatSummaries = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const chatIds = user.chatIds || [];

  if (!chatIds.length) {
    return res.json({ success: true, data: [] });
  }

  const chats = await Chat.find(
    { _id: { $in: chatIds } },
    "title lastMessage messageHistory"
  ).sort({ "lastMessage.timestamp": -1 });

  const summaries = chats.map((chat) => ({
    id: chat._id,
    title: chat.title,
    lastMessage: chat.lastMessage || null,
    timestamp: chat.lastMessage?.timestamp || null,
  }));

  res.json({ success: true, data: summaries });
});

/**
 * Retrieves the complete message history for a specific chat if the user has access.
 * @param {Object} req - The request object containing user and chat ID.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If access is denied or chat is not found.
 */
export const getChatMessages = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const chatId = req.params.chatId;
  const chatIds = user.chatIds || [];

  if (!chatIds.map((id) => id.toString()).includes(chatId)) {
    return next(new AppError("Access denied to this chat.", 403));
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new AppError("Chat not found.", 404));
  }

  res.json({ success: true, data: chat.messageHistory });
});

/**
 * Formats a chat history array into a string suitable for Gemini AI input.
 * @param {Array<Object>} history - Array of message objects with `role` and `message` properties.
 * @returns {string} - Formatted chat history string.
 */
const formatChatHistoryForGemini = (history) => {
  return history.map((msg) => `${msg.role}: ${msg.message}`).join("\n");
};

/**
 * Generates an AI response to a given chat history using the Gemini model.
 * The AI acts as a medical assistant, responding only to healthcare-related queries.
 * @param {Array<Object>} chatHistory - Array of chat message objects.
 * @returns {Promise<string>} - The AI-generated response text.
 */
export const getAIResponse = async (chatHistory) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemInstruction = `You are a Medical Assistant. You only respond to medical queries 
    and provide assistance related to healthcare. Do not engage in any other topics. 
    Listen the user carefully and give a preliminary diagnosis. 
    If the user asks about something outside of healthcare, politely 
    redirect them back to medical topics. If the diagnosis is not clear, 
    ask for more information. 
    If the diagnosis is serious, suggest they see a doctor.
    Keep the response concise and focused on the medical issue.`;

  const contents = formatChatHistoryForGemini(chatHistory);
  const prompt = `${systemInstruction}\n\nConversation:\n${contents}\n\nResponse:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
};

/**
 * Retrieves the message history for a specific chat by its ID.
 * @param {string} chatId - The ID of the chat to retrieve.
 * @returns {Promise<Array<Object>>} - The message history array, or empty if not found.
 */
export const getChatHistory = async (chatId) => {
  const chat = await Chat.findById(chatId);
  return chat ? chat.messageHistory : [];
};

/**
 * Adds a new message to the specified chat's history and updates the last message.
 * @param {string} chatId - The ID of the chat to update.
 * @param {Object} messageObj - The message object containing `role` and `message`.
 * @returns {Promise<Object|null>} - The added message object, or null if chat not found.
 */
export const addMessageToChat = async (chatId, { role, message }) => {
  const msg = {
    role,
    message,
    timestamp: new Date(),
  };
  const chat = await Chat.findById(chatId);

  if (chat) {
    chat.messageHistory.push(msg);
    chat.lastMessage = msg;
    await chat.save();
    return msg;
  }

  return null;
};

/**
 * Creates a new chat with an initial system message and links it to the user.
 * @param {Object} req - The request object containing chat title, system message, and user info.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If required fields are missing.
 */
export const createNewChat = asyncHandler(async (req, res, next) => {
  const { title, systemMessage } = req.body;
  const user = req.user;

  if (!title || !systemMessage) {
    return next(new AppError("Title and systemMessage are required.", 400));
  }

  const initialMsg = {
    role: "System",
    message: systemMessage,
    timestamp: new Date(),
  };

  const chat = new Chat({
    title,
    lastMessage: initialMsg,
    messageHistory: [initialMsg],
  });

  await chat.save();
  await Patient.findByIdAndUpdate(user._id, {
    $push: { chatIds: chat._id },
  });

  res.status(201).json({ success: true, data: chat });
});

/**
 * Deletes a chat if the user has access and removes its reference from the user's chat list.
 * @param {Object} req - The request object containing user and chat ID.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {AppError} - If access is denied.
 */
export const deleteChat = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const chatId = req.params.chatId;
  const chatIds = user.chatIds || [];

  if (!chatIds.map((id) => id.toString()).includes(chatId)) {
    return next(new AppError("Access denied to this chat.", 403));
  }

  await Chat.findByIdAndDelete(chatId);
  await Patient.findByIdAndUpdate(user._id, { $pull: { chatIds: chatId } });

  res.json({ success: true, message: "Chat deleted successfully." });
});
