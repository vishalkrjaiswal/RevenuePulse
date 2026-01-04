// backend/src/models/CommunicationLog.js
import mongoose from 'mongoose';

const CommunicationLogSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  message: { type: String, required: true }, // ✨ ADD THIS LINE
  status: { type: String, enum: ['sent', 'failed'], required: true },
  sentAt: { type: Date, default: Date.now },
  response: { type: String, default: '' }
});

export default mongoose.model('CommunicationLog', CommunicationLogSchema);
