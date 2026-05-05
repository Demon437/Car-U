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
    cashPaidNow: "",
    loanPaidNow: "",
    cashPaymentMode: "CASH",

    soldPrice: "",
    saleDate: new Date().toISOString().split("T")[0],

    // 🔥 PAYMENT INFO (NEW)
    paymentType: "CASH", // CASH | UPI | BANK | LOAN
    paidAmount: "",
    loanAmount: "",
    financeCompany: "",

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
        const normalized = normalizeCar(res.data);
        setCar(normalized);
        console.log("Fetched car details for marking sold:", res);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= PAYMENT CALCULATIONS =================
  const soldPriceNum = Number(formData.soldPrice || 0);

  // Cash / UPI / Bank
  const cashPaidNum = Number(formData.paidAmount || 0);

  // Loan
  const loanTotalNum = Number(formData.loanAmount || 0);
  const loanPaidNowNum = Number(formData.loanPaidNow || 0);

  // 🔥 loan part
  const loanAmountNum =
    formData.paymentType === "LOAN" ? Number(formData.loanAmount || 0) : 0;

  // Calculations
  const totalPaidNow = cashPaidNum + loanPaidNowNum;
  const totalRemaining = soldPriceNum - totalPaidNow;

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

    if (cashPaidNum + loanPaidNowNum > soldPriceNum) {
      setError("Cash + Loan cannot exceed sold price");
      return;
    }

    if (formData.paymentType === "LOAN" && !loanAmountNum) {
      setError("Loan amount is required");
      return;
    }

    if (formData.paymentType !== "LOAN" && !cashPaidNum) {
      setError("Paid amount is required");
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

      fd.append("payment[type]", formData.paymentType);
      fd.append("payment[amount]", String(cashPaidNum));

      fd.append("payment[cashPaymentMode]", formData.cashPaymentMode);

      fd.append("sale[totalAmount]", String(soldPriceNum));
      fd.append("sale[paidAmount]", String(totalPaidNow));
      fd.append("sale[remainingAmount]", String(totalRemaining));

      fd.append("payment[cashPaid]", String(cashPaidNum));
      fd.append("payment[loanTotal]", String(loanTotalNum));
      fd.append("payment[loanPaidNow]", String(loanPaidNowNum));
      fd.append("payment[financeCompany]", formData.financeCompany || "");

      if (formData.paymentType !== "LOAN" && cashPaidNum === 0) {
        setError("Paid amount is required");
        return;
      }

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
                          setFormData((p) => ({
                            ...p,
                            paymentType: e.target.value,
                            paidAmount: "",
                            loanAmount: "",
                            loanPaidNow: "",
                            cashPaymentMode:
                              e.target.value === "CASH" ||
                              e.target.value === "UPI" ||
                              e.target.value === "BANK"
                                ? e.target.value
                                : "CASH", // LOAN default
                          }))
                        }
                        className="w-full px-4 py-2 border rounded-lg bg-white"
                      >
                        <option value="CASH">Cash Only</option>
                        <option value="UPI">UPI Only</option>
                        <option value="BANK">Bank Transfer Only</option>
                        <option value="LOAN">Loan + Cash / UPI / Bank</option>
                      </select>
                    </div>

                    {/* SINGLE PAYMENT (NON-LOAN) */}
                    {formData.paymentType !== "LOAN" && (
                      <div className="bg-white p-4 rounded-lg border space-y-2">
                        <label className="block text-sm font-medium">
                          Amount Received from Buyer
                        </label>
                        <input
                          type="number"
                          name="paidAmount"
                          value={formData.paidAmount}
                          onChange={handleChange}
                          placeholder="Enter amount received"
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                    )}

                    {/* LOAN FLOW */}
                    {formData.paymentType === "LOAN" && (
                      <>
                        {/* LOAN DETAILS */}
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-4">
                          <h5 className="font-medium text-blue-900">
                            🏦 Loan Details
                          </h5>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Total Loan Amount
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
                                Loan Amount Disbursed Now
                              </label>
                              <input
                                type="number"
                                name="loanPaidNow"
                                value={formData.loanPaidNow}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                              />
                            </div>

                            <div className="md:col-span-2">
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
                          </div>
                        </div>

                        {/* BUYER PAYMENT MODE (ONLY WHEN LOAN) */}
                        <div className="bg-white p-4 rounded-lg border space-y-3">
                          <h5 className="font-medium text-gray-800">
                            🟢 Buyer Paid (Non-Loan Part)
                          </h5>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Buyer Payment Mode
                            </label>
                            <select
                              value={formData.cashPaymentMode}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  cashPaymentMode: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2 border rounded-lg bg-white"
                            >
                              <option value="CASH">Cash</option>
                              <option value="UPI">UPI</option>
                              <option value="BANK">Bank Transfer</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Amount Received from Buyer
                            </label>
                            <input
                              type="number"
                              name="paidAmount"
                              value={formData.paidAmount}
                              onChange={handleChange}
                              placeholder="Buyer paid amount"
                              className="w-full px-4 py-2 border rounded-lg"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* PAYMENT SUMMARY */}
                    <div className="bg-white p-4 rounded-lg border text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Total Sale Amount</span>
                        <span className="font-semibold">
                          ₹{soldPriceNum.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Total Paid Now</span>
                        <span className="text-green-600 font-medium">
                          ₹{totalPaidNow.toLocaleString()}
                        </span>
                      </div>

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
                    </div>
                  </div>

                  {/* ADMIN EXPENSES */}
                  {car.adminExpenses?.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg space-y-2">
                      <h3 className="font-semibold text-lg">Admin Expenses</h3>
                      {car.adminExpenses.map((exp: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{exp.label}</span>
                          <span className="font-semibold text-purple-700">
                            ₹{exp.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* EXTRA ADMIN EXPENSES */}
                  <div className="bg-gray-50 border p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold">Additional Admin Expenses</h4>

                    {formData.extraAdminExpenses.map((exp, i) => (
                      <div key={i} className="flex gap-3">
                        <input
                          placeholder="Expense label"
                          className="border rounded px-3 py-2 flex-1"
                          value={exp.label}
                          onChange={(e) => {
                            const copy = [...formData.extraAdminExpenses];
                            copy[i].label = e.target.value;
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
                            const copy = [...formData.extraAdminExpenses];
                            copy[i].amount = e.target.value;
                            setFormData((p) => ({
                              ...p,
                              extraAdminExpenses: copy,
                            }));
                          }}
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          extraAdminExpenses: [
                            ...p.extraAdminExpenses,
                            { label: "", amount: "" },
                          ],
                        }))
                      }
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Add expense
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
