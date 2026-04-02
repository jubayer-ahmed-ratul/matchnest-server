import User from "../models/user.model.js";

// @desc    Get all users (admin)
// @route   GET /api/users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");
    res.json({ success: true, user: updated });
  } catch (error) {
    next(error);
  }
};
