import Interest from "../models/interest.model.js";
import { getPlan } from "../utils/planPermissions.js";

export const sendInterest = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.receiverId;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ success: false, message: "You cannot send interest to yourself" });
    }

    const existing = await Interest.findOne({ sender: senderId, receiver: receiverId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Interest already sent" });
    }

    // Check plan limit
    const plan = getPlan(req.user);
    if (plan.interestLimit !== Infinity) {
      const sentCount = await Interest.countDocuments({ sender: senderId });
      if (sentCount >= plan.interestLimit) {
        return res.status(403).json({
          success: false,
          message: `Free plan allows only ${plan.interestLimit} interests. Upgrade to Premium for unlimited.`,
          upgradeRequired: true,
        });
      }
    }

    const interest = await Interest.create({ sender: senderId, receiver: receiverId });
    res.status(201).json({ success: true, message: "Interest sent successfully", interest });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to interest (accept or reject)
// @route   PUT /api/interest/respond/:interestId
export const respondToInterest = async (req, res, next) => {
  try {
    const { status } = req.body; // "accepted" or "rejected"

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be accepted or rejected" });
    }

    const interest = await Interest.findById(req.params.interestId);

    if (!interest) {
      return res.status(404).json({ success: false, message: "Interest not found" });
    }

    if (interest.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (interest.status !== "pending") {
      return res.status(400).json({ success: false, message: "Interest already responded to" });
    }

    interest.status = status;
    await interest.save();

    res.json({ success: true, message: `Interest ${status}`, interest });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all interests received (inbox)
// @route   GET /api/interest/received
export const getReceivedInterests = async (req, res, next) => {
  try {
    const interests = await Interest.find({ receiver: req.user._id })
      .populate("sender", "name age gender religion profession profilePhoto")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: interests.length, interests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all interests sent
// @route   GET /api/interest/sent
export const getSentInterests = async (req, res, next) => {
  try {
    const interests = await Interest.find({ sender: req.user._id })
      .populate("receiver", "name age gender religion profession profilePhoto")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: interests.length, interests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all accepted matches
// @route   GET /api/interest/matches
export const getMatches = async (req, res, next) => {
  try {
    const matches = await Interest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: "accepted",
    })
      .populate("sender", "name age gender religion profession profilePhoto")
      .populate("receiver", "name age gender religion profession profilePhoto")
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: matches.length, matches });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/withdraw a sent interest
// @route   DELETE /api/interest/cancel/:interestId
export const cancelInterest = async (req, res, next) => {
  try {
    const interest = await Interest.findById(req.params.interestId);

    if (!interest) {
      return res.status(404).json({ success: false, message: "Interest not found" });
    }

    if (interest.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (interest.status !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot cancel an already responded interest" });
    }

    await interest.deleteOne();

    res.json({ success: true, message: "Interest cancelled" });
  } catch (error) {
    next(error);
  }
};
