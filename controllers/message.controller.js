import Message from "../models/message.model.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email and message are required" });
    }
    await Message.create({ name, email, subject, message });
    res.status(201).json({ success: true, message: "Message sent successfully." });
  } catch (error) { next(error); }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) { next(error); }
};

export const markAsRead = async (req, res, next) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) { next(error); }
};

export const deleteMessage = async (req, res, next) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) { next(error); }
};
