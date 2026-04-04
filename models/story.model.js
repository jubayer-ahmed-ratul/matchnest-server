import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coupleNames: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    story: { type: String, required: true, maxlength: 1000, trim: true },
    image: { type: String }, // imgbb url
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
