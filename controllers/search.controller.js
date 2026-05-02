import User from "../models/user.model.js";
import { getPlan } from "../utils/planPermissions.js";

export const searchProfiles = async (req, res, next) => {
  try {
    const { gender, religion, profession, city, minAge, maxAge, verified, page = 1, limit = 10 } = req.query;

    const userPlan = getPlan(req.user);
    const myPlan = req.user?.membershipPlan || "free";
    const isAdmin = req.user?.role === "admin";

    const filter = {
      _id: { $ne: req.user._id },
      isActive: true,
      role: "user",
    };

    if (!isAdmin) {
      // Free users cannot see premium or elite profiles
      if (myPlan === "free") {
        filter.membershipPlan = "free";
      } else if (myPlan === "premium") {
        filter.membershipPlan = { $in: ["free", "premium"] };
      }
      // elite can see everyone

      // Free users can only see non-verified profiles
      if (!userPlan.canViewVerified) {
        filter.profileStatus = { $ne: "verified" };
      }
    }
    // admin sees everyone with no restrictions

    // Verified filter
    if (verified === "true") filter.profileStatus = "verified";

    if (gender) filter.gender = gender;
    if (religion) filter.religion = religion;

    // Advanced filters — premium/elite only
    if (userPlan.advancedFilters) {
      if (profession) filter.profession = new RegExp(profession, "i");
      if (city) filter["location.city"] = new RegExp(city, "i");
    }

    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Plan-based sort: elite first → premium → free, then by date
    const planOrder = { elite: 0, premium: 1, free: 2 };
    const allUsers = await User.find(filter)
      .select("name age gender religion profession bio location profilePhoto profileStatus membershipPlan")
      .sort({ createdAt: -1 });

    // Sort by plan priority
    allUsers.sort((a, b) => {
      const pa = planOrder[a.membershipPlan] ?? 2;
      const pb = planOrder[b.membershipPlan] ?? 2;
      return pa - pb;
    });

    const total = allUsers.length;
    const users = allUsers.slice(skip, skip + Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), users });
  } catch (error) {
    next(error);
  }
};

export const getProfileById = async (req, res, next) => {
  try {
    const viewerPlan = getPlan(req.user);

    const user = await User.findOne({
      _id: req.params.id,
      isActive: true,
      role: "user",
    }).select("name age gender religion profession bio location profilePhoto profileStatus membershipPlan phone profileViews viewedBy photos education family partnerPreference hobbies height weight maritalStatus bloodGroup career spiritual createdAt");

    if (!user) return res.status(404).json({ success: false, message: "Profile not found" });

    // Track profile view
    if (!user.viewedBy.includes(req.user._id)) {
      user.viewedBy.push(req.user._id);
      user.profileViews = (user.profileViews || 0) + 1;
      await user.save();
    }

    // Hide contact info for non-elite
    const userData = user.toObject();
    if (!viewerPlan.canViewContact) {
      delete userData.phone;
    }

    res.json({ success: true, user: userData });
  } catch (error) {
    next(error);
  }
};
