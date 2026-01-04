import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar,  Package, IndianRupee } from 'lucide-react';
import api from '../api/apiClient';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

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

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await api.get('/api/orders');
        setOrders(response.data || []);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const columns = [
    {
      key: 'orderId',
      label: 'Order ID',
      render: (value: string, row: Order) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm font-medium">
            {value || row._id.slice(-8)}
          </span>
        </div>
      )
    },
    {
      key: 'customerId',
      label: 'Customer',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {(value?.name || value?.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-foreground">
              {value?.name || 'Unknown Customer'}
            </div>
            <div className="text-sm text-muted-foreground">{value?.email || 'No email'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (value: number) => (
        <div className="flex items-center gap-1 text-green-400">
          <IndianRupee className="w-4 h-4" />
          <span className="font-semibold mb-1">{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      render: (value: any[]) => (
        <span className="text-muted-foreground">
          {value?.length || 0} item{(value?.length || 0) !== 1 ? 's' : ''}
        </span>
      )
    },
    {
      key: 'orderDate',
      label: 'Order Date',
      render: (value: string) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  const handleRowClick = (order: Order) => {
    navigate(`/orders/${order._id}`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header 
        title="Orders" 
        subtitle={`Manage your ${orders.length} order${orders.length !== 1 ? 's' : ''}`}
      >
        <Button
          variant="gradient"
          icon={Plus}
          onClick={() => navigate('/orders/new')}
        >
          Create Order
        </Button>
      </Header>

      <DataTable
        columns={columns}
        data={orders}
        onRowClick={handleRowClick}
        loading={loading}
      />
    </div>
  );
} 