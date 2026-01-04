import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";

// CREATE ORDERS (single or multiple)

export const createOrders = async (payload) => {
  if (Array.isArray(payload)) {
    const results = [];
    for (const o of payload) {
      const order = await _createSingleOrder(o);
      results.push(order);
    }
    return results;
  } else {
    return _createSingleOrder(payload);
  }
};

// CREATE SINGLE ORDER

const _createSingleOrder = async (o) => {
  // --- 1️⃣ Validate customer ---
  const customer = await Customer.findById(o.customerId);
  if (!customer) throw new Error("Customer not found");

  // --- 2️⃣ Validate items ---
  if (!Array.isArray(o.items) || o.items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  // --- 3️⃣ Check product stock and calculate total ---
  let total = 0;
  for (const item of o.items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    // Ensure enough stock
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`
      );
    }

    // Reduce stock
    product.stock -= item.quantity;

    // Automatically update status based on stock
    if (product.stock <= 0) product.status = "out-of-stock";
    else if (product.stock <= product.lowStockThreshold)
      product.status = "low-stock";
    else product.status = "in-stock";

    await product.save();

    // Add to total
    total += (item.price || 0) * (item.quantity || 0);
  }
  const paidAmount = o.paidAmount || 0;
  const unpaidAmount = total - paidAmount;

  // --- 4️⃣ Create order ---
  const order = new Order({
    customerId: o.customerId,
    items: o.items,
    totalAmount: total,
    paidAmount: paidAmount,
    orderDate: o.orderDate || Date.now(),
    status: paidAmount >= total ? "completed" : "pending",
  });

  await order.save();

  // --- 5️⃣ Update customer's total spend ---
  await Customer.findByIdAndUpdate(o.customerId, {
    $set: { lastOrderDate: order.orderDate },
    $inc: { totalOrders: 1, totalSpend: order.totalAmount },
  });

  // --- 6️⃣ Create Payment record ---
  const paymentStatus =
    paidAmount === 0 ? "pending" : paidAmount < total ? "partial" : "paid";

  await Payment.create({
    orderId: order._id,
    customerId: o.customerId,
    totalAmount: total,
    paidAmount: paidAmount,
    unpaidAmount: unpaidAmount,
    status: paymentStatus,
  });

  return order;
};

// GET ORDER BY ID

export const getOrderById = async (id) => {
  return Order.findById(id)
    .populate("customerId", "name email customerId")
    .lean();
};

// UPDATE ORDER BY ID

// services/orderService.js

export const updateOrderById = async (id, updateData) => {
  // Mongoose expects id as string for findByIdAndUpdate
  if (typeof id !== "string") {
    throw new Error("Order ID must be a string");
  }

  const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

  // Sync payment record if paidAmount changed
  if (updateData.paidAmount !== undefined) {
    const payment = await Payment.findOne({ orderId: id });
    if (payment) {
      payment.paidAmount = updateData.paidAmount;
      payment.unpaidAmount = order.totalAmount - updateData.paidAmount;
      payment.status = payment.unpaidAmount <= 0 ? "paid" : "partial";
      await payment.save();
    }
  }

  return order;
};

// GET ALL ORDERS (with optional filter)

export const findByFilter = async (filter = {}) => {
  return Order.find(filter)
    .populate("customerId", "name email customerId")
    .lean();
};

export const createOrderService = async (ordersData) => {
  let createdOrders = [];

  // Handle batch or single order
  const ordersArray = Array.isArray(ordersData) ? ordersData : [ordersData];

  for (const orderData of ordersArray) {
    const { customerId, items, paidAmount, orderDate } = orderData;

    // 1️⃣ Create the order
    const newOrder = await Order.create({
      customerId,
      items,
      paidAmount: paidAmount || 0,
      orderDate: orderDate || new Date(),
    });

    // 2️⃣ Update customer's lastOrderDate and totalOrders
    const totalOrders = await Order.countDocuments({ customerId });
    await Customer.findByIdAndUpdate(customerId, {
      $set: { lastOrderDate: newOrder.orderDate },
      $inc: { totalOrders: 1, totalSpend: newOrder.totalAmount },
    });

    createdOrders.push(newOrder);
  }

  return createdOrders;
};
