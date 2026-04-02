import express from "express";
import { searchProfiles, getProfileById } from "../controllers/search.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";
import { getPlan } from "../utils/planPermissions.js";

const router = express.Router();

router.get("/", protect, searchProfiles);

// Who viewed my profile
router.get("/who-viewed", protect, async (req, res, next) => {
  try {
    const plan = getPlan(req.user);
    if (!plan.canViewWhoViewed) {
      return res.status(403).json({ success: false, message: "Upgrade to Premium to see who viewed your profile.", upgradeRequired: true });
    }
    const user = await User.findById(req.user._id).populate("viewedBy", "name profilePhoto age profession location");
    res.json({ success: true, viewers: user.viewedBy || [] });
  } catch (error) { next(error); }
});

router.get("/:id", protect, getProfileById);

export default router;
