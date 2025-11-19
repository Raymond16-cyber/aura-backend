import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.NODE_ENV === "development"
        ? process.env.MONGO_URI
        : process.env.MONGO_URL,
    );

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ Mongoose connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("📴 MongoDB connection closed through app termination");
  process.exit(0);
});

export default connectDB;
