import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { generateBio, getCompatibility } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/generate-bio", protect, generateBio);
router.post("/compatibility", protect, getCompatibility);

export default router;
