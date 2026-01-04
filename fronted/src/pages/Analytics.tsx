import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingBag,Wallet, Brain, Zap } from 'lucide-react';
import api from '../api/apiClient';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { toast } from '@/hooks/use-toast';

interface Customer {
  _id: string;
  name?: string;
  email: string;
  totalSpend?: number;
}

interface Order {
  _id: string;
  customerId?: {
    _id: string;
  };
  totalAmount: number;
  orderDate: string;
}

interface Campaign {
  _id: string;
  status: string;
}

export default function Analytics() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        const [customersRes, ordersRes, campaignsRes] = await Promise.all([
          api.get('/api/customers'),
          api.get('/api/orders'),
          api.get('/api/campaigns')
        ]);
        
        setCustomers(customersRes.data || []);
        setOrders(ordersRes.data || []);
        setCampaigns(campaignsRes.data || []);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalyticsData();
  }, []);

  const runAIAnalytics = async () => {
    setAiLoading(true);
    try {
      const response = await api.post('/ai/analytics', { customers, orders });
      setAiInsights(response.data.insights);
      setAiRecommendations(response.data.recommendations);
      
      toast({
        title: "AI Analysis Complete",
        description: "Generated insights and recommendations for your business.",
      });
    } catch (error) {
      console.error('AI analytics failed:', error);
      toast({
        title: "AI Analysis Failed",
        description: "Unable to generate AI insights at this time.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  // Analytics calculations
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const totalSpending = customers.reduce((sum, customer) => sum + (customer.totalSpend || 0), 0);

  // Customer spending distribution
  const spendingData = customers
    .map(c => ({
      name: c.name || c.email.split('@')[0],
      spending: c.totalSpend || 0
    }))
    .sort((a, b) => b.spending - a.spending)
    .slice(0, 10);

  // Monthly sales trend (sample data)
  const monthlySales:Record<string,number> = {};
  orders.forEach(order => {
    const month = new Date(order.orderDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    monthlySales[month] = (monthlySales[month] || 0) + order.totalAmount;
  });
  
  const monthlyData = Object.entries(monthlySales)
    .map(([month, sales]) => ({ month, sales }))
    .slice(-6);

  // Campaign status distribution
  const campaignStatus = campaigns.reduce((acc, campaign) => {
    acc[campaign.status] = (acc[campaign.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const campaignData = Object.entries(campaignStatus).map(([name, value]) => ({ name, value }));
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))'];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <Header 
        title="Analytics Dashboard" 
        subtitle="Comprehensive insights into your business performance"
      >
        <Button
          variant="gradient"
          icon={Brain}
          onClick={runAIAnalytics}
          loading={aiLoading}
        >
          AI Analysis
        </Button>
      </Header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={customers.length.toLocaleString()}
          icon={Users}
          color="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value={orders.length.toLocaleString()}
          icon={ShoppingBag}
          color="secondary"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={Wallet}
          color="success"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${avgOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          color="accent"
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Spending */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Customer Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                hide
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="spending" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Sales Trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--secondary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--secondary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Status */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Campaign Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={campaignData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {campaignData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Key Insights
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-medium text-foreground mb-1">Revenue Growth</h4>
              <p className="text-sm text-muted-foreground">
                Total revenue of ₹{totalRevenue.toLocaleString()} across {orders.length} orders
              </p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
              <h4 className="font-medium text-foreground mb-1">Customer Base</h4>
              <p className="text-sm text-muted-foreground">
                {customers.length} total customers with avg spending of ₹{(totalSpending / customers.length || 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
              <h4 className="font-medium text-foreground mb-1">Campaign Performance</h4>
              <p className="text-sm text-muted-foreground">
                {campaigns.length} total campaigns across different stages
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {(aiInsights || aiRecommendations) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aiInsights && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Insights
              </h3>
              <div className="p-4 bg-surface rounded-lg border border-border">
                <p className="text-foreground whitespace-pre-wrap">{aiInsights}</p>
              </div>
            </div>
          )}
          
          {aiRecommendations && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Recommendations
              </h3>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-foreground whitespace-pre-wrap">{aiRecommendations}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}