import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ["in-stock", "low-stock", "out-of-stock"],
      default: "in-stock",
    },
  },
  { timestamps: true }
);

// Automatically update stock status
productSchema.pre("save", function (next) {
  if (this.stock <= 0) this.status = "out-of-stock";
  else if (this.stock <= this.lowStockThreshold) this.status = "low-stock";
  else this.status = "in-stock";
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
