/**
 * Express router for chat-related routes.
 * Maps HTTP endpoints to chat controller functions for creating chats, retrieving summaries and messages, and deleting chats.
 *
 * Routes:
 * - POST   /api/chats/                  : Create a new chat
 * - GET    /api/chats/chatSummaries     : Get summaries of all chats for the authenticated user
 * - GET    /api/chats/:chatId/messages  : Get all messages for a specific chat
 * - DELETE /api/chats/:chatId           : Delete a specific chat
 *
 * @module routes/chat
 */

import express from "express";
import * as chatController from "../controllers/chat.controller.js";

const router = express.Router();

/**
 * @route POST /api/chats/
 * @desc Creates a new chat.
 * @access Private
 */
router.post("/", chatController.createNewChat);

/**
 * @route GET /api/chats/chatSummaries
 * @desc Retrieves summaries of all chats for the authenticated user.
 * @access Private
 */
router.get("/chatSummaries", chatController.getChatSummaries);

/**
 * @route GET /api/chats/:chatId/messages
 * @desc Retrieves all messages for a specific chat.
 * @access Private
 */
router.get("/:chatId/messages", chatController.getChatMessages);

/**
 * @route DELETE /api/chats/:chatId
 * @desc Deletes a specific chat.
 * @access Private
 */
router.delete("/:chatId", chatController.deleteChat);

export default router;
