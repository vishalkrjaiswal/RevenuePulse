import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  unpaidAmount: { type: Number, default: function () { return this.totalAmount - this.paidAmount } },
  status: { type: String, enum: ["pending", "partial", "paid", "overdue"], default: "pending" },
  dueDate: { type: Date }, // <-- new field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Optional: update `updatedAt` on save
paymentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;

