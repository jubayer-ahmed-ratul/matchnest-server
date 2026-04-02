import express from "express";
import { updateProfile, requestVerification, verifyUser } from "../controllers/profile.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});
router.put("/", protect, updateProfile);
router.post("/request-verification", protect, requestVerification);
router.put("/verify/:userId", protect, adminOnly, verifyUser);

// Add/remove photos
router.post("/photos", protect, async (req, res, next) => {
  try {
    const { url } = req.body;
    const user = await User.findById(req.user._id);
    if (user.photos.length >= 5) {
      return res.status(400).json({ success: false, message: "Maximum 5 photos allowed" });
    }
    user.photos.push({ url });
    await user.save();
    res.json({ success: true, photos: user.photos });
  } catch (error) { next(error); }
});

router.delete("/photos/:index", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.photos.splice(Number(req.params.index), 1);
    await user.save();
    res.json({ success: true, photos: user.photos });
  } catch (error) { next(error); }
});

export default router;
