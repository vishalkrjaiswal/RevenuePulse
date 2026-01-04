import { useEffect, useState } from "react";
import { Users,  ShoppingBag, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import Header from "../components/Header";
import Button from "../components/Button";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  customers: number;
  orders: number;
  campaigns: number;
  revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [customersRes, ordersRes, campaignsRes] = await Promise.all([
          api.get("/api/customers"),
          api.get("/api/orders"),
          api.get("/api/campaigns"),
        ]);

        const customers = customersRes.data || [];
        const orders = ordersRes.data || [];
        const campaigns = campaignsRes.data || [];
        const revenue = orders.reduce(
          (sum: number, order: any) => sum + (order.totalAmount || 0),
          0
        );

        setStats({
          customers: customers.length,
          orders: orders.length,
          campaigns: campaigns.length,
          revenue,
        });

        // Generate sample revenue data for chart
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return {
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            revenue: Math.floor(Math.random() * 5000) + 1000,
            orders: Math.floor(Math.random() * 50) + 10,
          };
        });
        setRevenueData(last30Days);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setStats({ customers: 0, orders: 0, campaigns: 0, revenue: 0 });
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats?.customers.toLocaleString() || "0"}
          icon={Users}
          color="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value={stats?.orders.toLocaleString() || "0"}
          icon={ShoppingBag}
          color="secondary"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Campaigns"
          value={stats?.campaigns.toLocaleString() || "0"}
          icon={Target}
          color="accent"
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.revenue.toLocaleString() || "0"}`}
          icon={TrendingUp}
          color="success"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--surface))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Orders Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--surface))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="hsl(var(--secondary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--secondary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="gradient"
            onClick={() => navigate("/customers/new")}
            className="w-full h-full bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-lg hover:from-success/20 hover:to-success/10 transition-all hover-glow flex flex-col items-start justify-start p-4"
          >
            <Users className="w-6 h-6 text-primary mb-2" />
            <div className="font-medium text-foreground">Add Customer</div>
            <div className="text-sm text-muted-foreground">
              Create new customer record
            </div>
          </Button>
          <Button
            variant="gradient"
            onClick={() => navigate("/orders/new")}
            className="w-full h-full bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-lg hover:from-success/20 hover:to-success/10 transition-all hover-glow flex flex-col items-start justify-start p-4"
          >
            <ShoppingBag className="w-6 h-6 text-secondary mb-2" />
            <div className="font-medium text-foreground">Create Order</div>
            <div className="text-sm text-muted-foreground">Add new order</div>
          </Button>
          <Button
            variant="gradient"
            onClick={() => navigate("/Segments/new")}
            className="w-full h-full bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-lg hover:from-success/20 hover:to-success/10 transition-all hover-glow flex flex-col items-start justify-start p-4"
          >
            <Target className="w-6 h-6 text-accent mb-2" />
            <div className="font-medium text-foreground">Create Segment</div>
            <div className="text-sm text-muted-foreground">
              Define customer segment
            </div>
          </Button>

          <Button
            variant="gradient"
            onClick={() => navigate("/Campaigns/new")}
            className="w-full h-full bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-lg hover:from-success/20 hover:to-success/10 transition-all hover-glow flex flex-col items-start justify-start p-4"
          >
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <div className="font-medium text-foreground">Launch Campaign</div>
            <div className="text-sm text-muted-foreground">
              Start new campaign
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
