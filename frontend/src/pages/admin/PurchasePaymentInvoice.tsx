import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/api";

const PurchasePaymentInvoice = () => {
    const { purchaseId, paymentIndex } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setLoading(true);
                const res = await api.get(
                    `/admin/purchase-payments/${purchaseId}/${paymentIndex}`
                );
                setData(res.data);
            } catch (err) {
                console.error("Error loading invoice:", err);
            } finally {
                setLoading(false);
            }
        };

        if (purchaseId && paymentIndex) fetchInvoice();
    }, [purchaseId, paymentIndex]);

    if (loading)
        return <div className="p-6 text-center">Loading invoice…</div>;
    if (!data) return null;

    const { payment, carDetails, contact, purchaseDetails } = data;

    const totalPurchaseAmount = purchaseDetails.totalPurchaseAmount || 0;
    const paidTillNow =
        purchaseDetails.totalPaidAmount - payment.amount;
    const remainingAfterPayment = Math.max(
        0,
        totalPurchaseAmount - purchaseDetails.totalPaidAmount
    );

    const status =
        remainingAfterPayment === 0 ? "PAID" : "PARTIAL";

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
                    <p>
                        <b>Purchase Payment Receipt</b>
                    </p>
                    <p>
                        <b>Date:</b>{" "}
                        {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                    <p>
                        <b>Payment Mode:</b> {payment.paymentType}
                    </p>
                </div>
            </div>

            <hr className="mb-6" />

            {/* ================= TITLE ================= */}
            <h2 className="text-base sm:text-lg font-semibold mb-6 text-center">
                Settlement Payment Receipt
            </h2>

            {/* ================= SELLER & VEHICLE ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mb-8">
                <div>
                    <h3 className="font-semibold mb-2">Paid To (Seller)</h3>
                    <p>
                        <b>Name:</b> {contact?.name || "N/A"}
                    </p>
                    <p>
                        <b>Phone:</b> {contact?.phone || "N/A"}
                    </p>
                    <p>
                        <b>City:</b> {contact?.city || "N/A"}
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Vehicle Details</h3>
                    <p>
                        <b>Car:</b>{" "}
                        {[carDetails?.brand, carDetails?.model]
                            .filter(Boolean)
                            .join(" ") || "—"}
                    </p>
                    <p>
                        <b>Year:</b> {carDetails?.year || "—"}
                    </p>
                    <p className="break-all">
                        <b>Registration No:</b>{" "}
                        {carDetails?.registrationNumber || "—"}
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
                                Car Purchase Payment ({payment.paymentType})
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

            {/* ================= PURCHASE SNAPSHOT ================= */}
            <div className="bg-gray-50 border rounded-lg p-4 text-sm mb-6">
                <h3 className="font-semibold mb-3">
                    Purchase Settlement Summary
                </h3>

                <div className="grid grid-cols-2 gap-y-2">
                    <p>Total Purchase Amount</p>
                    <p className="text-right">
                        ₹{totalPurchaseAmount.toLocaleString()}
                    </p>

                    <p>Paid Till Now (Before This)</p>
                    <p className="text-right text-green-600">
                        ₹{paidTillNow.toLocaleString()}
                    </p>

                    <p>This Payment</p>
                    <p className="text-right">
                        ₹{payment.amount.toLocaleString()}
                    </p>

                    <p>Remaining to Pay Seller</p>
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
                    <p className="font-semibold">For United Motors</p>
                    <div className="mt-10 border-t w-48" />
                    <p className="text-xs mt-1">Authorized Signatory</p>
                </div>
            </div>

            {/* ================= PRINT ================= */}
            <div className="mt-8 print:hidden flex gap-2">
                <button
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-blue-600 text-white rounded"
                >
                    Print Payment Receipt
                </button>
                <button
                    onClick={() => window.close()}
                    className="px-5 py-2 bg-gray-600 text-white rounded"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default PurchasePaymentInvoice;
