import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import AddPaymentModal from "@/pages/admin/AddPaymentModal";


const WHATSAPP_NUMBER = "9301942456";

const openWhatsAppWithInvoice = ({
  buyerName,
  phone,
  label = "invoice",
  invoiceUrl,
}) => {
  if (!phone) {
    alert("Buyer phone number not found");
    return;
  }

  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, "");

  // Convert label to Title Case
  const formattedLabel = label
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");

  // IMPORTANT:
  // Replace localhost URL with your public domain URL.
  // WhatsApp recipients cannot open localhost links.
  const publicInvoiceUrl = invoiceUrl
    .replace(
      "http://localhost:8081",
      "https://unitedmotorsindia.com"
    )
    .replace(
      "http://127.0.0.1:8081",
      "https://unitedmotorsindia.com"
    );

  const message = `🚗 United Cars

Hi ${buyerName || "Customer"},

Your ${formattedLabel} is ready.

Click the link below to view your ${formattedLabel}:

${publicInvoiceUrl}

Thank you for your purchase.`;

  window.open(
    `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
      message
    )}`,
    "_blank"
  );
};

const formatLabel = (value: string) => {
  const labels: Record<string, string> = {
    CASH: "Cash",
    UPI: "UPI",
    BANK: "Bank Transfer",
    LOAN: "Loan",
    BLACK: "Unrecorded Payments",
  };

  return labels[value] || value;
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
  console.log("Fetched Sale Details:", data);

  // ================= ACTUAL RECEIVED AMOUNTS FROM PAYMENT TIMELINE =================

  // White money received (CASH + UPI + BANK)
  const whitePaid = payments
    .filter((p) =>
      ["CASH", "UPI", "BANK"].includes(
        p.adjustAgainst || p.paymentType
      )
    )
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Loan received
  const loanPaid = payments
    .filter(
      (p) =>
        (p.adjustAgainst || p.paymentType) ===
        "LOAN"
    )
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Unrecorded cash received
  const blackPaid = payments
    .filter(
      (p) =>
        (p.adjustAgainst || p.paymentType) ===
        "BLACK"
    )
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WHITE MONEY */}
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500 mb-3 font-medium">
            Recorded Payment
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold">
                ₹
                {(
                  (car.payment?.cashAmount || 0) +
                  (car.payment?.upiAmount || 0) +
                  (car.payment?.bankAmount || 0)
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Received</span>
              <span className="font-semibold text-blue-600">
                ₹
                {whitePaid.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* LOAN DISBURSED */}
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500 mb-3 font-medium">
            Loan Disbursed
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold">
                ₹
                {(car.payment?.loanAmount || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Received</span>
              <span className="font-semibold text-purple-600">
                ₹
                {loanPaid.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* UNRECORDED CASH */}
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-xs text-gray-500 mb-3 font-medium">
            Unrecorded Payment
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold">
                ₹
                {(car.payment?.blackAmount || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Received</span>
              <span className="font-semibold text-orange-600">
                ₹
                {blackPaid.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CAR & BUYER ================= */}
      <div className="bg-white rounded-xl p-4 border space-y-1 text-sm">
        <p>
          <b>Car:</b> {car.car?.model} {car.variant || ""}
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
                phone: car.buyer?.phone,
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
        <h2 className="font-semibold mb-4">
          Payment Timeline
        </h2>

        {payments.length === 0 ? (
          <p className="text-sm text-gray-500">
            No payments recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {console.log("Payments to display:", payments)}
            {payments.map((p) => (
              <div
                key={p._id}
                className="border rounded-xl p-4 bg-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* LEFT SIDE */}
                  <div className="space-y-2 flex-1">
                    {/* Amount */}
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{Number(p.amount || 0).toLocaleString()}
                      </p>

                      <p className="text-xs text-gray-500">
                        {new Date(
                          p.invoiceDate || p.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Payment Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">
                          Adjusted Against:
                        </span>{" "}
                        <span className="font-medium text-blue-700">
                          {formatLabel(
                            p.adjustAgainst || p.paymentType
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500">
                          Payment Mode:
                        </span>{" "}
                        <span className="font-medium text-green-700">
                          {formatLabel(
                            p.paymentMode || p.paymentType
                          )}
                        </span>
                      </div>

                      {p.transactionId && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">
                            Transaction ID:
                          </span>{" "}
                          <span className="font-medium">
                            {p.transactionId}
                          </span>
                        </div>
                      )}

                      {p.financeCompany && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">
                            Finance Company:
                          </span>{" "}
                          <span className="font-medium">
                            {p.financeCompany}
                          </span>
                        </div>
                      )}

                      {p.note && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">
                            Note:
                          </span>{" "}
                          <span className="font-medium">
                            {p.note}
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="text-gray-500">
                          Paid Till Now:
                        </span>{" "}
                        <span className="font-semibold text-green-600">
                          ₹
                          {Number(
                            p.paidTillNow || 0
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500">
                          Remaining:
                        </span>{" "}
                        <span className="font-semibold text-red-600">
                          ₹
                          {Number(
                            p.remainingAfterPayment || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE ACTIONS */}
                  <div className="flex gap-2 flex-wrap md:flex-col">
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

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openWhatsAppWithInvoice({
                          buyerName: car.buyer?.name,
                          phone: car.buyer?.phone,
                          label: "payment receipt",
                          invoiceUrl: `${window.location.origin}/admin/payments/${p._id}/invoice`,
                        })
                      }
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showPaymentModal && (
        <AddPaymentModal
          saleId={sale._id}
          sale={car}
          payments={payments}
          remaining={sale.paymentSummary.remainingAmount}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default SaleDetails;
