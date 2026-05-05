import React, { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/Badge";
import { Feature } from "framer-motion";

interface BuyerInfo {
  name: string;
  phone: string;
  email: string;
  city: string;
}

interface SellerInfo {
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  city?: string;
  area?: string;
}

interface RCDetails {
  rcOwner?: "yes" | "no";
  rcOwnerName?: string;
}

interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "PAID" | "PARTIAL" | "PENDING";
}

interface SoldCar {
  _id: string;

  // existing
  car: CarDetails;
  seller: SellerInfo;
  buyer: BuyerInfo;
  sellerPrice: number;
  adminSellingPrice: number;
  buyerPrice: number;
  soldAt: string;
  source: "ONLINE" | "OFFLINE";
  rcDetails?: RCDetails;


  // 🔥 ADD THESE
  saleId?: string;
  paymentSummary?: PaymentSummary;

  payments?: {
    amount: number;
    paymentType: string;
    paymentMode?: "CASH" | "UPI" | "BANK" | "LOAN";
    invoiceDate: string;
    invoiceNumber?: string;
  }[];

  adminExpenses?: {
    label: string;
    amount: number;
  }[];

  totalAdminExpense?: number;
  netProfit?: number;
}

interface CarDetails {
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  kmDriven: number;
  condition: string;
  images: string[];
  features: Record<string, string[]>;
}


const History: React.FC = () => {
  const [history, setHistory] = useState<SoldCar[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      console.log("📍 [History] Fetching history with source filter:", source);
      const res = await api.get("/admin/history", {
        params: { source },
      });
      console.log("✅ [History] Data received from backend:", res.data);
      console.log("📊 [History] Total cars in history:", res.data.length);
      setHistory(res.data);
      console.log("✓ [History] State updated with history data");
    } catch (error) {
      console.error("❌ [History] Error fetching history:", error);
      console.error(
        "❌ [History] Error details:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchHistory();
  // }, [source]);

  useEffect(() => {
    fetchHistory();
    setVisibleCount(4); // reset
  }, [source]);

  const calculateProfit = (car: SoldCar) => {
    if (!car.buyerPrice || !car.sellerPrice) return 0;
    return car.buyerPrice - car.sellerPrice;
  };

  const calculateMargin = (car: SoldCar) => {
    if (!car.sellerPrice) return "0.00";
    const profit = calculateProfit(car);
    return ((profit / car.sellerPrice) * 100).toFixed(2);
  };

  // Profit Ratio

  const getAdminExpenseTotal = (car: SoldCar) => {
    return (
      car.adminExpenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) ||
      0
    );
  };

  const getReceivedAmount = (car: SoldCar) => {
    if (!car.paymentSummary) {
      console.log("⚠️ No paymentSummary for car:", car._id);
      return 0;
    }

    const { totalAmount, remainingAmount } = car.paymentSummary;
    const received = (totalAmount || 0) - (remainingAmount || 0);
    console.log("💰 Received amount for car:", car._id, received, "Total:", totalAmount, "Remaining:", remainingAmount);
    return received;
  };

  const calculateNetProfit = (car: SoldCar) => {
    if (!car.sellerPrice) {
      console.log("⚠️ No sellerPrice for car:", car._id);
      return 0;
    }

    const receivedAmount = getReceivedAmount(car);
    const adminExpense = getAdminExpenseTotal(car);
    const netProfit = receivedAmount - car.sellerPrice - adminExpense;

    console.log("🧮 Net Profit Calculation for car:", car._id, {
      sellerPrice: car.sellerPrice,
      receivedAmount,
      adminExpense,
      netProfit
    });

    return netProfit;
  };

  const calculateProfitRatio = (car: SoldCar) => {
    if (!car.sellerPrice) return "0.00";

    const netProfit = calculateNetProfit(car);
    return ((netProfit / car.sellerPrice) * 100).toFixed(2);
  };

  // Total revnue Stats
  const calculatedRevenue = history.reduce((sum, car) => {
    if (!car.paymentSummary) return sum;

    return (
      sum +
      (car.paymentSummary.totalAmount || 0) -
      (car.paymentSummary.remainingAmount || 0)
    );
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Car Sales History
          </h1>
          <p className="text-gray-600">Complete details of all sold cars</p>
        </div>

        {/* FILTER */}
        <div className="mb-8 flex gap-4 items-center">
          <label className="text-sm font-semibold text-gray-700">
            Filter by Source:
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sources</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && history.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No sold cars found</p>
          </div>
        )}

        {/* CARDS GRID */}
        {!loading && history.length > 0 && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {history.slice(0, visibleCount).map((car) => {
              const profit = calculateNetProfit(car);
              const isLoss = profit < 0;
              const profitAmount = Math.abs(profit);
              const cardId = `${car._id}-${car.source}-${car.saleId || ""}`;
              const isExpanded = expandedCards.has(cardId);

              return (
                <Card
                  key={cardId}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">
                          {car.car.brand} {car.car.model}
                        </CardTitle>
                        <p className="text-blue-100 text-sm mt-1">
                          {car.car.year} • {car.car.kmDriven} km
                          {car.saleId && ` • Sale ID: ${car.saleId.slice(-6)}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          className={
                            car.source === "ONLINE"
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }
                        >
                          {car.source}
                        </Badge>

                        {car.paymentSummary && (
                          <Badge
                            className={
                              car.paymentSummary.status === "PAID"
                                ? "bg-green-600"
                                : car.paymentSummary.status === "PARTIAL"
                                  ? "bg-yellow-500"
                                  : "bg-gray-400"
                            }
                          >
                            {car.paymentSummary.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-6">
                    {/* COMPACT VIEW - Basic Info Only */}
                    {!isExpanded && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Quick Summary
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Fuel Type:</span>
                            <p className="font-medium text-gray-900">
                              {car.car.fuelType}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Transmission:</span>
                            <p className="font-medium text-gray-900">
                              {car.car?.transmission ?? "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Seller Price:</span>
                            <p className="font-medium text-gray-900">
                              ₹{(car.sellerPrice || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <p className="font-medium text-gray-900">
                              {car.buyerPrice ? "Sold" : "Available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* INDIVIDUAL VIEW MORE BUTTON */}
                    {!isExpanded && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => toggleCardExpansion(cardId)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Full Details
                        </button>
                      </div>
                    )}

                    {/* FULL VIEW - All Details */}
                    {isExpanded && (
                      <>
                        {/* CAR DETAILS */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Car Details
                          </h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Fuel Type:</span>
                              <p className="font-medium text-gray-900">
                                {car.car.fuelType}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Transmission:</span>
                              <p className="font-medium text-gray-900">
                                {car.car?.transmission ?? "N/A"}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-600">Condition:</span>
                              <p className="font-medium text-gray-900">
                                {car.car?.condition ?? "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* CAR FEATURES DYNAMIC SECTION */}
                        <div className="bg-blue-50 p-4 rounded-lg mt-4 col-span-2">
                          <h3 className="font-semibold text-gray-900 mb-3 border-b border-blue-200 pb-1">
                            Car Features & Highlights
                          </h3>

                          {car.car.features &&
                            Object.keys(car.car.features).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(car.car.features).map(
                                ([category, items]) => {
                                  // Agar list empty hai ya null hai toh skip karo
                                  if (!Array.isArray(items) || items.length === 0)
                                    return null;

                                  return (
                                    <div key={category} className="space-y-1">
                                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                                        {category.replace(/([A-Z])/g, " $1").trim()}
                                      </p>
                                      <ul className="flex flex-wrap gap-1">
                                        {items.map((item, idx) => (
                                          <li
                                            key={idx}
                                            className="bg-white px-2 py-1 rounded text-[11px] border border-blue-100 text-gray-700 shadow-sm"
                                          >
                                            ✓{" "}
                                            {item
                                              .replace(/([A-Z])/g, " $1")
                                              .replace(/^./, (str) =>
                                                str.toUpperCase(),
                                              )}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              No specific features listed.
                            </p>
                          )}
                        </div>

                        {/* SELLER DETAILS */}
                        {car.seller && (
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">
                              Seller Details
                            </h3>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Name</span>
                                <p className="font-medium text-gray-900">
                                  {car.seller.name || "N/A"}
                                </p>
                              </div>

                              <div>
                                <span className="text-gray-600">Phone</span>
                                <p className="font-medium text-gray-900">
                                  {car.seller.phone || "N/A"}
                                </p>
                              </div>

                              <div>
                                <span className="text-gray-600">Alt Phone</span>
                                <p className="font-medium text-gray-900">
                                  {car.seller.altPhone || "N/A"}
                                </p>
                              </div>

                              <div>
                                <span className="text-gray-600">Email</span>
                                <p className="font-medium text-gray-900 text-xs break-all">
                                  {car.seller.email || "N/A"}
                                </p>
                              </div>

                              <div>
                                <span className="text-gray-600">City</span>
                                <p className="font-medium text-gray-900">
                                  {car.seller.city || "N/A"}
                                </p>
                              </div>

                              <div>
                                <span className="text-gray-600">Area</span>
                                <p className="font-medium text-gray-900">
                                  {car.seller.area || "N/A"}
                                </p>
                              </div>

                              <div>
                                <span className="text-gray-600">
                                  Expected Price
                                </span>
                                <p className="font-semibold text-blue-600">
                                  ₹{car.sellerPrice?.toLocaleString() || "N/A"}
                                </p>
                              </div>

                              <div>
                                <span className="text-gray-600">RC Owner</span>
                                <p className="font-medium text-gray-900">
                                  {car.rcDetails?.rcOwner === "yes" ? "Yes" : "No"}
                                </p>
                              </div>

                              <div className="col-span-2">
                                <span className="text-gray-600">RC Owner Name</span>
                                <p className="font-medium text-gray-900">
                                  {car.rcDetails?.rcOwner === "yes"
                                    ? car.seller.name
                                    : car.rcDetails?.rcOwnerName || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* BUYER DETAILS */}
                        {car.buyer ? (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">
                              Buyer Details
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">Name:</span>
                                <p className="font-medium text-gray-900">
                                  {car.buyer.name || "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Phone:</span>
                                <p className="font-medium text-gray-900">
                                  {car.buyer.phone || "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Email:</span>
                                <p className="font-medium text-gray-900">
                                  {car.buyer.email || "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">City:</span>
                                <p className="font-medium text-gray-900">
                                  {car.buyer.city || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-700">
                              ⚠️ Buyer details not yet added for this car
                            </p>
                          </div>
                        )}

                        {car.adminExpenses?.length > 0 && (
                          <div className="bg-red-50 p-4 rounded-lg border">
                            <h3 className="font-semibold mb-2">Admin Expenses</h3>

                            {car.adminExpenses.map((e, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span>{e.label}</span>
                                <span className="font-semibold text-red-600">
                                  ₹{e.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}

                            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                              <span>Total</span>
                              <span className="text-red-700">
                                ₹{car.totalAdminExpense?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* PAYMENT SUMMARY */}
                        {car.paymentSummary && (
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-semibold text-gray-900 mb-3">
                              Payment Summary
                            </h3>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Total Amount</span>
                                <p className="font-semibold">
                                  ₹{car.paymentSummary.totalAmount.toLocaleString()}
                                </p>
                              </div>

                              <div>
                                <span className="text-gray-600">Paid</span>
                                <p className="font-semibold text-green-600">
                                  ₹{car.paymentSummary.paidAmount.toLocaleString()}
                                </p>
                              </div>

                              <div>
                                <span className="text-gray-600">Remaining</span>
                                <p className="font-semibold text-red-600">
                                  ₹
                                  {car.paymentSummary.remainingAmount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {car.payments?.length > 0 && (
                          <div className="bg-white border rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Payment Timeline</h3>

                            {car.payments.map((p, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-sm border-b py-1"
                              >
                                <span>
                                  ₹{p.amount.toLocaleString()} (
                                  {p.paymentMode || p.paymentType})
                                </span>
                                <span className="text-gray-500">
                                  {new Date(p.invoiceDate).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* PRICING & PROFIT SUMMARY */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                          <h3 className="font-semibold text-gray-900 mb-4">
                            Transaction Summary
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Seller Price:</span>
                              <span className="font-semibold text-gray-900">
                                ₹{(car.sellerPrice || 0).toLocaleString()}
                              </span>
                            </div>
                            {car.buyerPrice ? (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">
                                    Buyer Price:
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    ₹{car.buyerPrice.toLocaleString()}
                                  </span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                  <span className="text-gray-600 font-medium">
                                    {isLoss ? "Loss:" : "Profit:"}
                                  </span>

                                  <div className="text-right">
                                    <p
                                      className={`font-bold text-lg ${isLoss ? "text-red-600" : "text-green-600"
                                        }`}
                                    >
                                      ₹{profitAmount.toLocaleString()}
                                    </p>

                                    <p
                                      className={`text-xs ${isLoss ? "text-red-600" : "text-green-600"
                                        }`}
                                    >
                                      ({calculateProfitRatio(car)}%)
                                    </p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-amber-700 text-sm mt-2">
                                ⚠️ Buyer price not set
                              </div>
                            )}
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Sold on:</span>
                              <span>
                                {car.soldAt
                                  ? new Date(car.soldAt).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* VIEW FINAL INVOICE */}
                        {car.paymentSummary?.status === "PAID" && car.saleId && (
                          <div className="flex justify-end">
                            <button
                              onClick={() =>
                                window.open(
                                  `/admin/sales/${car.saleId}/final-invoice`,
                                  "_blank",
                                )
                              }
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              View Final Invoice
                            </button>
                          </div>
                        )}
                        {car.paymentSummary?.status === "PARTIAL" && (
                          <div className="flex justify-end">
                            <button
                              disabled
                              className="px-4 py-2 bg-gray-300 text-gray-600 text-sm rounded cursor-not-allowed"
                            >
                              Invoice available after full payment
                            </button>
                          </div>
                        )}

                        {/* INDIVIDUAL SHOW LESS BUTTON */}
                        {isExpanded && (
                          <div className="flex justify-center mt-4">
                            <button
                              onClick={() => toggleCardExpansion(cardId)}
                              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Show Less Details
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}


        {/* TOTAL STATS */}
        {/* ================= TOTAL STATS (BUSINESS SUMMARY) ================= */}
        {!loading && history.length > 0 && (
          <div className="mt-14 space-y-8">
            {/* ===== ROW 1 : CASH FLOW (MOST IMPORTANT) ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* CASH RECEIVED */}
              <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-gray-700">
                    💰 Cash Received
                  </p>
                  <p className="mt-2 text-3xl font-bold text-indigo-700 break-all">
                    ₹{calculatedRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Actual money received from buyers
                  </p>
                </CardContent>
              </Card>
              {/* PENDING COLLECTION */}
              <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-gray-700">
                    ⏳ Pending Collection
                  </p>
                  <p className="mt-2 text-3xl font-bold text-orange-600 break-all">
                    ₹
                    {history
                      .reduce(
                        (sum, car) =>
                          sum + (car.paymentSummary?.remainingAmount || 0),
                        0,
                      )
                      .toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Amount yet to be collected from buyers
                  </p>
                </CardContent>
              </Card>
              {/* TOTAL DEAL VALUE */}
              <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-gray-700">
                    📊 Total Deal Value
                  </p>
                  <p className="mt-2 text-3xl font-bold text-blue-700 break-all">
                    ₹
                    {history
                      .reduce(
                        (sum, car) =>
                          sum + (car.paymentSummary?.totalAmount || 0),
                        0,
                      )
                      .toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Cash received + pending amount
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* ===== ROW 2 : BUSINESS HEALTH ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* NET PROFIT / LOSS */}
              <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-red-50 to-red-100">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-gray-700">
                    📉 Net Business Result
                  </p>
                  <p className="mt-2 text-3xl font-bold text-red-600 break-all">
                    ₹
                    {history
                      .reduce((sum, car) => {
                        const profit = calculateNetProfit(car);
                        return profit < 0 ? sum + Math.abs(profit) : sum;
                      }, 0)
                      .toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Loss due to low received payments & expenses
                  </p>
                </CardContent>
              </Card>

              {/* TOTAL PROFIT (POSITIVE ONLY) */}
              <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-gray-700">
                    ✅ Realised Profit
                  </p>
                  <p className="mt-2 text-3xl font-bold text-green-700 break-all">
                    ₹
                    {history
                      .reduce((sum, car) => {
                        const profit = calculateNetProfit(car);
                        return profit > 0 ? sum + profit : sum;
                      }, 0)
                      .toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Profit from fully recovered deals
                  </p>
                </CardContent>
              </Card>

              {/* BUSINESS HEALTH */}
              <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-gray-700">
                    🧠 Business Health
                  </p>
                  {(() => {
                    const avgMargin =
                      history.reduce((sum, car) => {
                        const net = calculateNetProfit(car);
                        return (
                          sum +
                          (car.sellerPrice ? (net / car.sellerPrice) * 100 : 0)
                        );
                      }, 0) / history.length;

                    const isLoss = avgMargin < 0;

                    return (
                      <>
                        <p
                          className={`mt-2 text-3xl font-bold ${isLoss ? "text-red-600" : "text-green-600"
                            }`}
                        >
                          {isLoss ? "Loss " : "Profit "}
                          {Math.abs(avgMargin).toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Will improve as pending payments are received
                        </p>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
