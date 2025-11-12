import mongoose from "mongoose";

const WaitlistUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name:{
        type: String,
        required:true
    },

    // position on the waitlist (optional but useful for UI)
    waitlistPosition: {
      type: Number,
      default: 0,
    },

    // unique code for each user to share
    referralCode: {
      type: String,
      unique: true,
    },
    referralLink: {
      type: String,
      unique: true,
    },
    // how many people this user referred
    referralsCount: {
      type: Number,
      default: 0,
    },

    // who referred this user (referral tracking)
    referredBy: {
      type: String, // stores referralCode of inviter
      default: null,
    },

    // status: waiting or granted access
    status: {
      type: String,
      enum: ["waiting", "invited", "active"],
      default: "waiting",
    },
  },
  { timestamps: true }
);



const Waitlist = mongoose.model("WaitlistUser", WaitlistUserSchema);
export default Waitlist;