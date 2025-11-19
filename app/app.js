import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "../configs/DBConfig.js";
import cookieParser from "cookie-parser";
import authRouter from "../routes/authRoute.js";
import waitlistRouter from "../routes/waitlistRoute.js";

// Connect to database
connectDB();

const app = express();

// CORS config
app.use(
  cors({
    // origin: // Replace with frontend domain on production
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

// Optional: health check
app.get("/", (req, res) => {
  res.send("✅ Backend server is running");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/waitlist", waitlistRouter);

export default app;
