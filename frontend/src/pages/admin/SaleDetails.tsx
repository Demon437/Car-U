import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import AddPaymentModal from "@/pages/admin/AddPaymentModal";


const WHATSAPP_NUMBER = "9301942456";

const openWhatsAppWithInvoice = ({
  buyerName,
  invoiceUrl,
  label,
}) => {
  const msg = `Hi ${buyerName},

Your ${label} is ready ✅

Invoice:
${invoiceUrl}

Thank you 🙏
United Motors`;

  const waUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    msg
  )}`;

  window.open(waUrl, "_blank");
};


const SaleDetails = () => {
  const { saleId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    api
      .get(`/admin/sales/${saleId}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [saleId]);

  if (loading) return <div className="p-6 text-center">Loading…</div>;
  if (!data) return null;

  const { sale, car, payments = [] } = data;

  const loanPaid = payments
    .filter((p) => p.paymentType === "LOAN")
    .reduce((s, p) => s + p.amount, 0);

  const normalPaid = payments
    .filter((p) => p.paymentType !== "LOAN")
    .reduce((s, p) => s + p.amount, 0);

  const percent = Math.round(
    (sale.paymentSummary.paidAmount /
      sale.paymentSummary.totalAmount) *
    100
  );

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-xl font-semibold text-center sm:text-left">
        Sale Details
      </h1>

      {/* ================= AMOUNT SUMMARY ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500">Total Vehicle Price</p>
          <p className="text-2xl font-bold">
            ₹{sale.paymentSummary.totalAmount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500">Amount Received</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{sale.paymentSummary.paidAmount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500">Remaining</p>
          <p className="text-2xl font-bold text-red-600">
            ₹{sale.paymentSummary.remainingAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ================= STATUS ================= */}
      <div className="bg-white rounded-xl p-4 border space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Status:
            <span className="ml-1 font-semibold">
              {sale.paymentSummary.status}
            </span>
          </p>
          <p className="text-sm text-gray-500">{percent}%</p>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-blue-600 rounded transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* ================= PAYMENT BREAKUP ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500 mb-1">
            Cash / UPI / Bank
          </p>
          <p className="text-xl font-bold text-blue-600">
            ₹{normalPaid.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500 mb-1">
            Loan Disbursed
          </p>
          <p className="text-xl font-bold text-purple-600">
            ₹{loanPaid.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ================= CAR & BUYER ================= */}
      <div className="bg-white rounded-xl p-4 border space-y-1 text-sm">
        <p>
          <b>Car:</b> {car.brand} {car.variant || ""}
        </p>
        <p>
          <b>Buyer:</b> {car.buyer?.name} ({car.buyer?.phone})
        </p>
        <p>
          <b>Sold On:</b>{" "}
          {new Date(car.soldAt).toLocaleDateString()}
        </p>
        <p className="text-blue-700 font-medium">
          Payment Type: {car.payment?.type}
        </p>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex flex-col sm:flex-row gap-3">
        {sale.paymentSummary.status !== "PAID" && (
          <Button
            className="bg-green-600 w-full sm:w-auto"
            onClick={() => setShowPaymentModal(true)}
          >
            + Add Payment
          </Button>
        )}

        <div className="flex gap-2 flex-wrap">
          {/* DOWNLOAD FINAL INVOICE */}
          <Button
            variant="outline"
            disabled={sale.paymentSummary.status !== "PAID"}
            onClick={() =>
              window.open(
                `/admin/sales/${sale._id}/final-invoice`,
                "_blank"
              )
            }
          >
            Download Final Invoice
          </Button>

          {/* WHATSAPP FINAL INVOICE */}
          <Button
            variant="outline"
            disabled={sale.paymentSummary.status !== "PAID"}
            onClick={() =>
              openWhatsAppWithInvoice({
                buyerName: car.buyer?.name,
                label: "final invoice",
                invoiceUrl: `${window.location.origin}/admin/sales/${sale._id}/final-invoice`,
              })
            }
          >
            WhatsApp Final Invoice
          </Button>

        </div>

      </div>

      {/* ================= PAYMENT TIMELINE ================= */}
      <div className="bg-white rounded-xl p-4 border">
        <h2 className="font-semibold mb-3">Payment Timeline</h2>

        {payments.map((p) => (
          <div
            key={p._id}
            className="flex justify-between items-center py-3 border-b last:border-none"
          >
            <div>
              <p className="font-semibold">
                ₹{p.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {p.paymentType} •{" "}
                {new Date(p.invoiceDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
              {/* OPEN INVOICE */}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  window.open(
                    `/admin/payments/${p._id}/invoice`,
                    "_blank"
                  )
                }
              >
                Invoice
              </Button>

              {/* WHATSAPP PAYMENT RECEIPT */}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  openWhatsAppWithInvoice({
                    buyerName: car.buyer?.name,
                    label: "payment receipt",
                    invoiceUrl: `${window.location.origin}/admin/payments/${p._id}/invoice`,
                  })
                }
              >
                WhatsApp
              </Button>
            </div>
                  
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {showPaymentModal && (
        <AddPaymentModal
          saleId={sale._id}
          remaining={sale.paymentSummary.remainingAmount}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default SaleDetails;
