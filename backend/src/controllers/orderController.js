import * as orderService from "../services/orderService.js";

// CREATE ORDER
export const createOrder = async (req, res, next) => {
  try {
    const payload = req.body; // Expect full order data: customerId, items, paidAmount, etc.
    const result = await orderService.createOrders(payload);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// GET ORDER BY ID
export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// UPDATE ORDER BY ID
export const updateOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    if (typeof orderId !== "string") {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const updateData = req.body;

    const updatedOrder = await orderService.updateOrderById(
      orderId,
      updateData
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error("Update order failed:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};

// GET ALL ORDERS
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.findByFilter({});
    res.json(orders);
  } catch (err) {
    next(err);
  }
};
