import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/mailOptions.js";
import bcrypt from "bcrypt";

export const signupController = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      role: "user",
    });

    const user = await newUser.save();
    if (user) {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          name: user.name,
          email: user.email,
        },
      });
    }
  } catch (error) {
    console.log("Error in signController:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateToken(user.email);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite:"none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accessToken
      },
    });
  } catch (error) {
    console.log("Error in loginController:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log("Error in logoutController:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const profileController = async (req, res) => {
  try {
    const user = req.user;
    const token = req.cookies?.accessToken;

    return res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.log("Error in profileController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Step 1: Request password reset (send email)
export const requestPasswordResetController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Send email with reset token
    const mailResponse = await sendEmail({
      email: user.email,
      emailType: "Forgot Password",
      userId: user._id,
    });

    if (mailResponse) {
      return res.status(200).json({
        success: true,
        message: "Reset password OTP sent successfully to your email",
      });
    }
  } catch (error) {
    console.log("Error in requestPasswordResetController:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending reset email",
    });
  }
};

// Step 2: Reset password with OTP
export const resetPasswordController = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and OTP are required",
      });
    }

    // Find user by email and check if token is not expired
    const user = await User.findOne({
      email,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found or OTP expired",
      });
    }

    // Compare the provided OTP with the stored OTP
    if (user.forgotPasswordToken !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    // Save the user
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error in resetPasswordController:", error);
    return res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};
