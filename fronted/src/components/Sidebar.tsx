import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Target,
  Megaphone,
  MessageSquare,
  BarChart3,
  ChartNoAxesCombined,
  LogOut,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Product Management", href: "/products", icon: ChartNoAxesCombined },
  { name: "Payments", href: "/payments", icon: IndianRupee },
  { name: "Segments", href: "/segments", icon: Target },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "Communication Logs", href: "/logs", icon: MessageSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-surface border-r border-white/10 backdrop-blur-xl animate-slide-in">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
          <ChartNoAxesCombined className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1
            className="text-xl font-bold gradient-text"
            onClick={() => navigate("/")}
          >
            RevenuePluse
          </h1>
          <p className="text-xs text-muted-foreground">
            “Your smart business buddy.”
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-2  space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute right-4 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
