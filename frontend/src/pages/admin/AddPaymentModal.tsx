import { useState } from "react";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const AddPaymentModal = ({
  saleId,
  purchaseId,
  remaining,
  sale,
  payments = [],
  onClose,
  onSuccess,
}: any) => {
  const isPurchaseMode = !!purchaseId;
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Which bucket should be reduced
  const [adjustAgainst, setAdjustAgainst] =
    useState("CASH");

  // How payment was actually received
  const [paymentMode, setPaymentMode] =
    useState("CASH");

  const [transactionId, setTransactionId] =
    useState("");

  const [financeCompany, setFinanceCompany] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const id = saleId || purchaseId;

  // Flags based on actual payment mode
  const isDigitalPayment =
    paymentMode === "UPI" ||
    paymentMode === "BANK";

  const isLoanPayment =
    paymentMode === "LOAN";

  const isBlackPayment =
    paymentMode === "BLACK";

  // Remaining amount for selected bucket
  // Remaining amount for selected bucket
  const selectedTypeRemaining = (() => {
    // PURCHASE MODE
    if (isPurchaseMode) {
      return Number(remaining || 0);
    }

    const payment = sale?.payment || {};

    // ================= WHITE MONEY =================
    const whitePlannedAmount =
      Number(payment.cashAmount || 0) +
      Number(payment.upiAmount || 0) +
      Number(payment.bankAmount || 0);

    const whiteReceived = (payments || [])
      .filter((p: any) =>
        ["CASH", "UPI", "BANK"].includes(
          p.adjustAgainst || p.paymentType
        )
      )
      .reduce(
        (sum: number, p: any) =>
          sum + Number(p.amount || 0),
        0
      );

    // ================= LOAN =================
    const loanPlannedAmount = Number(
      payment.loanAmount || 0
    );

    const loanReceived = (payments || [])
      .filter(
        (p: any) =>
          (p.adjustAgainst || p.paymentType) ===
          "LOAN"
      )
      .reduce(
        (sum: number, p: any) =>
          sum + Number(p.amount || 0),
        0
      );

    // ================= UNRECORDED CASH =================
    const blackPlannedAmount = Number(
      payment.blackAmount || 0
    );

    const blackReceived = (payments || [])
      .filter(
        (p: any) =>
          (p.adjustAgainst || p.paymentType) ===
          "BLACK"
      )
      .reduce(
        (sum: number, p: any) =>
          sum + Number(p.amount || 0),
        0
      );

    if (
      ["CASH", "UPI", "BANK"].includes(
        adjustAgainst
      )
    ) {
      return Math.max(
        0,
        whitePlannedAmount - whiteReceived
      );
    }

    if (adjustAgainst === "LOAN") {
      return Math.max(
        0,
        loanPlannedAmount - loanReceived
      );
    }

    if (adjustAgainst === "BLACK") {
      return Math.max(
        0,
        blackPlannedAmount - blackReceived
      );
    }

    return Number(remaining || 0);
  })();

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setError("");

    if (!id) {
      setError("Payment ID missing");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Enter valid amount");
      return;
    }

    if (
      Number(amount) >
      selectedTypeRemaining
    ) {
      setError(
        `Amount exceeds remaining balance for ${adjustAgainst}`
      );
      return;
    }

    if (
      isLoanPayment &&
      !financeCompany.trim()
    ) {
      setError(
        "Finance company is required for loan payments"
      );
      return;
    }

    try {
      setLoading(true);

      const endpoint = saleId
        ? `/admin/sales/${id}/payments`
        : `/admin/purchase-payments/${id}`;

      await api.post(endpoint, {
        amount: Number(amount),

        // For purchase, use actual payment mode
        paymentType: isPurchaseMode
          ? paymentMode
          : adjustAgainst,

        paymentMode,

        // Only for sales
        adjustAgainst: isPurchaseMode
          ? undefined
          : adjustAgainst,

        transactionId,
        financeCompany,
        note,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to add payment"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = (value: string) => {
    const labels: Record<string, string> = {
      CASH: "Cash",
      UPI: "UPI",
      BANK: "Bank Transfer",
      LOAN: "Loan",
      BLACK: "Unrecorded Cash",
    };

    return labels[value] || value;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-5">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Add Payment
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* AMOUNT */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="Enter amount"
              className="w-full border rounded-lg px-3 py-2"
            />

            {/* Current Remaining Balance for Selected Bucket */}
            <p className="text-xs text-gray-500 mt-1">
              Remaining for{" "}
              {isPurchaseMode
                ? "Seller Payment"
                : ["CASH", "UPI", "BANK"].includes(
                  adjustAgainst
                )
                  ? "Recorded Payment"
                  : formatLabel(adjustAgainst)}
              : ₹
              {selectedTypeRemaining.toLocaleString()}
            </p>

            {/* Optional Preview After Entering Amount */}
            {Number(amount || 0) > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                Remaining after this payment: ₹
                {Math.max(
                  0,
                  selectedTypeRemaining -
                  Number(amount || 0)
                ).toLocaleString()}
              </p>
            )}
          </div>

          {/* ADJUST AGAINST */}
          {!isPurchaseMode && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Adjust Against
              </label>

              <select
                value={adjustAgainst}
                onChange={(e) =>
                  setAdjustAgainst(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="CASH">
                  Cash
                </option>
                <option value="UPI">
                  UPI
                </option>
                <option value="BANK">
                  Bank Transfer
                </option>
                <option value="LOAN">
                  Loan
                </option>
                <option value="BLACK">
                  Unrecorded Cash
                </option>
              </select>
            </div>
          )}

          {/* PAYMENT MODE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Mode
            </label>

            <select
              value={paymentMode}
              onChange={(e) => {
                setPaymentMode(
                  e.target.value
                );
                setTransactionId("");
                setFinanceCompany("");
              }}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="CASH">
                Cash
              </option>
              <option value="UPI">
                UPI
              </option>
              <option value="BANK">
                Bank Transfer
              </option>
              <option value="LOAN">
                Loan
              </option>
              <option value="BLACK">
                Unrecorded Cash
              </option>
            </select>
          </div>

          {/* TRANSACTION ID */}
          {isDigitalPayment && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Transaction ID / Reference No.
              </label>

              <input
                type="text"
                value={transactionId}
                onChange={(e) =>
                  setTransactionId(
                    e.target.value
                  )
                }
                placeholder="Enter transaction ID"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}

          {/* FINANCE COMPANY */}
          {isLoanPayment && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Finance Company
              </label>

              <input
                type="text"
                value={financeCompany}
                onChange={(e) =>
                  setFinanceCompany(
                    e.target.value
                  )
                }
                placeholder="Enter finance company"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}

          {/* BLACK INFO */}
          {isBlackPayment && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
              This payment will be recorded as
              unrecorded cash.
            </div>
          )}

          {/* NOTE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Note
            </label>

            <textarea
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              rows={3}
              placeholder="Optional note"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 w-full"
            >
              {loading
                ? "Saving..."
                : "Add Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;