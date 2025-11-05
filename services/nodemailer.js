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
        font-size: 18px;
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

              <p style="font-size:14px; color:#555; word-break:break-all;">
                ${data1.resetLink}
              </p>

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

              <a href="${data1.loginLink}" class="button">Start Your Journey</a>

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

    default:
      return `<p>No template type detected.</p>`;
  }
};

// send welcome email upon registration
// Send Welcome Email (Aura)
export const sendWelcomeEmail = async (email, fullName, loginLink) => {
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
      html: getEmailTemplate("welcome", { fullName, loginLink }),
      text: `Welcome to Aura, ${fullName}! Login here: ${loginLink}`,
    };

    console.log("📨 Sending welcome email...");
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Welcome email sent successfully!");
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}`);

    return {
      success: true,
      messageId: info.messageId,
      loginLink,
    };

  } catch (error) {
    console.error("❌ Error sending WELCOME email.");
    console.error("Reason:", error.message);

    // Fallback log for debugging or manual resend
    console.log("\n🔗 MANUAL LOGIN LINK:");
    console.log(`User: ${email}`);
    console.log(`Login URL: ${loginLink}\n`);

    return {
      success: false,
      fallback: true,
      loginLink,
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

export const sendPasswordResetEmail = async (toEmail, resetLink) => {
  const emailContent = getEmailTemplate("password-reset", {
    email: toEmail,
    resetLink,
  });
  await sendEmail(toEmail, "Password Reset Request 🔒", emailContent);
};

export const sendPasswordResetSuccessEmail = async (toEmail, loginLink) => {
  const emailContent = getEmailTemplate("password-reset-success", {
    loginLink,
  });
  await sendEmail(toEmail, "Password Reset Successful ✅", emailContent);
};
