import nodemailer from "nodemailer";
import  User  from "../models/User.js";


export const sendEmail = async ({
  email,
  emailType,
  userId,
}) => {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user based on email type using switch case
    switch (emailType) {
      case "Forgot Password":
        await User.findByIdAndUpdate(userId, {
          forgotPasswordToken: otp,
          forgotPasswordExpiry: Date.now() + 30 * 60 * 1000,
        });
        break;
      
    //   case "Email Verification":
    //     await User.findByIdAndUpdate(userId, {
    //       verifyToken: otp,
    //       verifyTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
    //     });
        break;
      
      default:
        throw new Error("Invalid email type");
    }

    // Looking to send emails in production? Check out our Email API/SMTP product!
    var transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let mailOptions;

    // Switch case for different mail types
    switch (emailType) {
      case "Forgot Password":
        mailOptions = {
          from: "dev.skydma.com",
          to: email,
          subject: "Password Reset OTP",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Password Reset Request</h2>
              <p>You have requested to reset your password. Please use the following OTP:</p>
              <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #333; font-size: 32px; margin: 0;">${otp}</h1>
              </div>
              <p><strong>This OTP will expire in 30 minutes.</strong></p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `
        };
        break;

    //   case "Email Verification":
        mailOptions = {
          from: "dev.skydma.com",
          to: email,
          subject: "Verify Your Email",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Email Verification</h2>
              <p>Please use the following OTP to verify your email:</p>
              <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #333; font-size: 32px; margin: 0;">${otp}</h1>
              </div>
              <p><strong>This OTP will expire in 24 hours.</strong></p>
            </div>
          `
        };
        break;

      default:
        throw new Error("Invalid email type");
    }

    const mailResponse = await transporter.sendMail(mailOptions);
    if (mailResponse) {
      return mailResponse;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};