// backend/src/routes/orderRoutes.js
import express from "express";
import Joi from "joi";
import validationMiddleware from "../middlewares/validationMiddleware.js";
import * as orderController from "../controllers/orderController.js";

const router = express.Router();

// --------------------------
// Schema Definitions
// --------------------------
const itemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().min(0).required(),
});

const orderSchema = Joi.object({
  customerId: Joi.string().required(),
  items: Joi.array().items(itemSchema).min(1).required(),
  paidAmount: Joi.number().min(0).optional(), // optional field for paid amount
  orderDate: Joi.date().optional(),
});

const batchSchema = Joi.array().items(orderSchema).min(1);

// --------------------------
// Routes
// --------------------------

// Create a single order or batch orders
router.post(
  "/",
  validationMiddleware([orderSchema, batchSchema]),
  orderController.createOrder
);

// Get a single order by ID
router.get("/:id", orderController.getOrderById);

// Get all orders
router.get("/", orderController.getAllOrders);

// Update an order by ID
router.put("/:id", orderController.updateOrderById);

export default router;
