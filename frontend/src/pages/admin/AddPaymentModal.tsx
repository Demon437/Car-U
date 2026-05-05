import { useState } from "react";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const AddPaymentModal = ({ saleId, remaining, onClose, onSuccess }: any) => {
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("CASH");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (!amount || Number(amount) <= 0) {
      setError("Enter valid amount");
      return;
    }

    if (Number(amount) > remaining) {
      setError("Amount exceeds remaining balance");
      return;
    }

    try {
      setLoading(true);

      await api.post(`/admin/sales/${saleId}/payments`, {
        amount: Number(amount),
        paymentType,
        note,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Add Payment</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500">
              Remaining: ₹{remaining.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="text-sm">Payment Type</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="BANK">Bank</option>
              <option value="LOAN">Loan</option>
            </select>
          </div>

          <div>
            <label className="text-sm">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Optional"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600">
              {loading ? "Saving..." : "Add Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;
