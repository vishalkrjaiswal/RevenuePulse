import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

// -------------------------------------
// Create or update a payment record
// -------------------------------------
export const createOrUpdatePayment = async ({ orderId, customerId, amount }) => {
  if (!orderId || !amount) throw new Error('Order ID and amount are required');

  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  let payment = await Payment.findOne({ orderId });

  const prevPaidAmount = payment?.paidAmount || 0;
  const newPaidAmount = prevPaidAmount + amount;
  const unpaidAmount = Math.max(order.totalAmount - newPaidAmount, 0);

  order.paidAmount = newPaidAmount;
  order.status = unpaidAmount === 0 ? 'completed' : 'pending';
  await order.save();

  if (payment) {
    payment.paidAmount = newPaidAmount;
    payment.unpaidAmount = unpaidAmount;
    payment.status = unpaidAmount === 0 ? 'paid' : 'partial';
    await payment.save();
  } else {
    payment = await Payment.create({
      orderId,
      customerId,
      totalAmount: order.totalAmount,
      paidAmount: newPaidAmount,
      unpaidAmount,
      status: unpaidAmount === 0 ? 'paid' : 'partial',
    });
  }

  return { order, payment };
};

// -------------------------------------
// Update an existing payment manually
// -------------------------------------
export const updatePaymentById = async (id, data) => {
  const payment = await Payment.findById(id);
  if (!payment) throw new Error("Payment not found");

  // Merge updates safely
  Object.assign(payment, data);

  // 🔹 Force correct status logic
  const today = new Date();
  if (payment.unpaidAmount <= 0) {
    payment.status = "paid";
    payment.unpaidAmount = 0;
  } else if (payment.unpaidAmount > 0 && payment.dueDate && payment.dueDate < today) {
    payment.status = "overdue";
  } else if (payment.unpaidAmount < payment.totalAmount) {
    payment.status = "partial";
  } else {
    payment.status = "pending";
  }

  await payment.save();

  // 🔹 Sync related order (critical)
  if (payment.orderId) {
    await Order.findByIdAndUpdate(
      payment.orderId,
      {
        paidAmount: payment.paidAmount,
        status: payment.unpaidAmount <= 0 ? "completed" : "pending",
      },
      { new: true }
    );
  }

  return payment;
};
// -------------------------------------
// Update payment due date
// -------------------------------------
export const updatePaymentDueDate = async (paymentId, dueDate) => {
  if (!dueDate) throw new Error('Due date is required');

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');

  payment.dueDate = new Date(dueDate);

  // Automatically flag overdue if unpaid and past dueDate
  const today = new Date();
  if (payment.unpaidAmount > 0 && payment.dueDate < today) {
    payment.status = 'overdue';
  } else if (payment.unpaidAmount === 0) {
    payment.status = 'paid';
  } else if (payment.unpaidAmount < payment.totalAmount) {
    payment.status = 'partial';
  } else {
    payment.status = 'pending';
  }

  await payment.save();
  return payment;
};

// -------------------------------------
// Fetch all payments with populated data
// -------------------------------------
export const getAllPayments = async () => {
  const today = new Date();

  const payments = await Payment.find()
    .populate('orderId', 'orderId totalAmount paidAmount status')
    .populate('customerId', 'name email')
    .lean();

  // Add overdue flag for frontend
  return payments.map(p => ({
    ...p,
    isOverdue: p.unpaidAmount > 0 && p.dueDate && new Date(p.dueDate) < today,
  }));
};

// -------------------------------------
// Fetch a single payment by _id
// -------------------------------------
export const getPaymentById = async (id) => {
  return Payment.findById(id)
    .populate('orderId', 'orderId totalAmount paidAmount status')
    .populate('customerId', 'name email')
    .lean();
};

// -------------------------------------
// Fetch a single payment by orderId
// -------------------------------------
export const getPaymentByOrderId = async (orderId) => {
  return Payment.findOne({ orderId })
    .populate('orderId', 'orderId totalAmount paidAmount status')
    .populate('customerId', 'name email')
    .lean();
};
