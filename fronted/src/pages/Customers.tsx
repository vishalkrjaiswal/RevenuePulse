import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Mail, Calendar } from "lucide-react";
import api from "../api/apiClient";
import Header from "../components/Header";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";

interface Customer {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCustomers() {
      try {
        const response = await api.get("/api/customers");
        setCustomers(response.data || []);
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  const columns = [
    {
      key: "name",
      label: "Customer Name",
      render: (value: string, row: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {(row.name || row.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-foreground">
              {value || "Unnamed Customer"}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone Number",
      render: (value: string | undefined) => (
        <div className="text-sm text-muted-foreground">
          {value ? `📞 ${value}` : "N/A"}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value: string) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ),
    },
  ];

  const handleRowClick = (customer: Customer) => {
    if (customer && customer._id) {
      console.log("Navigating to customer:", customer._id);
      navigate(`/customers/${customer._id}`);
    } else {
      console.error("Invalid customer object for navigation:", customer);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading customers..." />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header
        title="Customers"
        subtitle={`Manage your ${customers.length} customer${
          customers.length !== 1 ? "s" : ""
        }`}
      >
        <Button
          variant="gradient"
          icon={Plus}
          onClick={() => navigate("/customers/new")}
        >
          Add Customer
        </Button>
      </Header>

      <DataTable
        columns={columns}
        data={customers}
        onRowClick={handleRowClick}
        loading={loading}
      />
    </div>
  );
}
