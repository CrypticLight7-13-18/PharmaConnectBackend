import express from "express";
import * as chatController from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", chatController.createNewChat);

router.get('/chatSummaries', chatController.getChatSummaries);

router.get('/:chatId/messages', chatController.getChatMessages);

router.delete('/:chatId', chatController.deleteChat);

export default router;
