import Waitlist from "../models/Waitlist.js";
import { sendWaitlistConfirmationEmail } from "../services/nodemailer.js";

// Join waitlist
export const joinWaitlist = async (req, res) => {
  console.log("Joining waitlist...");

  try {
    const { email, name, referralCode } = req.body;
    console.log("Request body:", req.body);

    if (!email) return res.status(400).json({ error: "Email is required." });
    if (!name) return res.status(400).json({ error: "Name is required." });

    // 1️⃣ Check if user already exists
    const existingUser = await Waitlist.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        error: "You are already on the waitlist.",
        referralCode: existingUser.referralCode,
        waitlistPosition: existingUser.waitlistPosition,
      });
    }

    // 2️⃣ Determine new position
    const position = (await Waitlist.countDocuments()) + 1;

    // 3️⃣ Find referrer (optional)
    let referrer = null;
    let referrerEmail = null;
    if (referralCode) {
      referrer = await Waitlist.findOne({ referralCode });
      if (referrer) referrerEmail = referrer.email;
      else console.log(`Referral code ${referralCode} not found`);
    }

    // create user ref code
    const refCode = `AURA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    // create user referral link
    const referralLink = refCode ? `${process.env.FRONTEND_URL}/waitlist/?ref=${refCode}` : null;
    console.log("Referral link:", referralLink, refCode);
    // 4️⃣ Send confirmation email before saving
    const dashboardLink = process.env.FRONTEND_URL;
    const emailResponse = await sendWaitlistConfirmationEmail(
      email,
      name,
      refCode,
      dashboardLink,
      referralLink
    );

    if (!emailResponse.success) {
      return res.status(400).json({
        error: "Unable to send confirmation email. Please check your email address.",
      });
    }

    // 5️⃣ Create new user
    const newUser = new Waitlist({
      email,
      name,
      waitlistPosition: position,
      referredBy: referrerEmail,
      referralCode: refCode,
      referralLink: referralLink,
    });
    await newUser.save();
    console.log(`New user added to waitlist: ${email} at position ${position}`);

    // 6️⃣ Increment referrer count after successful save
    if (referrer) {
      referrer.referralsCount += 1;
      await referrer.save();
      console.log(`Referral count incremented for ${referrer.email}`);
    }

    return res.status(201).json({
      message: "Welcome! You're now on the waitlist 🚀",
      referralCode: newUser.referralCode,
      waitlistPosition: newUser.waitlistPosition,
    });
  } catch (error) {
    console.error("Waitlist error:", error);
    return res.status(500).json({ error: "Server error. Try again." });
  }
};
