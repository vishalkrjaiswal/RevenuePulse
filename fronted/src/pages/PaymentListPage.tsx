import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, MessageCircle, Check } from "lucide-react";
import api from "../api/apiClient";
import Header from "../components/Header";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "@/hooks/use-toast";

interface Customer {
  _id: string;
  name?: string;
  email: string;
}

interface Payment {
  _id: string;
  orderId: string | { _id: string };
  customerId: Customer;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  status: string;
  dueDate?: string;
  createdAt: string;
}

export default function PaymentListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/payments");
      setPayments(res.data);
    } catch (err) {
      toast({
        title: "Error loading payments",
        description: "Could not fetch payment records.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    if (location.state?.refreshPayments) {
      loadPayments();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleMarkAsPaid = async (payment: Payment) => {
    setUpdatingId(payment._id);
    let orderId: string | undefined;
    if (typeof payment.orderId === "string") {
      orderId = payment.orderId;
    } else if (
      payment.orderId &&
      typeof payment.orderId === "object" &&
      "_id" in payment.orderId
    ) {
      orderId = payment.orderId._id;
    }

    if (!orderId) {
      toast({ title: "Invalid order ID", variant: "destructive" });
      setUpdatingId(null);
      return;
    }

    try {
      await api.put(`/api/orders/${orderId}`, {
        paidAmount: payment.totalAmount,
        status: "completed",
      });
      await api.put(`/api/payments/${payment._id}`, {
        paidAmount: payment.totalAmount,
        unpaidAmount: 0,
        status: "paid",
      });
      setPayments((prev) => prev.filter((p) => p._id !== payment._id));
      toast({ title: "Payment marked as paid!" });
    } catch (err) {
      toast({
        title: "Failed to mark payment as paid",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendEmail = async (payment: Payment) => {
    try {
      await api.post("/api/communication-logs", {
        customerId: payment.customerId._id,
        orderId:
          typeof payment.orderId === "string"
            ? payment.orderId
            : (payment.orderId as any)._id,
        type: "email",
        message: `Reminder: Your payment of ₹${payment.unpaidAmount.toFixed(
          2
        )} is pending.`,
      });
      toast({ title: "Email reminder sent!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to send email", variant: "destructive" });
    }
  };

  const handleSendSMS = async (payment: Payment) => {
    try {
      await api.post("/api/communication-logs", {
        customerId: payment.customerId._id,
        orderId:
          typeof payment.orderId === "string"
            ? payment.orderId
            : (payment.orderId as any)._id,
        type: "sms",
        message: `Reminder: Your payment of ₹${payment.unpaidAmount.toFixed(
          2
        )} is pending.`,
      });
      toast({ title: "SMS reminder sent!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to send SMS", variant: "destructive" });
    }
  };

  // Fully updated click handler to navigate to payment detail
  const handleNavigateToPayment = (payment: Payment) => {
    // Use _id of payment for navigation
    navigate(`/payments/${payment._id}`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading payments..." />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        🎉 All payments are settled! No pending dues.
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header
        title="Payment Dashboard"
        subtitle="Manage all pending or partial payments"
      />
      <div className="grid gap-4">
        {payments.map((p) => {
          const isOverdue =
            p.status !== "paid" && p.dueDate && new Date(p.dueDate) < today;
          const isPaid = p.status === "paid";

          return (
            <div
              key={p._id}
              className={`glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 transition-all duration-300 
        ${
          isPaid
            ? "border-green-500 bg-green-50/10 hover:bg-green-100/20"
            : "border-red-500 bg-red-50/10 hover:bg-red-100/20"
        }`}
            >
              {/* Clickable payment info */}
              <div
                className="flex cursor-pointer flex-1 gap-6 sm:flex-row flex-col"
                onClick={() => handleNavigateToPayment(p)}
              >
                {/* Customer Info */}
                <div className="flex-1">
                  <div className="font-semibold">
                    {p.customerId?.name || p.customerId?.email}
                  </div>
                  <div className="text-sm text-gray-400">
                    {p.customerId?.email}
                  </div>
                  <div className="flex gap-6 mt-2">
                    <span className="text-sm text-gray-300">
                      <strong>Total:</strong> ₹{p.totalAmount.toFixed(2)}
                    </span>

                    {/* Show unpaid or paid amount */}
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-md border ${
                        isPaid
                          ? "text-green-500 border-green-500 bg-green-50/10"
                          : "text-red-500 border-red-500 bg-red-50/10"
                      }`}
                    >
                      {isPaid
                        ? `Paid: ₹${p.paidAmount.toFixed(2)}`
                        : `Unpaid: ₹${p.unpaidAmount.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Due date info */}
                <div className="flex-1 mt-1">
                  <span
                    className={`text-sm sm:ml-8 font-medium ${
                      isOverdue
                        ? "text-red-600"
                        : isPaid
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    <strong>Status:</strong> {isPaid ? "Paid" : "Unpaid"}
                  </span>
                  {p.dueDate && (
                    <span
                      className={`block text-sm mt-2 ${
                        isOverdue ? "text-red-600" : "text-gray-400"
                      }`}
                    >
                      <strong>Due:</strong>{" "}
                      {new Date(p.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap flex-none">
                <Button
                  variant="outline"
                  icon={Mail}
                  onClick={() => handleSendEmail(p)}
                  disabled={updatingId === p._id}
                >
                  Email
                </Button>
                <Button
                  variant="outline"
                  icon={MessageCircle}
                  onClick={() => handleSendSMS(p)}
                  disabled={updatingId === p._id}
                >
                  SMS
                </Button>
                <Button
                  variant="gradient"
                  icon={Check}
                  onClick={() => handleMarkAsPaid(p)}
                  loading={updatingId === p._id}
                  disabled={isPaid}
                >
                  {isPaid ? "Paid" : "Mark Paid"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
