import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/api";

const PurchaseFinalInvoice = () => {
    const { id } = useParams();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [purchasePayments, setPurchasePayments] = useState<any[]>([]);

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

    /* ================= PRINT ================= */
    const handlePrint = () => {
        window.print();
    };

    /* ================= FETCH ================= */
    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ Backend final invoice endpoint se fetch karo
                const res = await api.get(`/admin/purchase/${id}/final-invoice`);
                setData(res.data);
                setPurchasePayments(res.data.payments || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    /* ================= PRINT CSS ================= */
    useEffect(() => {
        const style = document.createElement("style");
        style.id = "invoice-print-style";
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

                #invoice .bg-gray-50 { padding: 10px !important; margin-top: 8px !important; }
                #invoice .gap-10 { gap: 16px !important; }
                #invoice .mt-8 { margin-top: 10px !important; }
                #invoice .mt-14 { margin-top: 16px !important; }
                #invoice .mt-10 { margin-top: 10px !important; }
                #invoice .pb-4 { padding-bottom: 6px !important; }
                #invoice .mb-5 { margin-bottom: 6px !important; }
                #invoice .mb-4 { margin-bottom: 4px !important; }
                #invoice .mb-3 { margin-bottom: 4px !important; }
                #invoice .space-y-4 > * + * { margin-top: 4px !important; }
                #invoice .space-y-1 > * + * { margin-top: 1px !important; }

                #invoice table { font-size: 10px !important; }
                #invoice th, #invoice td { padding: 4px 6px !important; }

                #invoice .leading-6 { line-height: 1.4 !important; font-size: 10px !important; }
                #invoice .w-44 { margin-top: 40px !important; }

                .no-print {
                    display: none !important;
                    visibility: hidden !important;
                }
            }
        `;

        document.head.appendChild(style);
        return () => {
            const el = document.getElementById("invoice-print-style");
            if (el) document.head.removeChild(el);
        };
    }, []);

    if (loading) {
        return <div className="p-6">Loading final invoice...</div>;
    }

    if (!data) return null;

    /* ================= DATA ================= */
    // ✅ Backend /purchase/:id/final-invoice response structure:
    // { finalInvoiceNumber, contact, carDetails, sellerSettlement, payments, generatedAt }
    const contact = data.contact || {};
    const car = data.carDetails || {};
    const settlement = data.sellerSettlement || {};

    // ✅ Backend se aaye payments directly use karo
    const payments: any[] = purchasePayments.map((p: any, i: number) => ({
        key: p._id || i,
        date: p.paymentDate || p.createdAt,
        invoiceNumber:
            p.invoiceNumber ||
            `INV-${new Date(p.paymentDate || p.createdAt).getFullYear()}-${(p._id || "")
                .slice(-4)
                .toUpperCase()}`,
        paymentType: p.paymentType,
        amount: p.amount,
    }));

    const totalAmount = settlement.totalPurchaseAmount || data.expectedPrice || 0;
    const paidAmount = settlement.totalPaidAmount || 0;
    const remainingAmount = settlement.dueAmount ?? (totalAmount - paidAmount);
    const paymentStatus = remainingAmount <= 0 ? "PAID" : "PENDING";

    return (
        <div className="bg-[#f5f5f5] min-h-screen p-4">
            <div
                id="invoice"
                className="max-w-6xl mx-auto bg-white border rounded-xl p-6"
            >
                {/* ================= HEADER ================= */}
                <div className="flex justify-between border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold">United Motors</h1>
                        <p className="text-gray-600">Authorized Used Car Dealer</p>
                        <p className="text-gray-600">Indore, Madhya Pradesh</p>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold text-gray-500">
                            FINAL PURCHASE INVOICE
                        </p>
                        <p className="font-semibold">
                            Invoice No: {data.finalInvoiceNumber || `FIN-${id?.slice(-6)}`}
                        </p>
                        <p className="font-semibold">
                            Date: {formatDate(data.generatedAt || new Date())}
                        </p>
                    </div>
                </div>

                {/* ================= DETAILS ================= */}
                <div className="grid grid-cols-2 gap-10 mt-8">
                    <div>
                        <h2 className="font-semibold mb-3">Seller Details</h2>
                        <div className="space-y-1">
                            <p><b>Name:</b> {contact.name || "-"}</p>
                            <p><b>Phone:</b> {contact.phone || "-"}</p>
                            <p><b>City:</b> {contact.city || "-"}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Vehicle Details</h3>
                        <p>
                            <b>Car:</b>{" "}
                            {[car.brand, car.variant].filter(Boolean).join(" ")}
                        </p>
                        <p><b>Fuel:</b> {car.fuelType || "—"}</p>
                        <p><b>KM Driven:</b> {car.kmDriven || "—"}</p>
                        <p>
                            <b>Registration No:</b>{" "}
                            {car.registrationNumber || "—"}
                        </p>
                    </div>
                </div>

                {/* ================= SUMMARY ================= */}
                <div className="bg-gray-50 rounded-xl p-6 mt-8">
                    <h2 className="font-semibold mb-5">Final Payment Summary</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span>Total Purchase Price</span>
                            <span className="font-semibold">
                                ₹{totalAmount.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Amount Paid</span>
                            <span className="font-semibold text-green-700">
                                ₹{paidAmount.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Remaining Balance</span>
                            <span className="font-semibold text-red-600">
                                ₹{remainingAmount.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Status</span>
                            <span className="font-bold text-green-700">
                                {paymentStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ================= PAYMENT HISTORY ================= */}
                <div className="mt-8">
                    <h2 className="font-semibold mb-4">Payment History</h2>
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
                            {payments.length > 0 ? (
                                payments.map((p) => (
                                    <tr key={p.key}>
                                        <td className="border p-2">
                                            {formatDate(p.date)}
                                        </td>
                                        <td className="border p-2">
                                            {p.invoiceNumber}
                                        </td>
                                        <td className="border p-2">{p.paymentType}</td>
                                        <td className="border p-2 text-right">
                                            ₹{p.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="border p-2 text-center text-gray-400">
                                        No payment records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ================= DECLARATION ================= */}
                <p className="mt-8 text-sm leading-6">
                    This is to certify that the above-mentioned vehicle has been
                    fully purchased and all agreed payments have been successfully
                    completed. Ownership transfer and related documentation may now
                    proceed as applicable rules.
                </p>

                {/* ================= FOOTER ================= */}
                <div className="flex justify-between items-end mt-14">
                    <p className="text-sm text-gray-600">
                        This is a system-generated invoice.
                    </p>
                    <div className="text-right">
                        <p className="font-semibold">United Motors</p>
                        <div className="w-44 border-t mt-24"></div>
                        <p className="text-sm mt-2">Authorized Signatory</p>
                    </div>
                </div>

                {/* ================= PRINT BTN ================= */}
                <div className="mt-10 no-print">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 text-white px-5 py-2 rounded"
                    >
                        Print Final Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseFinalInvoice;
