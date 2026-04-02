import express from "express";
import { getAllUsers, getUserDetail, verifyUser, toggleUserActive, getStats } from "../controllers/admin.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect, adminOnly); // all routes protected + admin only

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetail);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/toggle-active", toggleUserActive);

export default router;
