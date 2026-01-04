import express from 'express';
import * as paymentController from '../controllers/paymentController.js';


const router = express.Router();

// -----------------------------
// Create or update a payment
// -----------------------------
router.post('/', paymentController.createOrUpdatePayment);

router.patch("/:id/due-date", paymentController.updatePaymentDueDate);


// -----------------------------
// Update an existing payment manually
// -----------------------------
router.put('/:id', paymentController.updatePaymentById);
router.patch('/:id', paymentController.updatePaymentById);

// -----------------------------
// Fetch payments
// -----------------------------
router.get('/', paymentController.getAllPayments);
router.get('/order/:orderId', paymentController.getPaymentByOrderId); // ✅ new
router.get('/:id', paymentController.getPaymentById); // still valid for _id

export default router;
