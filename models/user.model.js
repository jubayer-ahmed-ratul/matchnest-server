import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // --- Basic Auth Info (required at registration) ---
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // --- Profile Info (filled after registration) ---
    age: {
      type: Number,
      min: [18, "Must be at least 18"],
      max: [80, "Age seems invalid"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    religion: {
      type: String,
      enum: ["islam", "hinduism", "christianity", "buddhism", "other"],
    },
    profession: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      city: String,
      country: { type: String, default: "Bangladesh" },
    },
    profilePhoto: {
      url: String,
      publicId: String,
    },

    photos: [{ url: String }],

    education: {
      type: String,
      enum: ["below_ssc", "ssc", "hsc", "diploma", "bachelor", "master", "phd", "other"],
    },

    family: {
      fatherOccupation: { type: String, trim: true },
      motherOccupation: { type: String, trim: true },
      siblings: Number,
      familyType: { type: String, enum: ["nuclear", "joint", "other"] },
      familyStatus: { type: String, enum: ["middle_class", "upper_middle_class", "rich", "other"] },
    },

    partnerPreference: {
      minAge: Number,
      maxAge: Number,
      religion: String,
      education: String,
      location: String,
      profession: String,
    },

    // --- Verification Documents ---
    verificationDocs: {
      docType: {
        type: String,
        enum: ["nid", "passport", "birth_certificate"],
      },
      docImage: {
        url: String,
        publicId: String,
      },
      docImageBack: {
        url: String,
        publicId: String,
      },
    },

    // --- Account Status ---
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileStatus: {
      type: String,
      enum: ["incomplete", "pending_verification", "verified", "rejected"],
      default: "incomplete",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    membershipPlan: {
      type: String,
      enum: ["free", "premium", "elite"],
      default: "free",
    },
    profileViews: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // --- Password Reset ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if profile is complete enough to request verification
userSchema.methods.canRequestVerification = function () {
  return (
    this.age &&
    this.gender &&
    this.religion &&
    this.profession &&
    this.profilePhoto?.url &&
    this.verificationDocs?.docImage?.url
  );
};

export default mongoose.model("User", userSchema);
