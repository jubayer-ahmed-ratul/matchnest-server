import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  readAt: { type: Date, default: null },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  messages: [messageSchema],
  lastMessage: { type: String, default: "" },
  lastMessageAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
