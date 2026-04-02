import express from "express";
import {
  getApprovedStories,
  submitStory,
  getAllStories,
  adminAddStory,
  updateStoryStatus,
  deleteStory,
} from "../controllers/story.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getApprovedStories);
router.post("/", protect, submitStory);
router.get("/admin", protect, adminOnly, getAllStories);
router.post("/admin", protect, adminOnly, adminAddStory);
router.put("/:id/status", protect, adminOnly, updateStoryStatus);
router.delete("/:id", protect, adminOnly, deleteStory);

export default router;
