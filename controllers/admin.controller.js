import User from "../models/user.model.js";
import Story from "../models/story.model.js";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Get all users with filters
// @route   GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { profileStatus, role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (profileStatus) filter.profileStatus = profileStatus;
    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select("-password").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user detail
// @route   GET /api/admin/users/:id
export const getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject a user
// @route   PUT /api/admin/users/:id/verify
export const verifyUser = async (req, res, next) => {
  try {
    const { status } = req.body; // "verified" | "rejected"
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be verified or rejected" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { profileStatus: status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: `User ${status}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/inactive
// @route   PUT /api/admin/users/:id/toggle-active
export const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}`, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
export const getStats = async (req, res, next) => {
  try {
    const [total, verified, pending, incomplete, approvedStories] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ profileStatus: "verified" }),
      User.countDocuments({ profileStatus: "pending_verification" }),
      User.countDocuments({ profileStatus: "incomplete" }),
      Story.countDocuments({ status: "approved" }),
    ]);

    // Monthly registrations — last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const count = await User.countDocuments({ role: "user", createdAt: { $gte: start, $lt: end } });
      months.push({
        month: start.toLocaleString("default", { month: "short" }),
        users: count,
      });
    }

    // Plan distribution
    const [freePlan, premiumPlan, elitePlan] = await Promise.all([
      User.countDocuments({ role: "user", membershipPlan: "free" }),
      User.countDocuments({ role: "user", membershipPlan: "premium" }),
      User.countDocuments({ role: "user", membershipPlan: "elite" }),
    ]);

    // Get total earnings from Stripe
    let totalEarnings = 0;
    try {
      const stripe = getStripe();
      const startDate = Math.floor(new Date("2026-04-01").getTime() / 1000);
      const sessions = await stripe.checkout.sessions.list({ limit: 100, created: { gte: startDate } });
      totalEarnings = sessions.data
        .filter((s) => s.payment_status === "paid")
        .reduce((sum, s) => sum + s.amount_total / 100, 0);
    } catch {}

    res.json({
      success: true,
      stats: {
        total, verified, pending, incomplete, approvedStories, totalEarnings,
        monthlyUsers: months,
        planDistribution: [
          { name: "Free", value: freePlan },
          { name: "Premium", value: premiumPlan },
          { name: "Elite", value: elitePlan },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};
