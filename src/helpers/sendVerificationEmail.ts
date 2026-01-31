import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
) {
  try {
    const mailOptions = {
      from: `"AITute" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your AITute account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6fb;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.08);">
            
            <h2 style="color: #4f46e5; text-align: center; margin-bottom: 10px;">
              Welcome to AITute 🚀
            </h2>

            <p style="font-size: 16px; color: #333;">
              Hi <strong>${username}</strong>,
            </p>

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Thanks for joining <strong>AITute</strong> — your AI-powered learning companion.
              To complete your registration, please use the verification code below:
            </p>

            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4f46e5; text-align: center; margin: 32px 0;">
              ${verifyCode}
            </div>

            <p style="font-size: 14px; color: #555; line-height: 1.5;">
              ⏳ This code will expire in <strong>10 minutes</strong>.  
              If you didn’t request this verification, you can safely ignore this email.
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} AITute • Built with ❤️ by Ayush Prasad
            </p>

          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Verification email sent successfully" };

  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, message: "Failed to send the verification email" };
  }
}
