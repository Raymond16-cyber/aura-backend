import cron from "node-cron";
import { sendFollowUpEmailController } from "../controllers/WaitlistContr.js";

// run daily at 12:00 AM
cron.schedule("0 0 * * *", () => {
  console.log("⏰ Running daily follow-up email job...");
  sendFollowUpEmailController(
    {},
    {
      json: (data) => console.log("Cron result:", data),
      status: (code) => ({ json: (d) => console.log("Cron error:", code, d) }),
    }
  );
});
console.log("✅ Cron job for follow-up emails scheduled.");