import express from "express";
import { getAllUsers, getUserById, updateProfile } from "../controllers/user.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, getUserById);
router.put("/profile", protect, updateProfile);

export default router;
