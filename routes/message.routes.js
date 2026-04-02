import express from "express";
import { sendMessage, getMessages, markAsRead, deleteMessage } from "../controllers/message.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", sendMessage);                              // public
router.get("/", protect, adminOnly, getMessages);           // admin
router.put("/:id/read", protect, adminOnly, markAsRead);    // admin
router.delete("/:id", protect, adminOnly, deleteMessage);   // admin

export default router;
