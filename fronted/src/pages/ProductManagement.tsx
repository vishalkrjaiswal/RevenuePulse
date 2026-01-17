import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Edit,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Box,
} from "lucide-react";
import api from "../api/apiClient";
import Header from "../components/Header";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import { toast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  lowStockThreshold: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get("/api/products");
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const lowStockProducts = products.filter(
    (p) => p.stock <= p.lowStockThreshold
  );
  const totalStockValue = products.reduce(
    (sum, p) => sum + p.stock * p.price,
    0
  );
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

  const handleStockAdjustment = async (
    productId: string,
    adjustment: number,
    reason: string
  ) => {
    try {
      await api.patch(`/api/products/${productId}/stock`, {
        adjustment,
        reason,
      });
      toast({
        title: "Stock Updated",
        description: `Stock adjusted by ${
          adjustment > 0 ? "+" : ""
        }${adjustment}`,
      });
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update stock",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0)
      return { color: "text-red-500", label: "Out of Stock" };
    if (product.stock <= product.lowStockThreshold)
      return { color: "text-yellow-500", label: "Low Stock" };
    return { color: "text-green-500", label: "In Stock" };
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading stock data..." />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header
        title="Stock Management"
        subtitle={`Manage inventory for ${products.length} products`}
      >
        <Button
          variant="gradient"
          icon={Plus}
          onClick={() => setShowAddModal(true)}
        >
          Add Product
        </Button>
      </Header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={products.length.toString()}
          icon={Package}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Items in Stock"
          value={totalItems.toString()}
          icon={Box}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Stock Value"
          value={`₹${totalStockValue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockProducts.length.toString()}
          icon={AlertTriangle}
          trend={{ value: 0, isPositive: false }}
        />
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="glass-card p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Low Stock Alerts
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.map((product) => (
              <div
                key={product._id}
                className="p-4 bg-surface rounded-lg border border-yellow-500/30"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {product.sku}
                    </p>
                  </div>
                  <span className="text-yellow-500 font-bold">
                    {product.stock}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Threshold: {product.lowStockThreshold} units
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Inventory Overview
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Product
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  SKU
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Category
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Stock
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Price
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Value
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const status = getStockStatus(product);
                return (
                  <tr
                    key={product._id}
                    className="border-b border-border hover:bg-surface/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground font-mono">
                      {product.sku}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-semibold ${status.color}`}>
                        {product.stock}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        units
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-foreground">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right text-green-400 font-semibold">
                      ₹{(product.stock * product.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-xs ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => {
                            setEditingProduct(product);
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={TrendingDown}
                          onClick={() => {
                            const adjustment = prompt(
                              "Enter stock adjustment (use negative for reduction):"
                            );
                            if (adjustment) {
                              const reason =
                                prompt("Reason for adjustment:") ||
                                "Manual adjustment";
                              handleStockAdjustment(
                                product._id,
                                parseInt(adjustment),
                                reason
                              );
                            }
                          }}
                        >
                          Adjust
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadProducts();
          }}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}

// Add Product Modal Component
function AddProductModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    stock: 0,
    price: 0,
    lowStockThreshold: 10,
    category: "General",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/products", formData);
      toast({
        title: "Product Added",
        description: `${formData.name} has been added to inventory`,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Add New Product
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input
              type="text"
              className="form-input"
              placeholder="Auto-generated if empty"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Initial Stock *</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Low Stock Alert</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockThreshold: parseInt(e.target.value) || 10,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="gradient"
              loading={loading}
              className="flex-1"
            >
              Add Product
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Product Modal Component
function EditProductModal({
  product,
  onClose,
  onSuccess,
}: {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    stock: product.stock,
    price: product.price,
    lowStockThreshold: product.lowStockThreshold,
    category: product.category,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/api/products/${product._id}`, formData);
      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated`,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Edit Product
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input
              type="text"
              className="form-input"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Low Stock Alert</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockThreshold: parseInt(e.target.value) || 10,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="gradient"
              loading={loading}
              className="flex-1"
            >
              Update Product
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
