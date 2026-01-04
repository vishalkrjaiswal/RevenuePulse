import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const CustomerSchema = new mongoose.Schema({
  customerId: { type: String, unique: true, default: uuidv4 },
  email: { type: String, unique: true, required: true },
  name: { type: String },
  phone: { type: String },
  totalSpend: { type: Number, default: 0 }, 
  lastOrderDate: { type: Date, default: null },
  totalOrders: { type: Number, default: 0 },
  attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Customer', CustomerSchema);
