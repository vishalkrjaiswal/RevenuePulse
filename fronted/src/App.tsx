import { Routes, Route, useLocation, HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import context
import { AuthProvider } from "./contexts/AuthContext";

// Import components
import Sidebar from "./components/Sidebar";

// Import pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import CreateCustomer from "./pages/CreateCustomer";
import Orders from "./pages/Orders";
import ProductManagement from "./pages/ProductManagement";
import PaymentListPage from "./pages/PaymentListPage";
import PaymentPage from "./pages/PaymentPage";
import OrderDetail from "./pages/OrderDetail";
import CreateOrder from "./pages/CreateOrder";
import Segments from "./pages/Segments";
import CreateSegment from "./pages/CreateSegment";
import SegmentDetail from "./pages/SegmentDetail";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetail from "./pages/CampaignDetail";
import CommunicationLogs from "./pages/CommunicationLogs";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/Forgot";

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  const authPages = ["/login", "/signup", "/forgot"];
  const isAuthPage = authPages.includes(location.pathname);

  // Only render auth page without sidebar/layout
  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
        </Routes>
      </div>
    );
  }

  // Main app with sidebar + protected pages
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-72">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/new" element={<CreateCustomer />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/payments" element={<PaymentListPage />} />
          <Route path="/payments/:id" element={<PaymentPage />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/new" element={<CreateOrder />} />
          <Route path="/segments" element={<Segments />} />
          <Route path="/segments/new" element={<CreateSegment />} />
          <Route path="/segments/:id" element={<SegmentDetail />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/new" element={<CreateCampaign />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/logs" element={<CommunicationLogs />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
