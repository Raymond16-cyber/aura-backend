import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../services/nodemailer.js";

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
  // create new user
  const newUser = await User.create({
    name,
    email,
    password,
  });
  console.log("User registered successfully");
  // send welcome email to user
  const emailData = await sendWelcomeEmail(
    email,
    name,
    process.env.FRONTEND_URL + "/auth/login"
  );
  console.log("User registered successfully", { success: emailData.success });
  res.status(201).json({
    success: emailData.success,
    message: "User registered successfully",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
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
});
