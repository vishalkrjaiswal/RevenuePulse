import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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

export default function PaymentPage() {
  const { id, orderId } = useParams<{ id?: string; orderId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    async function loadPayment() {
      setLoading(true);
      try {
        let res;
        if (orderId) {
          res = await api.get(`/api/payments/order/${orderId}`);
        } else if (id) {
          res = await api.get(`/api/payments/${id}`);
        } else {
          throw new Error("No payment or order ID provided");
        }
        setPayment(res.data);
        setDueDate(res.data.dueDate ? new Date(res.data.dueDate).toISOString().slice(0, 10) : "");
      } catch (err) {
        console.error(err);
        toast({
          title: "Failed to load payment",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadPayment();
  }, [id, orderId]);

  const handleSendEmail = async () => {
    if (!payment) return;
    try {
      await api.post("/api/communication-logs", {
        customerId: payment.customerId._id,
        orderId: typeof payment.orderId === "string" ? payment.orderId : payment.orderId._id,
        type: "email",
        message: `Reminder: Your payment of ₹${payment.unpaidAmount.toFixed(2)} is pending.`,
      });
      toast({ title: "Email reminder sent!" });
    } catch {
      toast({ title: "Failed to send email", variant: "destructive" });
    }
  };

  const handleSendSMS = async () => {
    if (!payment) return;
    try {
      await api.post("/api/communication-logs", {
        customerId: payment.customerId._id,
        orderId: typeof payment.orderId === "string" ? payment.orderId : payment.orderId._id,
        type: "sms",
        message: `Reminder: Your payment of ₹${payment.unpaidAmount.toFixed(2)} is pending.`,
      });
      toast({ title: "SMS reminder sent!" });
    } catch {
      toast({ title: "Failed to send SMS", variant: "destructive" });
    }
  };

  const handleMarkAsPaid = async () => {
    if (!payment) return;
    setUpdating(true);
    const actualOrderId = typeof payment.orderId === "string" ? payment.orderId : payment.orderId._id;
    if (!actualOrderId) {
      toast({ title: "Invalid order ID", variant: "destructive" });
      setUpdating(false);
      return;
    }
    try {
      await api.put(`/api/orders/${actualOrderId}`, {
        paidAmount: payment.totalAmount,
        status: "completed",
      });
      await api.put(`/api/payments/${payment._id}`, {
        paidAmount: payment.totalAmount,
        unpaidAmount: 0,
        status: "paid",
      });
      const res = await api.get(`/api/payments/${payment._id}`);
      setPayment(res.data);
      toast({ title: "Payment marked as paid!" });
    } catch {
      toast({ title: "Failed to mark payment as paid", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDueDate = async () => {
    if (!payment) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/api/payments/${payment._id}/due-date`, {
        dueDate,
      });
      setPayment(res.data);
      toast({ title: "Due date updated!" });
    } catch {
      toast({ title: "Failed to update due date", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading payment details..." />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-8 text-center text-gray-500">
        Payment not found.
      </div>
    );
  }

  const isPaid = payment.status === "paid" || payment.unpaidAmount === 0;

  return (
    <div className="p-8 space-y-6 animate-fade-in max-w-2xl mx-auto">
      <Header title="Payment Details" subtitle={`Order ID: ${payment._id}`} />

      <div className="glass-card p-6 space-y-4">
        <div>
          <strong>Customer: </strong> {payment.customerId?.name || payment.customerId?.email}
        </div>
        <div>
          <strong>Email: </strong> {payment.customerId?.email}
        </div>
        <div>
          <strong>Total Amount: </strong> ₹{payment.totalAmount.toFixed(2)}
        </div>
        <div>
          <strong>Paid Amount: </strong> ₹{payment.paidAmount.toFixed(2)}
        </div>
        <div>
          <strong>Unpaid Amount: </strong> ₹{payment.unpaidAmount.toFixed(2)}
        </div>
        <div>
          <strong>Status: </strong> {payment.status}
        </div>

        {/* Due Date Input */}
        <div className="flex items-center gap-2">
          <strong>Due Date: </strong>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border px-2 py-1 rounded text-black"
            disabled={updating}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveDueDate}
            disabled={updating || !dueDate}
          >
            Save
          </Button>
        </div>

        <div className="flex gap-4 mt-4 flex-wrap">
          <Button variant="outline" icon={Mail} onClick={handleSendEmail} disabled={updating}>
            Email Reminder
          </Button>
          <Button variant="outline" icon={MessageCircle} onClick={handleSendSMS} disabled={updating}>
            SMS Reminder
          </Button>
          <Button
            variant="gradient"
            icon={Check}
            onClick={handleMarkAsPaid}
            loading={updating}
            disabled={isPaid}
          >
            {isPaid ? "Paid" : "Mark Paid"}
          </Button>
          <Button variant="ghost" onClick={() => navigate("/payments")}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
