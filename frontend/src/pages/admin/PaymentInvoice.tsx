import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/api";

const formatPaymentLabel = (value: string) => {
  if (["CASH", "UPI", "BANK"].includes(value)) {
    return "Recorded Payment";
  }

  const labels: Record<string, string> = {
    LOAN: "Loan Disbursement",
    BLACK: "Unrecorded Cash",
  };

  return labels[value] || value;
};

const PaymentInvoice = () => {
  const { paymentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/payments/${paymentId}`);
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) fetchInvoice();
  }, [paymentId]);

  if (loading) return <div className="p-6 text-center">Loading invoice…</div>;
  if (!data) return null;

  const { payment, car, sale } = data;

  const totalAmount = sale.paymentSummary.totalAmount;
  const paidTillNowAtThatTime =
    sale.paymentSummary.paidAmount - payment.amount;

  const remainingAfterPayment =
    totalAmount - sale.paymentSummary.paidAmount;

  const status =
    remainingAfterPayment === 0 ? "PAID" : "PARTIAL";

  const paymentLabel =
    payment.paymentType === "LOAN"
      ? "Loan Disbursement Receipt"
      : "Payment Receipt";

  const paymentMode = formatPaymentLabel(
    payment.paymentMode || payment.paymentType
  );

  const paymentBucket = formatPaymentLabel(
    payment.adjustAgainst || payment.paymentType
  );

  return (
    <div
      id="print-invoice"
      className="
        max-w-4xl mx-auto
        p-4 sm:p-8 md:p-10
        bg-white border shadow-sm
        print:border-none print:shadow-none
      "
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            United Motors
          </h1>
          <p className="text-sm text-gray-600">
            Authorized Used Car Dealer
          </p>
          <p className="text-sm text-gray-600">
            Indore, Madhya Pradesh
          </p>
        </div>

        <div className="text-sm sm:text-right">
          <p><b>Invoice No:</b> {payment.invoiceNumber}</p>
          <p>
            <b>Date:</b>{" "}
            {new Date(payment.invoiceDate).toLocaleDateString()}
          </p>
          <p><b>Payment Mode:</b> {paymentMode}</p>
        </div>
      </div>

      <hr className="mb-6" />

      {/* ================= TITLE ================= */}
      <h2 className="text-base sm:text-lg font-semibold mb-6 text-center">
        {paymentLabel}
      </h2>

      {/* ================= BUYER & VEHICLE ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mb-8">
        <div>
          <h3 className="font-semibold mb-2">Bill To</h3>
          <p><b>Name:</b> {car.buyer?.name || "N/A"}</p>
          <p><b>Phone:</b> {car.buyer?.phone || "N/A"}</p>
          <p><b>City:</b> {car.buyer?.city || "N/A"}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Vehicle Details</h3>
          <p>
            <b>Car:</b>{" "}
            {[car.brand, car.variant].filter(Boolean).join(" ") || "—"}
          </p>
          <p><b>Fuel:</b> {car.fuelType || "—"}</p>
          <p className="break-all">
            <b>Registration No:</b>{" "}
            {car.registrationNumber || "—"}
          </p>
        </div>
      </div>

      {/* ================= PAYMENT TABLE ================= */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                Vehicle Payment ({paymentBucket})
              </td>
              <td className="border p-2 text-right font-semibold">
                ₹{payment.amount.toLocaleString()}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="border p-2 text-right font-bold">
                Total Paid (This Receipt)
              </td>
              <td className="border p-2 text-right font-bold">
                ₹{payment.amount.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ================= SALE SNAPSHOT ================= */}
      <div className="bg-gray-50 border rounded-lg p-4 text-sm mb-6">
        <h3 className="font-semibold mb-3">
          Sale Summary (At This Payment)
        </h3>

        <div className="grid grid-cols-2 gap-y-2">
          <p>Total Vehicle Amount</p>
          <p className="text-right">
            ₹{totalAmount.toLocaleString()}
          </p>

          <p>Paid Till Now (Before This)</p>
          <p className="text-right text-green-600">
            ₹{paidTillNowAtThatTime.toLocaleString()}
          </p>

          <p>This Payment</p>
          <p className="text-right">
            ₹{payment.amount.toLocaleString()}
          </p>

          <p>Remaining Balance</p>
          <p className="text-right text-red-600">
            ₹{remainingAfterPayment.toLocaleString()}
          </p>

          <p>Status</p>
          <p className="text-right font-semibold">{status}</p>
        </div>
      </div>

      {/* ================= NOTE ================= */}
      {payment.note && (
        <p className="text-sm mb-6">
          <b>Note:</b> {payment.note}
        </p>
      )}

      {/* ================= FOOTER ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mt-12 text-sm">
        <div>
          <p>This is a system-generated receipt.</p>
          <p>No signature required.</p>
        </div>

        <div className="text-left sm:text-right">
          <p className="font-semibold">
            For United Motors
          </p>
          <div className="mt-10 border-t w-48" />
          <p className="text-xs mt-1">Authorized Signatory</p>
        </div>
      </div>

      {/* ================= PRINT ================= */}
      <div className="mt-8 print:hidden text-center sm:text-left">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default PaymentInvoice;
