import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/api";

const FinalInvoice = () => {
    const { saleId } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/admin/sales/${saleId}/final-invoice`)
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, [saleId]);

    /* ---------- Print styles ---------- */
    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
    @media print {
      body { background: white; }
      #invoice { box-shadow: none; border: none; }
      .no-print { display: none; }
    }
  `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style); // ✅ return void
        };
    }, []);


    if (loading) return <div className="p-6">Loading final invoice…</div>;
    if (!data) return null;

    const { finalInvoiceNumber, sale, car, payments, generatedAt } = data;

    return (
        <div
            id="invoice"
            className="max-w-5xl mx-auto bg-white border rounded-xl shadow-sm p-8"
        >

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-start border-b pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">United Motors</h1>
                    <p className="text-sm text-gray-600">Authorized Used Car Dealer</p>
                    <p className="text-sm text-gray-600">Indore, Madhya Pradesh</p>
                </div>

                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-500">
                        FINAL SALE INVOICE
                    </p>
                    <p className="text-sm">
                        <b>Invoice No:</b> {finalInvoiceNumber}
                    </p>
                    <p className="text-sm">
                        <b>Date:</b>{" "}
                        {new Date(generatedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* ================= BUYER + VEHICLE ================= */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 className="font-semibold mb-2">Buyer Details</h3>
                    <p><b>Name:</b> {car.buyer?.name}</p>
                    <p><b>Phone:</b> {car.buyer?.phone}</p>
                    <p><b>City:</b> {car.buyer?.city}</p>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Vehicle Details</h3>
                    <p>
                        <b>Car:</b>{" "}
                        {[car.car?.brand, car.car?.variant].filter(Boolean).join(" ")}
                    </p>
                    <p><b>Fuel:</b> {car.car?.fuelType || "—"}</p>
                    <p><b>KM Driven:</b> {car.car?.kmDriven || "—"}</p>
                    <p><b>Registration No:</b> {car.car?.registrationNumber || "—"}</p>
                </div>
            </div>

            {/* ================= PAYMENT SUMMARY (HERO) ================= */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4">Final Payment Summary</h3>

                <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <p>Total Vehicle Price</p>
                    <p className="text-right font-medium">
                        ₹{sale.paymentSummary.totalAmount.toLocaleString()}
                    </p>

                    <p>Total Amount Paid</p>
                    <p className="text-right font-semibold text-green-700">
                        ₹{sale.paymentSummary.paidAmount.toLocaleString()}
                    </p>

                    <p>Remaining Balance</p>
                    <p className="text-right font-semibold text-red-600">
                        ₹{sale.paymentSummary.remainingAmount.toLocaleString()}
                    </p>

                    <p>Status</p>
                    <p className="text-right font-bold text-green-700">
                        {sale.paymentSummary.status}
                    </p>
                </div>
            </div>

            {/* ================= PAYMENT HISTORY ================= */}
            <h3 className="font-semibold mb-2">Payment History</h3>

            <table className="w-full text-sm border mb-6">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2 text-left">Date</th>
                        <th className="border p-2 text-left">Invoice No</th>
                        <th className="border p-2 text-left">Mode</th>
                        <th className="border p-2 text-right">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((p: any) => (
                        <tr key={p._id}>
                            <td className="border p-2">
                                {new Date(p.invoiceDate).toLocaleDateString()}
                            </td>
                            <td className="border p-2">{p.invoiceNumber}</td>
                            <td className="border p-2">{p.paymentType}</td>
                            <td className="border p-2 text-right">
                                ₹{p.amount.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ================= DECLARATION ================= */}
            <p className="text-sm mb-8">
                This is to certify that the above-mentioned vehicle has been fully paid
                for by the buyer. Ownership transfer and related documentation may now
                proceed as per applicable rules.
            </p>

            {/* ================= FOOTER ================= */}
            <div className="flex justify-between items-end text-sm">
                <p>This is a system-generated invoice.</p>

                <div className="text-right">
                    <p className="font-semibold">United Motors</p>
                    <div className="mt-12 border-t w-48 ml-auto" />
                    <p className="text-xs mt-1">Authorized Signatory</p>
                </div>
            </div>

            {/* ================= PRINT ================= */}
            <div className="mt-8 no-print">
                <button
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-blue-600 text-white rounded"
                >
                    Print Final Invoice
                </button>
            </div>
        </div>
    );
};

export default FinalInvoice;
