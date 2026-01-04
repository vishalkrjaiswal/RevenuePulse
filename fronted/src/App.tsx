import { Routes, Route, useLocation, HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import context
import { AuthProvider } from "./contexts/AuthContext";

// Import components
import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";

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
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
          <Route path="/customers/:id" element={<PrivateRoute><CustomerDetail /></PrivateRoute>} />
          <Route path="/customers/new" element={<PrivateRoute><CreateCustomer /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><ProductManagement /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><PaymentListPage /></PrivateRoute>} />
          <Route path="/payments/:id" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
          <Route path="/orders/new" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />
          <Route path="/segments" element={<PrivateRoute><Segments /></PrivateRoute>} />
          <Route path="/segments/new" element={<PrivateRoute><CreateSegment /></PrivateRoute>} />
          <Route path="/segments/:id" element={<PrivateRoute><SegmentDetail /></PrivateRoute>} />
          <Route path="/campaigns" element={<PrivateRoute><Campaigns /></PrivateRoute>} />
          <Route path="/campaigns/new" element={<PrivateRoute><CreateCampaign /></PrivateRoute>} />
          <Route path="/campaigns/:id" element={<PrivateRoute><CampaignDetail /></PrivateRoute>} />
          <Route path="/logs" element={<PrivateRoute><CommunicationLogs /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="*" element={<PrivateRoute><NotFound /></PrivateRoute>} />
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
