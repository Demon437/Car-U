import { useState, useEffect } from "react";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import AddMoreFeature from "./AddMoreFeature";
import FeatureBlock from "../FeatureBlock";

interface MarkSoldModalProps {
  car: {
    _id: string;
    brand: string;
    variant?: string;
    transmission?: string;
    status?: "LIVE" | "SOLD";
    year: number;
    fuelType?: string;
    kmDriven?: number;
    condition?: string;
    images?: string[];
    adminSellingPrice?: number;
    registrationNumber?: string;
    sellerPrice?: number;
    seller?: {
      name?: string;
      phone?: string;
      email?: string;
      city?: string;
      area?: string;
      altPhone?: string;
    };
    rcDetails?: {
      rcOwner?: string;
      rcOwnerName?: string;
      rcImage?: string;
    };
  };
  onClose: () => void;
  onSuccess: () => void;
}

const MarkSoldModal = ({
  car: initialCar,
  onClose,
  onSuccess,
}: MarkSoldModalProps) => {
  const [car, setCar] = useState<any>(initialCar);
  const [formData, setFormData] = useState({
    buyerName: "",
    buyerPhone: "",
    buyerEmail: "",
    buyerCity: "",
    paymentType: "CASH",

    cashAmount: "",
    upiAmount: "",
    bankAmount: "",
    loanAmount: "",
    blackAmount: "",

    cashPaidAmount: "",
    upiPaidAmount: "",
    bankPaidAmount: "",
    loanPaidAmount: "",
    blackPaidAmount: "",

    financeCompany: "",
    upiTransactionId: "",
    bankTransactionId: "",
    paymentNotes: "",

    soldPrice: "",
    saleDate: new Date().toISOString().split("T")[0],

    // ===== KYC FILES =====
    buyerAadhaarPhoto: null as File | null,
    buyerPANPhoto: null as File | null,
    buyerPhoto: null as File | null,

    // ===== RTO FILES =====
    form29: null as File | null,
    form30: null as File | null,
    form28: null as File | null,
    form35: null as File | null,

    // ===== RC TRANSFER =====
    rcTransferStatus: "PENDING", // PENDING | DONE
    rcTransferDate: "",
    newOwnerName: "",
    rcTransferCharges: "",

    // ===== RTO CHANGE =====
    rtoChange: "NO", // YES | NO
    oldRto: "",
    newRto: "",
    rtoCharges: "",

    // ===== INSURANCE =====
    insuranceStatus: "PENDING", // TRANSFERRED | NEW | PENDING
    insuranceCompany: "",
    policyNumber: "",
    insuranceCharges: "",

    // ===== EXTRA ADMIN EXPENSES =====
    extraAdminExpenses: [{ label: "", amount: "" }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  const normalizeCar = (data: any) => {
    return {
      _id: data._id,

      // ===== CAR =====
      brand: data.brand ?? data.car?.brand ?? "",
      variant: data.variant ?? data.car?.variant ?? "",
      year: data.year ?? data.car?.year ?? null,
      fuelType: data.fuelType ?? data.car?.fuelType ?? "",
      transmission: data.transmission ?? data.car?.transmission ?? "",
      registrationNumber:
        data.registrationNumber ?? data.car?.registrationNumber ?? "",
      kmDriven: data.kmDriven ?? data.car?.kmDriven ?? null,
      condition: data.condition ?? data.car?.condition ?? "",
      images: data.images ?? data.car?.images ?? [],




      // ===== PRICES =====
      sellerPrice: data.sellerPrice ?? null,
      adminSellingPrice: data.adminSellingPrice ?? null,

      // ===== STATUS =====
      status: data.status,

      // ===== SELLER =====
      seller: data.seller ?? {},

      // ... aapka purana code
      features: data.features ?? {}, // 🔥 Ye line add karo

      // ===== IMPORTANT FIX (🔥 THIS WAS MISSING) =====

      adminExpenses: data.adminExpenses ?? [],
      extraAdminExpenses: data.extraAdminExpenses ?? [],
      sellerDocuments: data.sellerDocuments ?? [],
      rcDetails: data.rcDetails ?? {},


    };
  };

  // ✅ Fetch complete car details with seller info
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/cars/${initialCar._id}`);
        console.log("🔥 FULL API RESPONSE 👉", res.data);

        const normalized = normalizeCar(res.data);
        setCar(normalized);
        console.log("✅ Normalized car:", normalized);

        // 🔥 DO NOT populate extraAdminExpenses - keep form clean for user to add new ones
      } catch (err) {
        console.error("❌ Failed to fetch car details", err);
        setCar(initialCar);
      } finally {
        setFetching(false);
      }
    };

    fetchCarDetails();
  }, [initialCar._id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;

    if (!name || !files || files.length === 0) return;

    const file = files[0];

    setFormData((prev: any) => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= PAYMENT CALCULATIONS =================

  const soldPriceNum = Number(formData.soldPrice || 0);

  // Planned amounts
  const cashAmountNum = Number(formData.cashAmount || 0);
  const upiAmountNum = Number(formData.upiAmount || 0);
  const bankAmountNum = Number(formData.bankAmount || 0);
  const loanAmountNum = Number(formData.loanAmount || 0);
  const blackAmountNum = Number(formData.blackAmount || 0);

  // Paid amounts
  const cashPaidAmountNum = Number(formData.cashPaidAmount || 0);
  const upiPaidAmountNum = Number(formData.upiPaidAmount || 0);
  const bankPaidAmountNum = Number(formData.bankPaidAmount || 0);
  const loanPaidAmountNum = Number(formData.loanPaidAmount || 0);
  const blackPaidAmountNum = Number(formData.blackPaidAmount || 0);

  // Total breakup amount
  const totalPlannedAmount =
    cashAmountNum +
    upiAmountNum +
    bankAmountNum +
    loanAmountNum +
    blackAmountNum;

  // Total actually received
  const totalPaidNow =
    cashPaidAmountNum +
    upiPaidAmountNum +
    bankPaidAmountNum +
    loanPaidAmountNum +
    blackPaidAmountNum;

  // Remaining amount from breakup
  const totalRemaining = Math.max(
    0,
    totalPlannedAmount - totalPaidNow
  );

  // Difference between sold price and breakup total
  const paymentGap =
    soldPriceNum - totalPlannedAmount;

  // Whether breakup matches sold price
  const isPaymentBalanced =
    totalPlannedAmount === soldPriceNum;

  console.log({
    cashPaidAmountNum,
    upiPaidAmountNum,
    bankPaidAmountNum,
    loanPaidAmountNum,
    blackPaidAmountNum,
    totalPaidNow,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.rcTransferStatus === "DONE" && !formData.rcTransferDate) {
      setError("RC transfer date is required when RC is marked DONE");
      return;
    }

    if (formData.insuranceStatus !== "PENDING" && !formData.insuranceCompany) {
      setError("Insurance company is required");
      return;
    }

    // ================= BASIC VALIDATION =================
    if (
      !formData.buyerName.trim() ||
      !formData.buyerPhone.trim() ||
      !formData.soldPrice.trim()
    ) {
      setError("Buyer name, phone, and sold price are required");
      return;
    }

    // ================= PAYMENT VALIDATION =================
    if (totalPaidNow <= 0) {
      setError("At least one payment amount is required");
      return;
    }

    if (totalPaidNow > soldPriceNum) {
      setError("Total payment amount cannot exceed sold price");
      return;
    }

    if (loanAmountNum > 0 && !formData.financeCompany.trim()) {
      setError("Finance company is required when loan amount is entered");
      return;
    }

    try {
      setLoading(true);

      // ================= FORM DATA =================
      const fd = new FormData();

      // -------- TEXT FIELDS --------
      fd.append("buyerDetails[buyerName]", formData.buyerName);
      fd.append("buyerDetails[buyerPhone]", formData.buyerPhone);
      fd.append("buyerDetails[buyerEmail]", formData.buyerEmail || "");
      fd.append("buyerDetails[buyerCity]", formData.buyerCity || "");
      fd.append("buyerDetails[soldPrice]", formData.soldPrice);
      fd.append("buyerDetails[saleDate]", formData.saleDate || "");

      // ================= SALE SUMMARY =================
      fd.append("sale[totalAmount]", String(soldPriceNum));
      fd.append("sale[paidAmount]", String(totalPaidNow));
      fd.append("sale[remainingAmount]", String(totalRemaining));

      // ================= PAYMENT DETAILS =================
      fd.append("payment[type]", formData.paymentType);

      fd.append("payment[cashAmount]", String(cashAmountNum));
      fd.append("payment[upiAmount]", String(upiAmountNum));
      fd.append("payment[bankAmount]", String(bankAmountNum));
      fd.append("payment[loanAmount]", String(loanAmountNum));
      fd.append("payment[blackAmount]", String(blackAmountNum));

      fd.append("payment[financeCompany]", formData.financeCompany || "");
      fd.append(
        "payment[upiTransactionId]",
        formData.upiTransactionId || ""
      );

      fd.append(
        "payment[bankTransactionId]",
        formData.bankTransactionId || ""
      );
      fd.append("payment[notes]", formData.paymentNotes || "");

      fd.append("payment[cashPaidAmount]", formData.cashPaidAmount || "0");
      fd.append("payment[upiPaidAmount]", formData.upiPaidAmount || "0");
      fd.append("payment[bankPaidAmount]", formData.bankPaidAmount || "0");
      fd.append("payment[loanPaidAmount]", formData.loanPaidAmount || "0");
      fd.append("payment[blackPaidAmount]", formData.blackPaidAmount || "0");

      // -------- FILE FIELDS (CRITICAL) --------
      if (formData.buyerAadhaarPhoto)
        fd.append("buyerAadhaarPhoto", formData.buyerAadhaarPhoto);

      if (formData.buyerPANPhoto)
        fd.append("buyerPANPhoto", formData.buyerPANPhoto);

      if (formData.buyerPhoto) fd.append("buyerPhoto", formData.buyerPhoto);

      if (formData.form29) fd.append("form29", formData.form29);
      if (formData.form30) fd.append("form30", formData.form30);
      if (formData.form28) fd.append("form28", formData.form28);
      if (formData.form35) fd.append("form35", formData.form35);

      fd.append(
        "rtoAndInsurance",
        JSON.stringify({
          rcTransferStatus: formData.rcTransferStatus,
          rcTransferDate: formData.rcTransferDate,
          newOwnerName: formData.newOwnerName,
          rcTransferCharges: formData.rcTransferCharges,

          rtoChange: formData.rtoChange,
          oldRto: formData.oldRto,
          newRto: formData.newRto,
          rtoCharges: formData.rtoCharges,

          insuranceStatus: formData.insuranceStatus,
          insuranceCompany: formData.insuranceCompany,
          policyNumber: formData.policyNumber,
          insuranceCharges: formData.insuranceCharges,
        }),
      );

      fd.append(
        "extraAdminExpenses",
        JSON.stringify(
          formData.extraAdminExpenses.filter((e) => e.label && e.amount),
        ),
      );

      const cleanedExtraExpenses = formData.extraAdminExpenses.filter(
        (e) => e.label.trim() && Number(e.amount) > 0,
      );

      fd.append("extraAdminExpensesJson", JSON.stringify(cleanedExtraExpenses));

      // ================= API CALL =================
      await api.put(`/admin/mark-sold/${car._id}`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onSuccess()
      onClose();
    } catch (err: any) {
      console.error("❌ Failed to mark car as sold", err);
      setError(err.response?.data?.message || "Failed to mark car as sold");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 actual cash received now

  const rcCost = Number(formData.rcTransferCharges || 0);
  const rtoCost = Number(formData.rtoCharges || 0);
  const insuranceCost = Number(formData.insuranceCharges || 0);

  const extraAdminCost = formData.extraAdminExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0,
  );

  const totalExtraCost = rcCost + rtoCost + insuranceCost + extraAdminCost;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-3xl h-[90vh] flex flex-col shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-2xl font-bold">Mark Car as SOLD</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {fetching && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading car details...</p>
            </div>
          )}

          {!fetching && (
            <>
              {/* CAR DETAILS SUMMARY */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">Car Details</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Brand & Variant</p>
                    <p className="font-semibold">
                      {car.brand}
                      {car.variant ? ` ${car.variant}` : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Year</p>
                    <p className="font-semibold">{car.year || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-gray-600">KM Driven</p>
                    <p className="font-semibold">
                      {car.kmDriven
                        ? `${car.kmDriven.toLocaleString()} km`
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Transmission</p>
                    <p className="font-semibold">{car.transmission || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Registration Number</p>
                    <p className="font-semibold">
                      {car.registrationNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fuel Type</p>
                    <p className="font-semibold">{car.fuelType || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-gray-600">Selling Price</p>
                    <p className="font-semibold text-green-600">
                      ₹{car.adminSellingPrice?.toLocaleString() || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-semibold">{car.status}</p>
                  </div>
                </div>

                {/* OPTIONAL EXTRA DETAILS */}
                {car.condition && (
                  <div className="pt-2 text-sm">
                    <p className="text-gray-600">Condition</p>
                    <p className="font-medium">{car.condition}</p>
                  </div>
                )}

                {/* CAR IMAGE */}
                {car.images?.length > 0 && (
                  <div className="mt-4">
                    <img
                      src={car.images[0]}
                      alt={`${car.brand}${car.variant ? ` ${car.variant}` : ""}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* CAR FEATURE  */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">Car Features</h3>

                <div className="rounded-xl border bg-muted/20 p-4 md:p-5">
                  {/* <AddMoreFeature /> */}

                  {/* ================= FEATURES ================= */}
                  <section className="py-6">
                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                      <h2 className="text-xl font-semibold mb-6 border-b pb-2">
                        Car Features
                      </h2>

                      {car.features ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Hum categories ko iterate karenge jo backend se aa rahi hain */}
                          {Object.entries(car.features).map(
                            ([category, list]: any) => {
                              // Agar category "custom" hai ya list empty hai toh skip kar sakte ho
                              if (!Array.isArray(list) || list.length === 0)
                                return null;

                              return (
                                <div key={category} className="space-y-3">
                                  {/* Category Name ko capitalize kar rahe hain (e.g. comfort -> Comfort) */}
                                  <h3 className="font-bold text-gray-700 capitalize flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    {category.replace(/([A-Z])/g, " $1").trim()}
                                  </h3>

                                  <ul className="grid grid-cols-1 gap-2">
                                    {list.map((item: string, index: number) => (
                                      <li
                                        key={index}
                                        className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
                                      >
                                        <span className="mr-2 text-green-500">
                                          ✓
                                        </span>
                                        {/* camelCase ko space mein convert karne ke liye (e.g. airConditioner -> Air Conditioner) */}
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
                        <p className="text-gray-500 italic text-center py-4">
                          No features available for this car.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* SELLER DETAILS */}
              {car.seller && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-lg">Seller Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-semibold">
                        {car.seller.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-semibold">
                        {car.seller.phone || "N/A"}
                      </p>
                    </div>
                    {car.seller.altPhone && (
                      <div>
                        <p className="text-gray-600">Alt Phone</p>
                        <p className="font-semibold">{car.seller.altPhone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-semibold text-xs">
                        {car.seller.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">City</p>
                      <p className="font-semibold">
                        {car.seller.city || "N/A"}
                      </p>
                    </div>
                    {car.seller.area && (
                      <div>
                        <p className="text-gray-600">Area</p>
                        <p className="font-semibold">{car.seller.area}</p>
                      </div>
                    )}
                    {car.sellerPrice && (
                      <div>
                        <p className="text-gray-600">Expected Price</p>
                        <p className="font-semibold text-blue-600">
                          ₹{car.sellerPrice.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">RC Owner</p>
                      <p className="font-semibold">
                        {car.rcDetails?.rcOwner === "yes" ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">RC Owner Name</p>
                      <p className="font-semibold">
                        {car.rcDetails?.rcOwner === "yes"
                          ? car.seller.name || "N/A"
                          : car.rcDetails?.rcOwnerName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SELLER DOCUMENTS */}
              {car.sellerDocuments?.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">Seller Documents</h3>

                  {car.sellerDocuments.map((doc: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <p className="font-medium text-sm">{doc.label}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {doc.fileUrls.map((url: string, idx: number) => {
                          const isPdf = url.toLowerCase().endsWith(".pdf");

                          return (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative border rounded-lg overflow-hidden bg-white hover:shadow-md transition"
                            >
                              {/* IMAGE THUMBNAIL */}
                              {!isPdf ? (
                                <img
                                  src={url}
                                  alt={`${doc.label} ${idx + 1}`}
                                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/200x150?text=No+Preview";
                                  }}
                                />
                              ) : (
                                /* PDF PREVIEW */
                                <div className="flex flex-col items-center justify-center h-28 text-red-600 bg-red-50">
                                  <span className="text-3xl">📄</span>
                                  <span className="text-xs mt-1">PDF File</span>
                                </div>
                              )}

                              {/* OVERLAY */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                                <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                                  Click to view
                                </span>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ================= RC DETAILS ================= */}
              {car.rcDetails && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-lg">RC Details</h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">RC Owner</p>
                      <p className="font-semibold">
                        {car.rcDetails.rcOwner === "yes" ? "Yes" : "No"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">RC Owner Name</p>
                      <p className="font-semibold">
                        {car.rcDetails.rcOwner === "yes"
                          ? car.seller?.name || "N/A"
                          : car.rcDetails.rcOwnerName || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* RC IMAGE */}
                  {car.rcDetails.rcImage && (
                    <div className="pt-3">
                      <p className="text-sm text-gray-600 mb-2">RC Image</p>

                      <a
                        href={car.rcDetails.rcImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-block"
                      >
                        <img
                          src={car.rcDetails.rcImage}
                          alt="RC Document"
                          className="w-48 h-32 object-cover rounded-lg border group-hover:shadow-lg transition"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/300x200?text=No+RC+Image";
                          }}
                        />

                        <p className="text-xs text-blue-600 mt-1 group-hover:underline">
                          Click to view full RC
                        </p>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* BUYER DETAILS FORM */}
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Buyer Details</h3>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form
                  id="markSoldForm"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* ================= BASIC INFO ================= */}
                  <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                    <h4 className="font-medium text-gray-800">
                      Basic Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Buyer Name *
                        </label>
                        <input
                          type="text"
                          name="buyerName"
                          value={formData.buyerName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Buyer Phone *
                        </label>
                        <input
                          type="tel"
                          name="buyerPhone"
                          value={formData.buyerPhone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Buyer Email
                        </label>
                        <input
                          type="email"
                          name="buyerEmail"
                          value={formData.buyerEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Buyer City
                        </label>
                        <input
                          type="text"
                          name="buyerCity"
                          value={formData.buyerCity}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ================= KYC DETAILS ================= */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-4">
                    <h4 className="font-medium text-blue-900">KYC Documents</h4>
                    <p className="text-sm text-blue-800">
                      Upload clear photos of buyer’s identity documents
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* AADHAAR CARD PHOTO */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Aadhaar Card (Front & Back) *
                        </label>
                        <input
                          type="file"
                          name="buyerAadhaarPhoto"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-2 border rounded-lg bg-white"
                          required
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Make sure name & Aadhaar number are clearly visible
                        </p>
                      </div>

                      {/* PAN CARD PHOTO */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          PAN Card Photo *
                        </label>
                        <input
                          type="file"
                          name="buyerPANPhoto"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-2 border rounded-lg bg-white"
                          required
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          PAN number & photo must be readable
                        </p>
                      </div>

                      {/* PASSPORT SIZE PHOTO */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          Passport Size Photo *
                        </label>
                        <input
                          type="file"
                          name="buyerPhoto"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-2 border rounded-lg bg-white"
                          required
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Recent photo of buyer (white background preferred)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ================= RTO DOCUMENTS ================= */}
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl space-y-4">
                    <h4 className="font-medium text-yellow-900">
                      RTO Documents
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Upload required RTO forms signed by buyer & seller
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* FORM 29 */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Form 29 – Notice of Transfer *
                        </label>
                        <input
                          type="file"
                          name="form29"
                          accept="application/pdf,image/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-2 border rounded-lg bg-white"
                          required
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Signed by seller (vehicle transfer notice)
                        </p>
                      </div>

                      {/* FORM 30 */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Form 30 – Application for Transfer *
                        </label>
                        <input
                          type="file"
                          name="form30"
                          accept="application/pdf,image/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-2 border rounded-lg bg-white"
                          required
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Signed by buyer & seller
                        </p>
                      </div>

                      {/* FORM 28 */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Form 28 – NOC (Inter-State Transfer)
                        </label>
                        <input
                          type="file"
                          name="form28"
                          accept="application/pdf,image/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-2 border rounded-lg bg-white"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Required only if car is transferred to another state
                        </p>
                      </div>

                      {/* FORM 35 */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Form 35 – Loan Closure
                        </label>
                        <input
                          type="file"
                          name="form35"
                          accept="application/pdf,image/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-2 border rounded-lg bg-white"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Required if car was under bank / finance loan
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ================= RC / RTO / INSURANCE ================= */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-5">
                    <h4 className="font-semibold text-slate-900 text-lg">
                      🧾 RC, RTO & Insurance Details
                    </h4>

                    {/* RC TRANSFER */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-slate-800">
                        RC Transfer
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                          className="border rounded-lg px-3 py-2"
                          value={formData.rcTransferStatus}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              rcTransferStatus: e.target.value,
                            }))
                          }
                        >
                          <option value="PENDING">Pending</option>
                          <option value="DONE">Completed</option>
                        </select>

                        <input
                          type="date"
                          value={formData.rcTransferDate}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              rcTransferDate: e.target.value,
                            }))
                          }
                          className="border rounded-lg px-3 py-2"
                        />

                        <input
                          placeholder="New Owner Name"
                          value={formData.newOwnerName}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              newOwnerName: e.target.value,
                            }))
                          }
                          className="border rounded-lg px-3 py-2"
                        />

                        <input
                          type="number"
                          placeholder="RC Transfer Charges"
                          value={formData.rcTransferCharges}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              rcTransferCharges: e.target.value,
                            }))
                          }
                          className="border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>

                    {/* RTO CHANGE */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-slate-800">
                        RTO / Number Change
                      </h5>

                      <select
                        className="border rounded-lg px-3 py-2"
                        value={formData.rtoChange}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            rtoChange: e.target.value,
                          }))
                        }
                      >
                        <option value="NO">No RTO Change</option>
                        <option value="YES">Yes, RTO Changed</option>
                      </select>

                      {formData.rtoChange === "YES" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            placeholder="Old RTO"
                            value={formData.oldRto}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                oldRto: e.target.value,
                              }))
                            }
                            className="border rounded-lg px-3 py-2"
                          />

                          <input
                            placeholder="New RTO"
                            value={formData.newRto}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                newRto: e.target.value,
                              }))
                            }
                            className="border rounded-lg px-3 py-2"
                          />

                          <input
                            type="number"
                            placeholder="RTO Charges"
                            value={formData.rtoCharges}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                rtoCharges: e.target.value,
                              }))
                            }
                            className="border rounded-lg px-3 py-2"
                          />
                        </div>
                      )}
                    </div>

                    {/* INSURANCE */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-slate-800">Insurance</h5>

                      <select
                        className="border rounded-lg px-3 py-2"
                        value={formData.insuranceStatus}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            insuranceStatus: e.target.value,
                          }))
                        }
                      >
                        <option value="PENDING">Pending</option>
                        <option value="TRANSFERRED">Transferred</option>
                        <option value="NEW">New Insurance</option>
                      </select>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          placeholder="Insurance Company"
                          value={formData.insuranceCompany}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              insuranceCompany: e.target.value,
                            }))
                          }
                          className="border rounded-lg px-3 py-2"
                        />

                        <input
                          placeholder="Policy Number"
                          value={formData.policyNumber}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              policyNumber: e.target.value,
                            }))
                          }
                          className="border rounded-lg px-3 py-2"
                        />

                        <input
                          type="number"
                          placeholder="Insurance Charges"
                          value={formData.insuranceCharges}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              insuranceCharges: e.target.value,
                            }))
                          }
                          className="border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ================= SALE & PAYMENT INFORMATION ================= */}
                  <div className="bg-green-50 border border-green-200 p-5 rounded-xl space-y-5">
                    <h4 className="font-semibold text-green-900 text-lg">
                      💰 Sale & Payment Information
                    </h4>

                    {/* SOLD PRICE & DATE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Sold Price *
                        </label>
                        <input
                          type="number"
                          name="soldPrice"
                          value={formData.soldPrice}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Sale Date
                        </label>
                        <input
                          type="date"
                          name="saleDate"
                          value={formData.saleDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    {/* OVERALL PAYMENT TYPE */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Overall Payment Type
                      </label>

                      <select
                        value={formData.paymentType}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentType: e.target.value,

                            // Reset all payment fields when payment type changes
                            cashAmount: "",
                            upiAmount: "",
                            bankAmount: "",
                            loanAmount: "",
                            blackAmount: "",

                            financeCompany: "",
                            upiTransactionId: "",
                            bankTransactionId: "",
                            paymentNotes: "",
                          }))
                        }
                        className="w-full px-4 py-2 border rounded-lg bg-white"
                      >
                        {/* Single Modes */}
                        <option value="CASH">Cash Only</option>
                        <option value="UPI">UPI Only</option>
                        <option value="BANK">Bank Transfer Only</option>
                        <option value="LOAN">Loan Only</option>

                        {/* Loan + White Money */}
                        <option value="LOAN_CASH">Loan + Cash</option>
                        <option value="LOAN_UPI">Loan + UPI</option>
                        <option value="LOAN_BANK">Loan + Bank Transfer</option>

                        {/* Loan + Black */}
                        <option value="LOAN_BLACK">Loan + Unrecorded Cash</option>

                        {/* Loan + White + Black */}
                        <option value="LOAN_CASH_BLACK">
                          Loan + Cash + Unrecorded Cash
                        </option>
                        <option value="LOAN_UPI_BLACK">
                          Loan + UPI + Unrecorded Cash
                        </option>
                        <option value="LOAN_BANK_BLACK">
                          Loan + Bank Transfer + Unrecorded Cash
                        </option>

                        {/* Without Loan */}
                        <option value="CASH_BLACK">
                          Cash + Unrecorded Cash
                        </option>
                        <option value="UPI_BLACK">
                          UPI + Unrecorded Cash
                        </option>
                        <option value="BANK_BLACK">
                          Bank Transfer + Unrecorded Cash
                        </option>
                      </select>
                    </div>

                    {/* PAYMENT DETAILS */}
                    <div className="bg-white p-4 rounded-lg border space-y-4">
                      <h5 className="font-medium text-gray-800">
                        Payment Details
                      </h5>

                      {/* Helper function for each payment card */}
                      {/*
    For each payment method:
    - Main input (e.g. cashAmount) is treated as Total Amount
    - Paid Amount is editable
    - Remaining = Total - Paid
  */}

                      <div className="space-y-4">

                        {/* ================= CASH PAYMENT ================= */}
                        {(formData.paymentType === "CASH" ||
                          formData.paymentType.includes("CASH")) && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                              <h6 className="font-medium text-green-900">
                                💵 Cash Payment
                              </h6>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Total Amount */}
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Total Amount
                                  </label>
                                  <input
                                    type="number"
                                    name="cashAmount"
                                    value={formData.cashAmount}
                                    onChange={handleChange}
                                    placeholder="Enter total cash amount"
                                    className="w-full px-4 py-2 border rounded-lg"
                                  />
                                </div>

                                {/* Paid Amount */}
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Paid Amount
                                  </label>
                                  <input
                                    type="number"
                                    name="cashPaidAmount"
                                    value={(formData as any).cashPaidAmount || ""}
                                    onChange={handleChange}
                                    placeholder="Enter paid cash amount"
                                    className="w-full px-4 py-2 border rounded-lg"
                                  />
                                </div>

                                {/* Remaining Amount */}
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium mb-1">
                                    Remaining Amount
                                  </label>
                                  <input
                                    type="number"
                                    value={
                                      Math.max(
                                        0,
                                        Number(formData.cashAmount || 0) -
                                        Number((formData as any).cashPaidAmount || 0)
                                      )
                                    }
                                    readOnly
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                        {/* ================= UPI PAYMENT ================= */}
                        {(formData.paymentType === "UPI" ||
                          formData.paymentType.includes("UPI")) && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-4">
                              <h6 className="font-medium text-indigo-900">
                                📱 UPI Payment
                              </h6>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Total Amount
                                  </label>
                                  <input
                                    type="number"
                                    name="upiAmount"
                                    value={formData.upiAmount}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Paid Amount
                                  </label>
                                  <input
                                    type="number"
                                    name="upiPaidAmount"
                                    value={(formData as any).upiPaidAmount || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Transaction ID
                                  </label>
                                  <input
                                    type="text"
                                    name="upiTransactionId"
                                    value={formData.upiTransactionId}
                                    onChange={handleChange}
                                    placeholder="Enter UPI transaction ID"
                                    className="w-full px-4 py-2 border rounded-lg"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Remaining Amount
                                  </label>
                                  <input
                                    type="number"
                                    value={
                                      Math.max(
                                        0,
                                        Number(formData.upiAmount || 0) -
                                        Number((formData as any).upiPaidAmount || 0)
                                      )
                                    }
                                    readOnly
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                        {/* ================= BANK PAYMENT ================= */}
                        {(formData.paymentType === "BANK" ||
                          formData.paymentType.includes("BANK")) && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                              <h6 className="font-medium text-blue-900">
                                🏦 Bank Transfer
                              </h6>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Total Amount
                                  </label>
                                  <input
                                    type="number"
                                    name="bankAmount"
                                    value={formData.bankAmount}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Paid Amount
                                  </label>
                                  <input
                                    type="number"
                                    name="bankPaidAmount"
                                    value={(formData as any).bankPaidAmount || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Transaction ID
                                  </label>
                                  <input
                                    type="text"
                                    name="bankTransactionId"
                                    value={formData.bankTransactionId}
                                    onChange={handleChange}
                                    placeholder="Enter bank reference number"
                                    className="w-full px-4 py-2 border rounded-lg"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Remaining Amount
                                  </label>
                                  <input
                                    type="number"
                                    value={
                                      Math.max(
                                        0,
                                        Number(formData.bankAmount || 0) -
                                        Number((formData as any).bankPaidAmount || 0)
                                      )
                                    }
                                    readOnly
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                        {/* ================= LOAN PAYMENT ================= */}
                        {formData.paymentType.includes("LOAN") && (
                          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 space-y-4">
                            <h6 className="font-medium text-cyan-900">
                              🏦 Loan Details
                            </h6>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Total Amount
                                </label>
                                <input
                                  type="number"
                                  name="loanAmount"
                                  value={formData.loanAmount}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 border rounded-lg"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Paid Amount
                                </label>
                                <input
                                  type="number"
                                  name="loanPaidAmount"
                                  value={formData.loanPaidAmount}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 border rounded-lg"
                                  placeholder="Enter paid amount"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Finance Company
                                </label>
                                <input
                                  type="text"
                                  name="financeCompany"
                                  value={formData.financeCompany}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 border rounded-lg"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Remaining Amount
                                </label>
                                <input
                                  type="number"
                                  value={
                                    Math.max(
                                      0,
                                      Number(formData.loanAmount || 0) -
                                      Number((formData as any).loanPaidAmount || 0)
                                    )
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ================= UNRECORDED CASH ================= */}
                        {formData.paymentType.includes("BLACK") && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
                            <h6 className="font-medium text-orange-900">
                              💵 Unrecorded Cash
                            </h6>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Total Amount
                                </label>
                                <input
                                  type="number"
                                  name="blackAmount"
                                  value={formData.blackAmount}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 border rounded-lg"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Paid Amount
                                </label>
                                <input
                                  type="number"
                                  name="blackPaidAmount"
                                  value={(formData as any).blackPaidAmount || ""}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 border rounded-lg"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                  Remaining Amount
                                </label>
                                <input
                                  type="number"
                                  value={
                                    Math.max(
                                      0,
                                      Number(formData.blackAmount || 0) -
                                      Number((formData as any).blackPaidAmount || 0)
                                    )
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PAYMENT NOTES */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Payment Notes
                        </label>
                        <textarea
                          name="paymentNotes"
                          value={formData.paymentNotes}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Optional notes about the payment"
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    {/* PAYMENT SUMMARY */}
                    <div className="bg-white p-4 rounded-lg border text-sm space-y-2">
                      {/* Sold Price */}
                      <div className="flex justify-between">
                        <span>Total Sale Amount</span>
                        <span className="font-semibold">
                          ₹{soldPriceNum.toLocaleString()}
                        </span>
                      </div>

                      {/* Planned Payment Breakup Total */}
                      <div className="flex justify-between">
                        <span>Total Planned Amount</span>
                        <span
                          className={`font-semibold ${isPaymentBalanced
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                        >
                          ₹{totalPlannedAmount.toLocaleString()}
                        </span>
                      </div>

                      {/* Paid Amount */}
                      <div className="flex justify-between">
                        <span>Total Paid Now</span>
                        <span className="text-green-600 font-medium">
                          ₹{totalPaidNow.toLocaleString()}
                        </span>
                      </div>

                      {/* Remaining */}
                      <div className="flex justify-between font-semibold">
                        <span>Remaining Amount</span>
                        <span
                          className={
                            totalRemaining > 0
                              ? "text-red-600"
                              : "text-green-700"
                          }
                        >
                          ₹{totalRemaining.toLocaleString()}
                        </span>
                      </div>

                      {/* Validation Message */}
                      {!isPaymentBalanced && (
                        <div className="pt-2 mt-2 border-t text-xs text-red-600">
                          Payment breakup does not match the
                          Total Sale Amount.

                          <div className="mt-1">
                            Difference: ₹
                            {Math.abs(paymentGap).toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* Success Message */}
                      {isPaymentBalanced && soldPriceNum > 0 && (
                        <div className="pt-2 mt-2 border-t text-xs text-green-600">
                          Payment breakup matches the Total Sale
                          Amount.
                        </div>
                      )}
                    </div>
                  </div>
                  {/* ADMIN EXPENSES */}
                  {(
                    (car.adminExpenses?.length || 0) > 0 ||
                    (formData.extraAdminExpenses?.length || 0) > 0
                  ) && (
                      <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg space-y-3">

                        <h3 className="font-semibold text-lg">
                          Admin Expenses
                        </h3>

                        {/* NORMAL ADMIN EXPENSES */}
                        {car.adminExpenses?.map(
                          (exp: any, i: number) => (
                            <div
                              key={`admin-${i}`}
                              className="flex justify-between text-sm"
                            >
                              <span>{exp.label}</span>

                              <span className="font-semibold text-purple-700">
                                ₹{Number(exp.amount).toLocaleString()}
                              </span>
                            </div>
                          )
                        )}

                        {/* EXTRA ADMIN EXPENSES */}
                        {formData.extraAdminExpenses
                          ?.filter(
                            (exp) =>
                              exp.label &&
                              exp.amount
                          )
                          .map((exp, i) => (
                            <div
                              key={`extra-${i}`}
                              className="flex justify-between text-sm border-t pt-2"
                            >
                              <span>
                                {exp.label}

                                <span className="ml-2 text-xs text-gray-500">
                                  (Extra)
                                </span>
                              </span>

                              <span className="font-semibold text-red-600">
                                ₹{Number(exp.amount).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        {/* TOTAL */}
                        <div className="border-t pt-3 flex justify-between">

                          <span className="font-semibold">
                            Total Expenses
                          </span>

                          <span className="font-bold text-red-600">
                            ₹{(
                              (car.adminExpenses || []).reduce(
                                (sum: number, exp: any) =>
                                  sum + (Number(exp.amount) || 0),
                                0
                              ) +

                              (formData.extraAdminExpenses || []).reduce(
                                (sum: number, exp: any) =>
                                  sum + (Number(exp.amount) || 0),
                                0
                              )
                            ).toLocaleString()}
                          </span>

                        </div>

                      </div>
                    )}

                  {/* EXTRA ADMIN EXPENSES */}
                  <div className="bg-gray-50 border p-4 rounded-lg space-y-3">

                    <h4 className="font-semibold">
                      Add Extra Admin Expense
                    </h4>

                    {/* INPUT ROWS */}
                    {formData.extraAdminExpenses.map((exp, i) => (
                      <div
                        key={i}
                        className="flex gap-3"
                      >

                        <input
                          placeholder="Expense label"
                          className="border rounded px-3 py-2 flex-1"
                          value={exp.label}
                          onChange={(e) => {
                            const copy = [
                              ...formData.extraAdminExpenses,
                            ];

                            copy[i].label =
                              e.target.value;

                            setFormData((p) => ({
                              ...p,
                              extraAdminExpenses: copy,
                            }));
                          }}
                        />

                        <input
                          type="number"
                          placeholder="Amount"
                          className="border rounded px-3 py-2 w-32"
                          value={exp.amount}
                          onChange={(e) => {
                            const copy = [
                              ...formData.extraAdminExpenses,
                            ];

                            copy[i].amount =
                              e.target.value;

                            setFormData((p) => ({
                              ...p,
                              extraAdminExpenses: copy,
                            }));
                          }}
                        />

                      </div>
                    ))}

                    {/* ADD BUTTON */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          extraAdminExpenses: [
                            ...p.extraAdminExpenses,
                            {
                              label: "",
                              amount: "",
                            },
                          ],
                        }))
                      }
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Add Expense
                    </button>

                  </div>
                  <div className="bg-red-50 border p-3 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span>Total Post-Sale Expenses</span>
                      <span className="font-semibold text-red-600">
                        ₹{totalExtraCost.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* ================= ACTIONS ================= */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white"
                    >
                      {loading ? "Processing..." : "Confirm SOLD"}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkSoldModal;