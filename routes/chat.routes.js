import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  sendChatRequest,
  respondChatRequest,
  getMyChats,
  getPendingRequests,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/request", protect, sendChatRequest);
router.put("/:chatId/respond", protect, respondChatRequest);
router.get("/", protect, getMyChats);
router.get("/pending", protect, getPendingRequests);
router.get("/:chatId/messages", protect, getMessages);
router.post("/:chatId/messages", protect, sendMessage);

export default router;
