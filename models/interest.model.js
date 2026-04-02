import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    note: {
      type: String,
      maxlength: 300,
      trim: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate interest requests
interestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model("Interest", interestSchema);
