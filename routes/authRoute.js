import express from "express";
import { authForgotPassword, authLogin, authRegister, authVerifyEmail, resetPassword } from "../controllers/Auth.js";

const authRouter = express.Router();

// routes
authRouter.post("/register", authRegister);
authRouter.get("/verify-email/:token", authVerifyEmail);
authRouter.post("/login", authLogin);
authRouter.post("/forgot-password", authForgotPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;