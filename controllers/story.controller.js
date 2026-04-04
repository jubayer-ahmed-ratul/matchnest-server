import Story from "../models/story.model.js";

// Public: get approved stories
export const getApprovedStories = async (req, res, next) => {
  try {
    const stories = await Story.find({ status: "approved" })
      .sort({ order: 1, createdAt: -1 })
      .populate("submittedBy", "name");
    res.json({ success: true, stories });
  } catch (error) { next(error); }
};

// User: submit a story
export const submitStory = async (req, res, next) => {
  try {
    const { coupleNames, location, story, image } = req.body;
    if (!coupleNames || !story) {
      return res.status(400).json({ success: false, message: "Couple names and story are required" });
    }
    const newStory = await Story.create({
      submittedBy: req.user._id,
      coupleNames, location, story, image,
    });
    res.status(201).json({ success: true, message: "Story submitted for review.", story: newStory });
  } catch (error) { next(error); }
};

// Admin: add story directly as approved
export const adminAddStory = async (req, res, next) => {
  try {
    const { coupleNames, location, story, image } = req.body;
    if (!coupleNames || !story) {
      return res.status(400).json({ success: false, message: "Couple names and story are required" });
    }
    const newStory = await Story.create({
      submittedBy: req.user._id,
      coupleNames, location, story, image,
      status: "approved",
    });
    res.status(201).json({ success: true, story: newStory });
  } catch (error) { next(error); }
};
export const getAllStories = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const stories = await Story.find(filter)
      .sort({ createdAt: -1 })
      .populate("submittedBy", "name email");
    res.json({ success: true, stories });
  } catch (error) { next(error); }
};

// Admin: update story status
export const updateStoryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const story = await Story.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    res.json({ success: true, story });
  } catch (error) { next(error); }
};

// Admin: delete story
export const deleteStory = async (req, res, next) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Story deleted" });
  } catch (error) { next(error); }
};

// Admin: reorder stories
export const reorderStories = async (req, res, next) => {
  try {
    const { orderedIds } = req.body; // array of story IDs in new order
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: "orderedIds must be an array" });
    }
    await Promise.all(
      orderedIds.map((id, index) => Story.findByIdAndUpdate(id, { order: index }))
    );
    res.json({ success: true, message: "Stories reordered" });
  } catch (error) { next(error); }
};
