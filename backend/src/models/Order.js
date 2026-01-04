// backend/src/models/Order.js
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  productId: { type: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number, default: 0 }
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, default: () => nanoid(10), unique: true }, // unique order id
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: { type: [ItemSchema], default: [] },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 }, // <--- new field for tracking paid amount
  orderDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
});

export default mongoose.model('Order', OrderSchema);
