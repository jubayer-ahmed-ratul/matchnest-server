import User from "../models/user.model.js";
import { getPlan } from "../utils/planPermissions.js";

export const searchProfiles = async (req, res, next) => {
  try {
    const { gender, religion, profession, city, minAge, maxAge, page = 1, limit = 10 } = req.query;

    const userPlan = getPlan(req.user);

    const filter = {
      _id: { $ne: req.user._id },
      isActive: true,
      role: "user",
    };

    // Free users can only see non-verified profiles
    if (!userPlan.canViewVerified) {
      filter.profileStatus = { $ne: "verified" };
    }

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

    // Elite users get priority listing (elite first)
    const sortOrder = userPlan.priorityListing
      ? { membershipPlan: -1, createdAt: -1 }
      : { createdAt: -1 };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name age gender religion profession bio location profilePhoto profileStatus membershipPlan")
        .skip(skip)
        .limit(Number(limit))
        .sort(sortOrder),
      User.countDocuments(filter),
    ]);

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
    }).select("name age gender religion profession bio location profilePhoto profileStatus membershipPlan phone profileViews viewedBy photos education family partnerPreference createdAt");

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
