import Chat from "../models/chat.model.js";

// Send chat request to a user
export const sendChatRequest = async (req, res, next) => {
  try {
    const { toUserId } = req.body;
    const fromUserId = req.user._id;

    if (toUserId === fromUserId.toString()) {
      return res.status(400).json({ success: false, message: "Cannot chat with yourself" });
    }

    // Check if chat already exists
    const existing = await Chat.findOne({
      participants: { $all: [fromUserId, toUserId] },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Chat request already exists", chat: existing });
    }

    const chat = await Chat.create({
      participants: [fromUserId, toUserId],
      requestedBy: fromUserId,
      status: "pending",
    });

    res.status(201).json({ success: true, chat });
  } catch (error) { next(error); }
};

// Respond to chat request (accept/reject)
export const respondChatRequest = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    // Only the receiver can respond
    if (chat.requestedBy.toString() === userId.toString()) {
      return res.status(403).json({ success: false, message: "You cannot respond to your own request" });
    }
    if (!chat.participants.map(p => p.toString()).includes(userId.toString())) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    chat.status = status;
    await chat.save();
    res.json({ success: true, chat });
  } catch (error) { next(error); }
};

// Get all chats for current user (accepted)
export const getMyChats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({
      participants: userId,
      status: "accepted",
    })
      .populate("participants", "name profilePhoto")
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) { next(error); }
};

// Get pending chat requests (received)
export const getPendingRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({
      participants: userId,
      requestedBy: { $ne: userId },
      status: "pending",
    }).populate("participants", "name profilePhoto age profession");

    res.json({ success: true, chats });
  } catch (error) { next(error); }
};

// Get messages in a chat
export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId)
      .populate("messages.sender", "name profilePhoto");

    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });
    if (!chat.participants.map(p => p.toString()).includes(userId.toString())) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (chat.status !== "accepted") {
      return res.status(403).json({ success: false, message: "Chat not accepted yet" });
    }

    res.json({ success: true, messages: chat.messages });
  } catch (error) { next(error); }
};

// Send a message
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });
    if (!chat.participants.map(p => p.toString()).includes(userId.toString())) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (chat.status !== "accepted") {
      return res.status(403).json({ success: false, message: "Chat not accepted" });
    }

    chat.messages.push({ sender: userId, text });
    chat.lastMessage = text;
    chat.lastMessageAt = new Date();
    await chat.save();

    const newMsg = chat.messages[chat.messages.length - 1];
    res.json({ success: true, message: newMsg });
  } catch (error) { next(error); }
};
