import express from "express";
import * as productController from "../controllers/productController.js";

const router = express.Router();

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.get("/by-name/:name", productController.getProductById);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.patch("/:id/stock", productController.adjustStock);
router.delete("/:id", productController.deleteProduct);
router.get("/alerts/low-stock", productController.lowStockAlerts);

export default router;
