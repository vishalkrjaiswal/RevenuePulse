// src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
  password: { type: String }, // hashed, may be undefined for OAuth users
  name: { type: String },
  refreshToken: { type: String }, // store current valid refresh token for that user
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  forgotPasswordToken: {type: String,default: null},
  forgotPasswordExpiry: {type: Date,default: null},
},
{
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);
