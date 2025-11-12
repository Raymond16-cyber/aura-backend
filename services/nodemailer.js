import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

// Create transporter
const createTransporter = () => {
  // Use Gmail service for both development and production
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// emailTemplates.js

export const getEmailTemplate = (type, data1, data2) => {
  const baseStyle = `
    <style>
      .container {
        font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 20px;
        background: linear-gradient(135deg, #f3e8ff, #e0e7ff);
      }
      .content {
        background: #ffffff;
        padding: 32px;
        border-radius: 14px;
        box-shadow: 0 4px 18px rgba(0,0,0,0.08);
      }
      .logo {
        font-weight: 700;
        font-size: 32px;
        color: #5b21b6;
        text-align: center;
        margin-bottom: 12px;
      }
      .button {
        display: inline-block;
        background: #5b21b6;
        padding: 14px 30px;
        margin: 24px 0;
        border-radius: 30px;
        color: #fff !important;
        font-weight: 600;
        text-decoration: none;
      }
      .button:hover {
        background: #3d0f92;
      }
      .footer {
        margin-top: 32px;
        font-size: 13px;
        text-align: center;
        color: #777;
      }
      .token-box {
        background: #faf5ff;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #e9d5ff;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        letter-spacing: 2px;
        color: #6d28d9;
      
      }
    </style>
  `;

  switch (type) {
    // ✅ Email Verification
    case "verification":
      return `
      <!DOCTYPE html>
      <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Aura</div>
              <h2>Verify Your Email ✨</h2>
              <p>Welcome to Aura — where daily growth meets calm focus.</p>

              <a href="${
                data1.verificationLink
              }" class="button">Verify Email</a>

              <p>Or use this token:</p>
              <div class="token-box">${data2}</div>

              <p style="font-size:14px; color:#555; word-break:break-all;">
                ${data1.verificationLink}
              </p>

              <div class="footer">
                © ${new Date().getFullYear()} Aura — calm daily growth.
              </div>
            </div>
          </div>
        </body>
      </html>
      `;

    // ✅ Password Reset Request
    case "password-reset":
      return `
      <!DOCTYPE html>
      <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Aura</div>
              <h2>Password Reset Request 🔒</h2>
              <p>Hello ${data1.email}, click the button below to reset your password.</p>

              <a href="${data1.resetLink}" class="button">Reset Password</a>


              <div class="footer">
                If you didn’t make this request, ignore this email.
              </div>
            </div>
          </div>
        </body>
      </html>
      `;

    // ✅ Password Reset Success
    case "password-reset-success":
      return `
      <!DOCTYPE html>
      <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Aura</div>
              <h2>Password Reset Successful ✅</h2>
              <p>Your password has been reset successfully.</p>

              <a href="${data1.loginLink}" class="button">Login Now</a>

              <div class="footer">
                If you didn’t perform this reset, contact support immediately.
              </div>
            </div>
          </div>
        </body>
      </html>
      `;

    // ✅ NEW — Welcome email (after registration is completed + verified)
    case "welcome":
      return `
      <!DOCTYPE html>
      <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Aura</div>
              <h2>Welcome to Aura ✨</h2>

              <p>Hi ${data1.fullName || "there"},</p>
              <p>
                We're excited to have you here. Aura isn’t just another productivity app.
                It’s where growth becomes a lifestyle — calm, intentional, and consistent.
              </p>

              <a href="${
                data1.verifyLink
              }" class="button">Start Your Journey By Verifying Your Email First</a>

              <p>What can you do next?</p>
              <ul>
                <li>Track your mini habits</li>
                <li>Review your wins daily</li>
                <li>See your growth streak</li>
              </ul>

              <p>
                You're not competing with anyone.  
                You're simply becoming better than yesterday.
              </p>

              <div class="footer">
                © ${new Date().getFullYear()} Aura — calm daily growth.
              </div>
            </div>
          </div>
        </body>
      </html>
      `;
    // ✅ WAITLIST CONFIRMATION EMAIL (NEW)
    case "waitlist":
      return `
      <!DOCTYPE html>
      <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Aura</div>
              <h2>You're on the Waitlist ✨</h2>

              <p>Hi ${data1.fullName || "there"},</p>
              <p>
                Thank you for joining the Aura waitlist — you're officially early!
                You'll be among the first to access the app when we launch.
              </p>

              ${
                data1.referralCode
                  ? `<p>Your referral code:</p>
                     <div class="token-box">${data1.referralCode}</div>
                     <p>Share Aura with friends — the more people sign up using your code, the sooner you unlock early access.</p>`
                  : `<p>Invite others and move up faster on the waitlist.</p>`
              }

              <a href="${data1.dashboardLink}" class="button">
                View My Waitlist Position 🚀
              </a>

              <p style="margin-top: 18px;">We're building something meaningful:
                <strong>growth without overwhelm.</strong>
              </p>
              <p>Your referral link:</p>
              <div class="token-box ">
                ${data1.referralLink ? data1.referralLink : "No referral link"}
              </div>
              <p>Thank you for being part of our community from the start. Exciting times ahead!</p>
              <div class="footer">
                © ${new Date().getFullYear()} Aura — calm daily growth.
              </div>
            </div>
          </div>
        </body>
      </html>
      `;

    default:
      return `<p>No template type detected.</p>`;
  }
};

// send welcome email upon registration
// Send Welcome Email (Aura)
export const sendWelcomeEmail = async (email, fullName, verifyLink) => {
  console.log("\n✨ Preparing to send WELCOME email...");
  console.log(`From: ${process.env.EMAIL_USER}`);
  console.log(`To: ${email}`);

  try {
    const transporter = createTransporter();

    // Ensure credentials are valid before sending
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP verified — ready to send!");

    const mailOptions = {
      from: `"Aura" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `🎉 Welcome to Aura, ${fullName}!`,
      html: getEmailTemplate("welcome", { fullName, verifyLink }),
      text: `Welcome to Aura, ${fullName}! Verify Email here: ${verifyLink}`,
    };

    console.log("📨 Sending welcome email...");
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Welcome email sent successfully!");
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}`);

    return {
      success: true,
      messageId: info.messageId,
      verifyLink,
    };
  } catch (error) {
    console.error("❌ Error sending WELCOME email.");
    console.error("Reason:", error.message);

    // Fallback log for debugging or manual resend
    console.log("\n🔗 MANUAL LOGIN LINK:");
    console.log(`User: ${email}`);
    console.log(`verify URL: ${verifyLink}\n`);

    return {
      success: false,
      fallback: true,
      verifyLink,
      error: error.message,
    };
  }
};

export const sendVerificationEmail = async (
  toEmail,
  verificationLink,
  token
) => {
  const emailContent = getEmailTemplate(
    "verification",
    { verificationLink },
    token
  );
  await sendEmail(toEmail, "Verify Your Email ✨", emailContent);
};

// =============================
// SEND PASSWORD RESET EMAIL
// =============================
export const sendPasswordResetEmail = async (toEmail, resetLink) => {
  console.log("\n🔐 Initiating password reset email...");
  console.log(`Recipient: ${toEmail}`);
  console.log(`From: ${process.env.EMAIL_FROM}`);

  try {
    const transporter = createTransporter();

    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP ready, connection verified.");

    const emailContent = getEmailTemplate("password-reset", {
      resetLink,
      email: toEmail,
    });

    const mailOptions = {
      from: `"Aura Support" <${process.env.EMAIL_FROM}>`,
      to: toEmail,
      subject: "🔒 Reset Your Password — Aura",
      html: emailContent,
      text: `You requested to reset your password.\n\nClick here: ${resetLink}\n\nIf you didn't request this, ignore this email.`,
    };

    console.log("📨 Sending reset email...");
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Password reset email sent successfully!");
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Server response: ${info.response}`);

    return {
      success: true,
      messageId: info.messageId,
      resetLink,
    };
  } catch (error) {
    console.error("❌ Failed to send password reset email.");
    console.error("Error message:", error.message);
    console.error("Error details:", error);

    // fail-safe — still log reset link
    console.log("\n⚠️ PASSWORD RESET LINK (manual fallback):");
    console.log(`User: ${toEmail}`);
    console.log(`Reset Link: ${resetLink}\n`);

    return {
      success: false,
      error: error.message,
      fallback: true,
      resetLink,
    };
  }
};

export const sendPasswordResetSuccessEmail = async (toEmail, loginLink) => {
  const emailContent = getEmailTemplate("password-reset-success", {
    loginLink,
  });
  await sendEmail(toEmail, "Password Reset Successful ✅", emailContent);
};

// =============================
// SEND WAITLIST CONFIRMATION EMAIL
// =============================
export const sendWaitlistConfirmationEmail = async (
  email,
  fullName,
  referralCode,
  dashboardLink,
  referralLink
) => {
  console.log("\n🟣 Preparing WAITLIST confirmation email...");
  console.log(`Recipient: ${email}`);

  try {
    const transporter = createTransporter();

    console.log("🔍 Verifying transporter...");
    await transporter.verify();
    console.log("✅ Transporter verified.");

    const emailContent = getEmailTemplate("waitlist", {
      fullName,
      referralCode,
      dashboardLink,
      referralLink,
    });

    const mailOptions = {
      from: `"Aura" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `You're on the Waitlist ✨`,
      html: emailContent,
      text: `You're officially on the Aura waitlist! Dashboard: ${dashboardLink}`,
    };

    console.log("📨 Sending waitlist email...");
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Waitlist confirmation email sent!");
    console.log(`Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      referralCode,
      dashboardLink,
    };
  } catch (error) {
    console.error("❌ Failed to send waitlist confirmation email.");
    console.error("Error:", error.message);

    return {
      success: false,
      error: error.message,
      referralCode,
      dashboardLink,
    };
  }
};

