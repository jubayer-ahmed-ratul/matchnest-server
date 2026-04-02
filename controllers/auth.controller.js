import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import initFirebase from "../config/firebase.js";

// @desc    Register - only name, email, password required
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful. Please complete your profile to get verified.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileStatus: user.profileStatus,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // explicitly select password since it's select:false in schema
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account has been deactivated" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileStatus: user.profileStatus,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc    Google Login via Firebase idToken
// @route   POST /api/auth/google
export const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "idToken is required" });
    }

    // Verify Firebase token
    const admin = initFirebase();
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: uid,
        authProvider: "google",
        profilePhoto: picture ? { url: picture } : undefined,
        isEmailVerified: true,
      });
    } else if (!user.googleId) {
      // existing local user — link google
      user.googleId = uid;
      user.authProvider = "google";
      await user.save();
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account has been deactivated" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileStatus: user.profileStatus,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
