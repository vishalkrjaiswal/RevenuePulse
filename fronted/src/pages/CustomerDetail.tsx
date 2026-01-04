import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Calendar, ShoppingBag, User, Clock } from "lucide-react";
import api from "../api/apiClient";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";

interface Customer {
  _id: string;
  name?: string;
  email: string;
  createdAt: string;
  totalSpend?: number;
  lastOrderDate?: string;
  totalOrders?: number;
  attributes?: {
    totalSpending?: number;
    [key: string]: any;
  };
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomer() {
      if (!id) {
        console.log("No customer ID provided");
        return;
      }

      try {
        const response = await api.get(`/api/customers/${id}`);
        setCustomer(response.data);
      } catch (error) {
        console.error("Failed to load customer:", error);
        console.error("Attempted URL:", `/customers/${id}`);
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading customer details..." />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Customer Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            The customer you're looking for doesn't exist.
          </p>
          <Button variant="outline" onClick={() => navigate("/customers")}>
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  // Calculate days since last order
  const daysSinceLastOrder = customer.lastOrderDate
    ? Math.floor(
        (Date.now() - new Date(customer.lastOrderDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header
        title={customer.name || "Customer Details"}
        subtitle={customer.email}
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => navigate("/customers")}
        >
          Back to Customers
        </Button>
      </Header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-foreground mt-1">
                  {customer.name || "Not provided"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">{customer.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Join Date
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Spend
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">₹{customer.totalSpend ?? 0}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {customer.totalOrders ?? 0}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Order Date
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {customer.lastOrderDate
                      ? new Date(customer.lastOrderDate).toLocaleDateString()
                      : "No orders yet"}
                  </p>
                </div>
              </div>

              {customer.lastOrderDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Days Since Last Order
                  </label>
                  <p className="text-foreground mt-1">
                    {daysSinceLastOrder} days ago
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Custom Attributes */}
          {customer.attributes &&
            Object.keys(customer.attributes).length > 1 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Custom Attributes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(customer.attributes)
                    .filter(([key]) => key !== "totalSpending")
                    .map(([key, value]) => (
                      <div key={key} className="p-3 bg-surface rounded-lg">
                        <label className="text-sm font-medium text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </label>
                        <p className="text-foreground mt-1">{String(value)}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                size="sm"
                icon={ShoppingBag}
                onClick={() =>
                  navigate(`/orders/new?customerId=${customer._id}`)
                }
                className="w-full justify-start"
              >
                Create Order
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/orders?customerId=${customer._id}`)}
                className="w-full justify-start"
              >
                View Orders
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/campaigns/new?customerId=${customer._id}`)
                }
                className="w-full justify-start"
              >
                Create Campaign
              </Button>
            </div>
          </div>

          {/* Customer Avatar */}
          <div className="glass-card p-6 text-center">
            <div className="w-24 h-24 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {(customer.name || customer.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <h4 className="font-semibold text-foreground">
              {customer.name || "Customer"}
            </h4>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
