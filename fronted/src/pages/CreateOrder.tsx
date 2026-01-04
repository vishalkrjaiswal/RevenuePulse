import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Package,
  Plus,
  Trash2,
  DollarSign,
} from "lucide-react";
import api from "../api/apiClient";
import Header from "../components/Header";
import Button from "../components/Button";
import { toast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface Customer {
  _id: string;
  name?: string;
  email: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export default function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    customerId: "",
    orderId: "",
    items: [{ productId: "", quantity: 1, price: 0 }] as OrderItem[],
    paidAmount: 0,
  });

  // Fetch products
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get("/api/products");
        setProducts(response.data || []);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const response = await api.get("/api/customers");
        setCustomers(response.data || []);
      } catch (error) {
        console.error("Failed to load customers:", error);
      }
    }
    loadCustomers();
  }, []);

  const totalAmount = formData.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation: customer selected
    if (!formData.customerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validation: all items complete and valid
    const incompleteItem = formData.items.find(
      (item) =>
        !item.productId ||
        typeof item.productId !== "string" ||
        item.productId.trim() === "" ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0 ||
        typeof item.price !== "number" ||
        item.price < 0
    );
    if (incompleteItem) {
      console.warn("Invalid order item detected:", incompleteItem);
      toast({
        title: "Incomplete or invalid item",
        description:
          "Each item must have a product ID, quantity > 0, and price >= 0.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const orderData: any = {
        customerId: formData.customerId,
        items: formData.items.filter(
          (item) => item.productId && item.quantity > 0
        ),
        paidAmount: formData.paidAmount, // ✅ paid amount included
        orderDate: new Date().toISOString(),
      };
      if (formData.orderId && formData.orderId.trim() !== "") {
        orderData.orderId = formData.orderId;
      }

      if (orderData.items.length === 0) {
        toast({
          title: "No items added",
          description: "Please add at least one item to the order.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await api.post("/api/orders", orderData);

      toast({
        title: "Order created successfully",
        description: `Order ${
          orderData.orderId || response.data.orderId
        } created.`,
      });

      // if unpaid amount remains → redirect to payment page
      const unpaidAmount = totalAmount - formData.paidAmount;
      if (unpaidAmount > 0) {
        navigate(`/payments`, {
          state: {
            unpaidAmount,
            customer: customers.find((c) => c._id === formData.customerId),
          },
        });
      } else {
        navigate(`/orders/${response.data._id}`);
      }
    } catch (error: any) {
      console.error("Failed to create order:", error);
      toast({
        title: "Failed to create order",
        description:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header title="Create Order" subtitle="Add a new order to the system">
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </Button>
      </Header>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Information */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Order Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select
                  className="form-input"
                  value={formData.customerId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customerId: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name || customer.email} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Order ID (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Auto-generated if empty"
                  value={formData.orderId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      orderId: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Order Items
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={addItem}
              >
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-surface rounded-lg border border-border"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="form-label">Product Name</label>
                      <select
                        className="form-input"
                        value={item.productId}
                        onChange={(e) => {
                          const selectedProduct = products.find(
                            (p) => p._id === e.target.value
                          );
                          updateItem(index, "productId", e.target.value);
                          updateItem(
                            index,
                            "price",
                            selectedProduct ? selectedProduct.price : 0
                          );
                        }}
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} (₹{product.price.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseInt(e.target.value)
                          )
                        }
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="form-label">Unit Price</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-input"
                        placeholder="0.00"
                        value={item.price === 0 ? "" : item.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateItem(
                            index,
                            "price",
                            value === "" ? 0 : parseFloat(value)
                          );
                        }}
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        Total: ₹{(item.quantity * item.price).toFixed(2)}
                      </div>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group mt-6">
            <label className="form-label flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Paid Amount
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter paid amount"
              value={formData.paidAmount === 0 ? "" : formData.paidAmount}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  paidAmount: value === "" ? 0 : parseFloat(value),
                }));
              }}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Total: ₹{totalAmount.toFixed(2)} | Remaining: ₹
              {(totalAmount - formData.paidAmount).toFixed(2)}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="gradient"
              icon={Save}
              loading={loading}
              disabled={!formData.customerId}
            >
              Create Order
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/orders")}
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
