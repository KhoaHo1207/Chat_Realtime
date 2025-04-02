import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fiels are required",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName, // if the key is same can just write fullName
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      //generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({
        message: "Invalid user data",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = (req, res) => {
  try {
    // Check if JWT cookie exists
    // console.log("Cookies received:", req.cookies);
    // if (!req.cookies?.jwt) {
    //   return res.status(400).json({ message: "No active session found" });
    // }

    // Delete JWT cookie by setting null value and expire immediately
    res.cookie("jwt", "", {
      httpOnly: true, // Prevent XSS, only server can access cookies
      secure: process.env.NODE_ENV === "production", // Only send cookies over HTTPS in production environment
      sameSite: "strict", // Prevent CSRF attacks
      maxAge: 0, // Expires immediately
    });

    // If the system uses Refresh Token, delete it from DB (assuming it is stored in database)
    // await RefreshTokenModel.deleteOne({ token: req.cookies.jwt });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
