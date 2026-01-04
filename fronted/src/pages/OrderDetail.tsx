import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, IndianRupee, User } from 'lucide-react';
import api from '../api/apiClient';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

interface Order {
  _id: string;
  orderId?: string;
  customerId?: {
    _id: string;
    email: string;
    name?: string;
  };
  totalAmount: number;
  orderDate: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;
      
      try {
        const response = await api.get(`/api/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
          <Button variant="outline" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header 
        title={`Order ${order.orderId || order._id.slice(-8)}`} 
        subtitle={`Placed on ${new Date(order.orderDate).toLocaleDateString()}`}
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>
      </Header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order ID</label>
                <p className="text-foreground font-mono mt-1">{order.orderId || order._id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                <div className="flex items-center gap-2 mt-1">
                  <IndianRupee className="w-4 h-4 text-green-400" />
                  <p className="text-green-400 font-semibold text-lg">
                    {order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Items</label>
                <p className="text-foreground font-semibold mt-1">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 bg-surface rounded-lg border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-foreground">{item.productId}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Unit Price</div>
                      <div className="font-semibold text-foreground">₹{item.price}</div>
                      <div className="text-xs text-green-400">
                        Total: ₹{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Info & Actions */}
        <div className="space-y-6">
          {order.customerId && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer
              </h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-white">
                    {(order.customerId.name || order.customerId.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <h4 className="font-semibold text-foreground">
                  {order.customerId.name || 'Customer'}
                </h4>
                <p className="text-sm text-muted-foreground">{order.customerId.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/customers/${order.customerId?._id}`)}
                  className="mt-3"
                >
                  View Customer
                </Button>
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/orders/new')}
                className="w-full justify-start"
              >
                Create New Order
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/orders')}
                className="w-full justify-start"
              >
                View All Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}