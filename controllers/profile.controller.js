import User from "../models/user.model.js";

// @desc    Update profile details
// @route   PUT /api/profile
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["age", "gender", "religion", "profession", "bio", "phone", "location", "profilePhoto", "verificationDocs", "education", "family", "partnerPreference"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Request verification (after uploading docs & photo)
// @route   POST /api/profile/request-verification
export const requestVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Save verification docs if provided
    if (req.body.verificationDocs) {
      user.verificationDocs = req.body.verificationDocs;
      await user.save();
    }

    if (!user.canRequestVerification()) {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile, upload a profile photo and NID/Passport before requesting verification.",
      });
    }

    if (user.profileStatus === "pending_verification") {
      return res.status(400).json({ success: false, message: "Verification already pending" });
    }

    if (user.profileStatus === "verified") {
      return res.status(400).json({ success: false, message: "Already verified" });
    }

    user.profileStatus = "pending_verification";
    await user.save();

    res.json({ success: true, message: "Verification request submitted. Admin will review shortly." });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: approve or reject verification
// @route   PUT /api/profile/verify/:userId
export const verifyUser = async (req, res, next) => {
  try {
    const { status, reason } = req.body; // status: "verified" | "rejected"

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be verified or rejected" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { profileStatus: status },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      message: `User ${status === "verified" ? "verified" : "rejected"}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};
