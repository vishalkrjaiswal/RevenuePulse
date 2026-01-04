import Product from "../models/Product.js";

/** Create a new product */
export const createProduct = async (data) => {
  const product = new Product(data);
  return await product.save();
};

/** Get all products */
export const getAllProducts = async () => {
  return await Product.find().sort({ createdAt: -1 });
};

/** Get product by ID */
export const getProductById = async (id) => {
  return await Product.findById(id);
};

/** Get product by name */
export const getProductByName = async (name) => {
  return await Product.findOne({ name: { $regex: new RegExp(name, "i") } });
};

/** Update product details */
export const updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

/** Adjust stock manually */
export const adjustStock = async (id, quantityChange) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  product.stock += quantityChange;
  if (product.stock < 0) product.stock = 0;

  await product.save();
  return product;
};

/** Delete a product */
export const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

/** Get low stock alerts */
export const getLowStockAlerts = async () => {
  return await Product.find({
    stock: { $lte: "$lowStockThreshold" },
  });
};

/** Reduce stock after order */
export const reduceStock = async (productName, quantity) => {
  const product = await Product.findOne({ name: productName });
  if (!product) throw new Error(`Product "${productName}" not found`);

  if (product.stock < quantity) {
    throw new Error(
      `Insufficient stock for ${product.name}. Available: ${product.stock}`
    );
  }

  product.stock -= quantity;
  await product.save();

  return product;
};
