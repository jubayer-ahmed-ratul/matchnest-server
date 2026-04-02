import express from "express";
import { createCheckoutSession, confirmPayment, getPayments } from "../controllers/payment.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/checkout", protect, createCheckoutSession);
router.post("/confirm", protect, confirmPayment);
router.get("/list", protect, adminOnly, getPayments);

export default router;
