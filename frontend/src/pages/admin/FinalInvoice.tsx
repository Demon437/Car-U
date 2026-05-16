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

const FinalInvoice = () => {
    const { saleId } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    /* ================= DATE FORMAT HELPER ================= */
    const formatDate = (dateValue: any): string => {
        if (!dateValue) return "—";
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    /* ================= FETCH ================= */
    useEffect(() => {
        api.get(`/admin/sales/${saleId}/final-invoice`)
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, [saleId]);

    /* ================= PRINT CSS ================= */
    useEffect(() => {
        const style = document.createElement("style");
        style.id = "final-invoice-print-style";
        style.innerHTML = `
            @media print {
                @page {
                    size: A4 portrait;
                    margin: 10mm;
                }

                html, body {
                    background: white !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                body * {
                    visibility: hidden !important;
                }

                #invoice,
                #invoice * {
                    visibility: visible !important;
                }

                #invoice {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    background: white !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;

                    font-size: 11px !important;
                    line-height: 1.4 !important;
                }

                #invoice h1 { font-size: 20px !important; margin: 0 !important; }
                #invoice h2, #invoice h3 { font-size: 12px !important; margin-bottom: 4px !important; }
                #invoice p { margin: 2px 0 !important; font-size: 11px !important; }

                #invoice .bg-gray-50 { padding: 10px !important; margin-bottom: 8px !important; }
                #invoice .gap-6 { gap: 12px !important; }
                #invoice .mb-6 { margin-bottom: 8px !important; }
                #invoice .mb-8 { margin-bottom: 10px !important; }
                #invoice .mb-4 { margin-bottom: 4px !important; }
                #invoice .mb-2 { margin-bottom: 3px !important; }
                #invoice .pb-4 { padding-bottom: 6px !important; }
                #invoice .gap-y-3 { row-gap: 3px !important; }
                #invoice .mt-8 { margin-top: 10px !important; }

                #invoice table { font-size: 10px !important; }
                #invoice th, #invoice td { padding: 4px 6px !important; }

                /* Signatory space */
                #invoice .mt-12 { margin-top: 40px !important; }

                .no-print {
                    display: none !important;
                    visibility: hidden !important;
                }
            }
        `;

        document.head.appendChild(style);
        return () => {
            const el = document.getElementById("final-invoice-print-style");
            if (el) document.head.removeChild(el);
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
                        <b>Date:</b> {formatDate(generatedAt)}
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

            {/* ================= PAYMENT SUMMARY ================= */}
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
                                {formatDate(
                                    p.invoiceDate ||
                                    p.date ||
                                    p.createdAt ||
                                    p.paymentDate
                                )}
                            </td>
                            <td className="border p-2">{p.invoiceNumber}</td>
                            <td className="border p-2">
                                {formatPaymentLabel(
                                    p.adjustAgainst || p.paymentType
                                )}
                            </td>
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
                    <div className="mt-24 border-t w-48 ml-auto" />
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
