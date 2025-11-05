import express from "express";
import { authLogin, authRegister } from "../controllers/Auth.js";

const authRouter = express.Router();

// routes
authRouter.post("/register", authRegister);
authRouter.post("/login", authLogin);

export default authRouter;