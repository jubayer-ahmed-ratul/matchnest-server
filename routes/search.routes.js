import express from "express";
import { searchProfiles, getProfileById } from "../controllers/search.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";
import { getPlan } from "../utils/planPermissions.js";

const router = express.Router();

router.get("/", protect, searchProfiles);

// Smart suggestions based on profile compatibility
router.get("/suggestions", protect, async (req, res, next) => {
  try {
    const me = req.user;
    const oppositeGender = me.gender === "male" ? "female" : me.gender === "female" ? "male" : null;

    const filter = {
      _id: { $ne: me._id },
      isActive: true,
      role: "user",
    };
    if (oppositeGender) filter.gender = oppositeGender;

    const candidates = await User.find(filter)
      .select("name age gender religion profession education location profilePhoto profileStatus career family partnerPreference hobbies maritalStatus")
      .limit(50);

    // Education level mapping for similarity
    const eduLevel = { below_ssc: 1, ssc: 2, hsc: 3, diploma: 3, bachelor: 4, master: 5, phd: 6, other: 3 };
    // Income level mapping
    const incomeLevel = { "0": 0, below_3L: 1, "3L_5L": 2, "5L_10L": 3, "10L_20L": 4, above_20L: 5 };

    const scored = candidates.map((candidate) => {
      let score = 0;
      const breakdown = [];

      // Religion match (25pts)
      if (me.religion && candidate.religion && me.religion === candidate.religion) {
        score += 25; breakdown.push("Religion");
      }

      // Education similarity (20pts)
      const myEdu = eduLevel[me.education] || 0;
      const theirEdu = eduLevel[candidate.education] || 0;
      if (myEdu && theirEdu && Math.abs(myEdu - theirEdu) <= 1) {
        score += 20; breakdown.push("Education");
      }

      // Income/profession similarity (20pts)
      const myIncome = incomeLevel[me.career?.annualIncome] ?? -1;
      const theirIncome = incomeLevel[candidate.career?.annualIncome] ?? -1;
      if (myIncome >= 0 && theirIncome >= 0 && Math.abs(myIncome - theirIncome) <= 1) {
        score += 20; breakdown.push("Lifestyle");
      }

      // Age range from partner preference (20pts)
      const theirAge = candidate.age;
      const myPrefMin = me.partnerPreference?.minAge;
      const myPrefMax = me.partnerPreference?.maxAge;
      if (theirAge && myPrefMin && myPrefMax && theirAge >= myPrefMin && theirAge <= myPrefMax) {
        score += 20; breakdown.push("Age");
      } else if (theirAge && me.age && Math.abs(theirAge - me.age) <= 5) {
        score += 10; breakdown.push("Age");
      }

      // Location match (15pts)
      if (me.location?.city && candidate.location?.city &&
        me.location.city.toLowerCase() === candidate.location.city.toLowerCase()) {
        score += 15; breakdown.push("Location");
      }

      return { ...candidate.toObject(), matchScore: score, matchBreakdown: breakdown };
    });

    // Sort by score descending, take top 12
    const suggestions = scored
      .filter((s) => s.matchScore >= 60)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 12);

    res.json({ success: true, suggestions });
  } catch (error) { next(error); }
});

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
