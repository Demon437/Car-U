import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import AddPaymentModal from "@/pages/admin/AddPaymentModal";

const WHATSAPP_NUMBER = "9301942456";

const openWhatsAppWithMessage = ({
    sellerName,
    message,
}) => {
    const msg = `Hi ${sellerName}

${message}

Thank you 🙏
United Motors`;

    const waUrl = `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        msg
    )}`;

    window.open(waUrl, "_blank");
};



const openWhatsAppWithInvoice = ({
    sellerName,
    phone,
    invoiceUrl,
}) => {

    if (!phone) {
        alert("Seller phone number not found");
        return;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    const message = `
🚗 United Cars

Hi ${sellerName},

Your final purchase invoice is ready.

📄 View Invoice:
${invoiceUrl}

Thank you 🙏
`;

    window.open(
        `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
};

const formatPaymentLabel = (value: string) => {
    if (!value) return "Payment";

    const labels: Record<string, string> = {
        CASH: "Cash Payment",
        UPI: "UPI Payment",
        BANK: "Bank Transfer",
        LOAN: "Loan Disbursement",
        BLACK: "Unrecorded Cash",
    };

    return labels[value] || value;
};

const PurchaseDetails = () => {
    const { purchaseId } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showPaymentModal, setShowPaymentModal] =
        useState(false);

    const [payments, setPayments] = useState([]);

    const loadData = async () => {
        try {
            const purchaseRes = await api.get(
                `/admin/sell-requests/${purchaseId}`
            );

            setData(purchaseRes.data);
            console.log("PURCHASE RES =>", purchaseRes.data);

            // PAYMENT HISTORY
            try {
                const paymentRes = await api.get(
                    `/admin/purchase-payments/${purchaseId}`
                );

                setPayments(paymentRes.data || []);
                console.log("PAYMENT RES =>", paymentRes.data);
            } catch (err) {
                console.log(
                    "Payment API not found yet"
                );
            }
        } catch (err) {
            console.error(
                "Error loading purchase:",
                err
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [purchaseId]);

    useEffect(() => {
        console.log("PURCHASE DATA =>", data);
    }, [data]);

    if (loading)
        return (
            <div className="p-6 text-center">
                Loading…
            </div>
        );

    if (!data)
        return (
            <div className="p-6 text-center text-red-600">
                Purchase not found
            </div>
        );

    const carDetails = data.carDetails || {};
    const contact = data.contact || {};
    const settlement = data.sellerSettlement || {};



    const purchasePrice = data.expectedPrice || 0;
    const sellingPrice =
        data.adminSellingPrice || 0;

    const profitLoss =
        sellingPrice - purchasePrice;

    const isProfit = profitLoss >= 0;

    const paidToSeller = Number(
        settlement?.totalPaidAmount || 0
    );

    const remainingToSeller = Number(
        settlement?.dueAmount || 0
    );

    const paidPercent =
        Math.round(
            (paidToSeller / purchasePrice) * 100
        ) || 0;

    const paymentStatus =
        remainingToSeller <= 0
            ? "PAID"
            : "PENDING";

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 space-y-6">
            {/* ================= HEADER ================= */}
            <h1 className="text-xl font-semibold text-center sm:text-left">
                Purchase Details
            </h1>

            {/* ================= AMOUNT SUMMARY ================= */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-white rounded-xl p-4 border">
                    <p className="text-xs text-gray-500">
                        Purchase Price (Paid to Seller)
                    </p>

                    <p className="text-2xl font-bold text-blue-600">
                        ₹
                        {purchasePrice.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 border">
                    <p className="text-xs text-gray-500">
                        Selling Price (From Buyer)
                    </p>

                    <p className="text-2xl font-bold text-green-600">
                        ₹
                        {sellingPrice.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 border">
                    <p className="text-xs text-gray-500">
                        Profit/Loss
                    </p>

                    <p
                        className={`text-2xl font-bold ${isProfit
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                    >
                        {isProfit ? "+" : ""}
                        ₹
                        {Math.abs(
                            profitLoss
                        ).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* ================= PAYMENT STATUS ================= */}
            <div className="bg-white rounded-xl p-4 border space-y-2">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Payment Status to Seller:

                        <span className="ml-1 font-semibold">
                            {paymentStatus}
                        </span>
                    </p>

                    <p className="text-sm text-gray-500">
                        {paidPercent}%
                    </p>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                        className="h-2 bg-green-600 rounded transition-all"
                        style={{
                            width: `${paidPercent}%`,
                        }}
                    />
                </div>
            </div>

            {/* ================= PAYMENT BREAKUP ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border">
                    <p className="text-xs text-gray-500 mb-1">
                        Total Purchase Amount
                    </p>

                    <p className="text-xl font-bold text-blue-600">
                        ₹
                        {purchasePrice.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 border">
                    <p className="text-xs text-gray-500 mb-1">
                        Paid to Seller
                    </p>

                    <p className="text-xl font-bold text-green-600">
                        ₹
                        {paidToSeller.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 border">
                    <p className="text-xs text-gray-500 mb-1">
                        Remaining to Pay
                    </p>

                    <p className="text-xl font-bold text-red-600">
                        ₹
                        {remainingToSeller.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* ================= CAR DETAILS ================= */}
            <div className="bg-white rounded-xl p-4 border space-y-2 text-sm">
                <h2 className="font-semibold text-base mb-3">
                    Car Details
                </h2>

                <p>
                    <b>Brand:</b>{" "}
                    {carDetails.brand}
                </p>

                <p>
                    <b>Model:</b>{" "}
                    {carDetails.model}
                </p>

                <p>
                    <b>Variant:</b>{" "}
                    {carDetails.variant || "—"}
                </p>

                <p>
                    <b>Year:</b>{" "}
                    {carDetails.year}
                </p>

                <p>
                    <b>Registration:</b>{" "}
                    {carDetails.registrationNumber ||
                        "—"}
                </p>

                <p>
                    <b>Mileage:</b>{" "}
                    {carDetails.mileage || "—"} km
                </p>

                <p>
                    <b>Fuel Type:</b>{" "}
                    {carDetails.fuelType || "—"}
                </p>
            </div>

            {/* ================= SELLER DETAILS ================= */}
            <div className="bg-white rounded-xl p-4 border space-y-2 text-sm">
                <h2 className="font-semibold text-base mb-3">
                    Seller Details
                </h2>

                <p>
                    <b>Name:</b>{" "}
                    {contact.name || "—"}
                </p>

                <p>
                    <b>Phone:</b>{" "}
                    {contact.phone || "—"}
                </p>

                <p>
                    <b>Email:</b>{" "}
                    {contact.email || "—"}
                </p>

                <p>
                    <b>City:</b>{" "}
                    {contact.city || "—"}
                </p>

                <p>
                    <b>Area:</b>{" "}
                    {contact.area || "—"}
                </p>
            </div>

            {/* ================= SETTLEMENT DETAILS ================= */}
            <div className="bg-white rounded-xl p-4 border space-y-4">
                <h2 className="font-semibold text-base">
                    Settlement Details
                </h2>

                {/* CASH PAYMENT */}
                {settlement.cashPayment
                    ?.amount > 0 && (
                        <div className="pb-4 border-b">
                            <p className="text-sm font-medium mb-2">
                                Cash Payment
                            </p>

                            <p className="text-xs text-gray-600">
                                Amount:

                                <span className="font-semibold">
                                    ₹
                                    {settlement.cashPayment.amount.toLocaleString()}
                                </span>
                            </p>

                            <p className="text-xs text-gray-600">
                                Received By:

                                <span className="font-semibold">
                                    {settlement
                                        .cashPayment
                                        .receivedBy ||
                                        "—"}
                                </span>
                            </p>

                            <p className="text-xs text-gray-600">
                                Date:

                                <span className="font-semibold">
                                    {settlement
                                        .cashPayment
                                        .paymentDate
                                        ? new Date(
                                            settlement.cashPayment.paymentDate
                                        ).toLocaleDateString()
                                        : "—"}
                                </span>
                            </p>

                            {settlement.cashPayment
                                .notes && (
                                    <p className="text-xs text-gray-600 mt-2">
                                        Notes:

                                        <span className="font-semibold">
                                            {
                                                settlement
                                                    .cashPayment
                                                    .notes
                                            }
                                        </span>
                                    </p>
                                )}
                        </div>
                    )}

                {/* ONLINE PAYMENT */}
                {settlement.onlinePayment
                    ?.amount > 0 && (
                        <div>
                            <p className="text-sm font-medium mb-2">
                                Online Payment
                            </p>

                            <p className="text-xs text-gray-600">
                                Payment Mode:

                                <span className="font-semibold">
                                    {settlement
                                        .onlinePayment
                                        .paymentMode ||
                                        "—"}
                                </span>
                            </p>

                            <p className="text-xs text-gray-600">
                                Bank Name:

                                <span className="font-semibold">
                                    {settlement
                                        .onlinePayment
                                        .bankName ||
                                        "—"}
                                </span>
                            </p>

                            <p className="text-xs text-gray-600">
                                Transaction ID:

                                <span className="font-semibold">
                                    {settlement
                                        .onlinePayment
                                        .transactionId ||
                                        "—"}
                                </span>
                            </p>

                            <p className="text-xs text-gray-600">
                                Amount:

                                <span className="font-semibold">
                                    ₹
                                    {settlement.onlinePayment.amount.toLocaleString()}
                                </span>
                            </p>

                            <p className="text-xs text-gray-600">
                                Date:

                                <span className="font-semibold">
                                    {settlement
                                        .onlinePayment
                                        .paymentDate
                                        ? new Date(
                                            settlement.onlinePayment.paymentDate
                                        ).toLocaleDateString()
                                        : "—"}
                                </span>
                            </p>

                            {settlement
                                .onlinePayment
                                .notes && (
                                    <p className="text-xs text-gray-600 mt-2">
                                        Notes:

                                        <span className="font-semibold">
                                            {
                                                settlement
                                                    .onlinePayment
                                                    .notes
                                            }
                                        </span>
                                    </p>
                                )}
                        </div>
                    )}
            </div>

            {/* ================= ACTIONS ================= */}
            <div className="flex flex-col sm:flex-row gap-3">
                {paymentStatus !== "PAID" && (
                    <Button
                        className="bg-green-600 w-full sm:w-auto"
                        onClick={() =>
                            setShowPaymentModal(
                                true
                            )
                        }
                    >
                        + Add Payment
                    </Button>
                )}
            </div>


            <div className="flex flex-wrap gap-3">

                {/* DOWNLOAD FINAL INVOICE */}
                <Button
                    variant="outline"
                    disabled={paymentStatus !== "PAID"}
                    onClick={() =>
                        window.open(
                            `${window.location.origin}/admin/purchase/${purchaseId}/final-invoice`,
                            "_blank"
                        )
                    }
                >
                    Download Final Invoice
                </Button>

                {/* WHATSAPP FINAL INVOICE */}
                <Button
                    variant="outline"
                    disabled={paymentStatus !== "PAID"}
                    onClick={() =>
                        openWhatsAppWithInvoice({
                            sellerName: contact.name,
                            phone: contact.phone,
                            invoiceUrl: `${window.location.origin}/admin/purchase/${purchaseId}/final-invoice`,
                        })
                    }
                >
                    WhatsApp Final Invoice
                </Button>

            </div>

            {/* ================= PAYMENT TIMELINE ================= */}
            <div className="bg-white rounded-xl p-4 border">
                <h2 className="font-semibold mb-3">
                    Payment Timeline
                </h2>

                {payments.length === 0 && (
                    <p className="text-sm text-gray-500">
                        No payments added yet.
                    </p>
                )}



                {payments.map((p, idx) => (
                    <div
                        key={idx}
                        className="flex justify-between items-center py-3 border-b last:border-none"
                    >
                        <div>
                            <p className="font-semibold">
                                ₹
                                {p.amount.toLocaleString()}
                            </p>

                            <p className="text-xs text-gray-500">
                                {formatPaymentLabel(
                                    p.adjustAgainst || p.paymentType
                                )} •{" "}
                                {new Date(
                                    p.paymentDate
                                ).toLocaleDateString()}
                            </p>

                            {p.note && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {p.note}
                                </p>
                            )}
                        </div>




                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    window.open(
                                        `/admin/purchase-payments/${purchaseId}/${idx}/invoice`,
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
                                    openWhatsAppWithMessage(
                                        {
                                            sellerName:
                                                contact.name,
                                            message: `Your ${formatPaymentLabel(
                                                p.adjustAgainst || p.paymentType
                                            )} receipt of ₹${p.amount.toLocaleString()} is ready.`,
                                        }
                                    )
                                }
                            >
                                WhatsApp
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ================= PAYMENT MODAL ================= */}
            {showPaymentModal && (
                <AddPaymentModal
                    purchaseId={purchaseId}
                    remaining={
                        remainingToSeller
                    }
                    onClose={() =>
                        setShowPaymentModal(
                            false
                        )
                    }
                    onSuccess={() => {
                        setShowPaymentModal(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

export default PurchaseDetails;
