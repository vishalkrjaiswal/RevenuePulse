import * as paymentService from '../services/paymentService.js';

// Create or update a payment-
export const createOrUpdatePayment = async (req, res) => {
  try {
    const { order, payment } = await paymentService.createOrUpdatePayment(req.body);
    res.status(201).json({ order, payment });
  } catch (err) {
    console.error('Payment creation/update failed:', err);
    res.status(500).json({ message: err.message || 'Failed to create/update payment' });
  }
};
// Update an existing payment manually-
export const updatePaymentById = async (req, res) => {
  try {
    const payment = await paymentService.updatePaymentById(req.params.id, req.body);
    res.json(payment);
  } catch (err) {
    console.error('Payment update failed:', err);
    res.status(500).json({ message: err.message || 'Failed to update payment' });
  }
};
// Update payment due date-
export const updatePaymentDueDate = async (req, res) => {
  const { id } = req.params;
  const { dueDate } = req.body;

  try {
    const payment = await paymentService.updatePaymentDueDate(id, dueDate);
    res.json(payment);
  } catch (err) {
    console.error('Updating due date failed:', err);
    if (err.message === 'Payment not found') {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === 'Due date is required') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || 'Failed to update due date' });
  }
};
// Get all payments-
export const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (err) {
    console.error('Fetching payments failed:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch payments' });
  }
};
// Get payment by Mongo _id-
export const getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    console.error('Fetching payment failed:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch payment' });
  }
};
// Get payment by orderId-
export const getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentByOrderId(req.params.orderId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    console.error('Fetching payment by orderId failed:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch payment by orderId' });
  }
};
