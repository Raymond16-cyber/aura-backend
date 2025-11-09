import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../services/nodemailer.js";

// register auth
export const authRegister = asyncHandler(async (req, res) => {
  console.log("registering");

  const { name, email, password } = req.body;
  const isExisting = await User.findOne({ email: email });
  // if existing user
  if (isExisting) {
    console.log("User already exists");
    res.status(400).json({ error: "User with this email already exists" });
  }
  // assign salt
  const salt = await bcrypt.genSalt(10);
  // hash password
  const hashedPassword = await bcrypt.hash(password, salt);
  // create new user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });
  // create verification token
  const token = jwt.sign(
    {
      id: newUser._id,
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  newUser.verificationToken = token;
  await newUser.save();
  // send welcome email to user
  const emailData = await sendWelcomeEmail(
    email,
    name,
    process.env.FRONTEND_URL + "/verify-email?token=" + token
  );
  console.log("User registered successfully", {
    success: emailData.success,
    url: process.env.FRONTEND_URL + "/verify-email?token=" + token,
  });
  res.status(201).json({
    success: emailData.success,
    message: "User registered successfully,Heading to veriy email page",
    url: "/verify-email?token=" + token,
  });
});

// verify email auth
export const authVerifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  console.log("Verifying email");

  if (!token) return res.status(400).json({ error: "Token missing" });

  const user = await User.findOne({ verificationToken: token });

  if (!user) return res.status(400).json({ error: "Invalid or expired token" });

  user.isEmailVerified = true;
  user.verificationToken = null;
  await user.save();

  res
    .status(200)
    .json({ message: "Email verified successfully,You can now Login" });
});

// login auth
export const authLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const isExisting = await User.findOne({ email: email }).select("+password");
  // if !existing user
  if (!isExisting) {
    console.log("Invalid email or password");
    res.status(400).json({ error: "User with this email does not exist" });
  }
  // check password
  const isPasswordMatch = await bcrypt.compare(password, isExisting.password);
  if (!isPasswordMatch) {
    console.log("Invalid email or password");
    res.status(400).json({ error: "Invalid email or password" });
  }
  console.log("User logged in successfully");
  // create session or token
  const token = jwt.sign(
    {
      id: isExisting._id,
      _id: isExisting._id,
      name: isExisting.name,
      email: isExisting.email,
      image: isExisting.image,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  // Set cookies (optional - comment out if using Bearer tokens only)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only secure in prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json({
      message: "User logged in successfully",
      token,
      user: {
        id: isExisting._id,
        name: isExisting.name,
        email: isExisting.email,
        image: isExisting.image,
      },
    });
});

// forgot password auth
export const authForgotPassword = asyncHandler(async (req, res) => {
  console.log("Processing forgot password");
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    console.log("User with this email does not exist");
    return res
      .status(400)
      .json({ error: "User with this email does not exist" });
  }
  // create verification token
  const token = jwt.sign(
    {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  user.passwordResetToken = token;
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();
  // send password reset email to user
  const emailData = await sendPasswordResetEmail(
    email,
    process.env.FRONTEND_URL + "/reset-password?token=" + token
  );
  console.log("Password reset email sent", {
    success: emailData.success,
  });
  res.status(200).json({
    success: emailData.success,
    message: "Email sent with password reset link",
    url: "/reset-password?token=" + token,
  });
});

// reset password auth
export const resetPassword = async (req, res) => {
  console.log("Resetting password");

  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    console.log("Invalid or expired token");
    return res
      .status(400)
      .json({ message: "Unable to reset password at the moment" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  await user.save();
  console.log("Password reset successful");
  return res.status(200).json({
    message: "Password reset successful. You can now log in.",
  });
};
