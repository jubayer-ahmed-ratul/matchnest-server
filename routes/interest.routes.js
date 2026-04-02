import express from "express";
import {
  sendInterest,
  respondToInterest,
  getReceivedInterests,
  getSentInterests,
  getMatches,
  cancelInterest,
} from "../controllers/interest.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send/:receiverId", protect, sendInterest);
router.put("/respond/:interestId", protect, respondToInterest);
router.get("/received", protect, getReceivedInterests);
router.get("/sent", protect, getSentInterests);
router.get("/matches", protect, getMatches);
router.delete("/cancel/:interestId", protect, cancelInterest);

export default router;
