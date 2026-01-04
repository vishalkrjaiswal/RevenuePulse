import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔒 Verify JWT for all authenticated routes
export const verifyJwt = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user without password
    const user = await User.findOne({ email: decoded.email }).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or invalid token",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in JWT verification:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// 🛡 Admin-only middleware (must run after verifyJwt)
//export const isAdmin = (req, res, next) => {
  //if (req.user.role !== "admin") {
    //return res.status(403).json({
      //success: false,
      //message: "Access denied. Admin privileges required",
    //});
  //}
  //next();
//};
