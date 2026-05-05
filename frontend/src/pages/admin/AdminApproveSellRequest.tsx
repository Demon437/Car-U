import React, { useEffect, useState } from "react";
import api from "@/api/api";
import { uploadFile } from "../../utils/uploadFile";
import AddMoreFeature from "./AddMoreFeature";

/* ================= TYPES ================= */

interface Seller {
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  city: string;
  area?: string;
}

interface RCDetails {
  rcOwner: "yes" | "no";
  rcOwnerName?: string;
  rcImage?: string;
}

interface AdminExpense {
  label: string;
  amount: string;
}

interface SellerDocument {
  label: string;
  files: File[];
  previewUrls: string[];
  fileUrls: string[];
}

interface Car {
  brand: string;
  registrationNumber?: string;
  year: number;
  variant?: string;
  transmission?: string;
  fuelType: string;
  kmDriven: number;
  condition?: string;
  images: string[];

  videos?: string[];

  features?: CarFeatures;
}

interface CarFeatures {
  entertainment: string[];
  safety: string[];
  comfort: string[];
  interiorExterior: string[];
  custom: string[];
}

interface SellRequest {
  _id: string;

  // ✅ normalized fields (USED IN UI)
  seller: Seller;
  car: Car;

  rcDetails: RCDetails;

  sellerPrice: number;
  adminSellingPrice?: number;

  status: "PENDING" | "APPROVED" | "REJECTED" | "SOLD";
  createdAt: string;
}


interface Props {
  requestId: string;
  onClose: () => void;
}

/* ================= COMPONENT ================= */

const AdminApproveSellRequest: React.FC<Props> = ({ requestId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminPrice, setAdminPrice] = useState("");
  const [data, setData] = useState<SellRequest | null>(null);
  console.log("DATA 👉", data);

  const [error, setError] = useState("");
  const [expenses, setExpenses] = useState<AdminExpense[]>([
    { label: "DP", amount: "" },
  ]);
  const [expenseOptions, setExpenseOptions] = useState<string[]>([
  ]);

  const [documents, setDocuments] = useState<SellerDocument[]>([
    {
      label: "RC Original",
      files: [],
      fileUrls: [],
      previewUrls: [],
    },
  ]);

  const [documentOptions, setDocumentOptions] = useState<string[]>([
  ]);
  const [features, setFeatures] = useState<CarFeatures>({
    entertainment: [],
    safety: [],
    comfort: [],
    interiorExterior: [],
    custom: [],
  });

  /* ================= FETCH REQUEST ================= */

  useEffect(() => {
    fetchRequest();
    fetchDropdownOptions();   // 🔥 ADD THIS
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      console.log("📥 Fetching sell request:", requestId);

      const res = await api.get(`/admin/sell-requests/${requestId}`);
      setData(res.data);

      // ✅ 🔥 NORMALIZATION (YAHI IMPORTANT HAI)
      const normalizedData: SellRequest = {
        _id: res.data._id,

        seller: res.data.contact,        // 🔥 contact → seller
        car: res.data.carDetails,         // 🔥 carDetails → car

        rcDetails: res.data.rcDetails,
        sellerPrice: res.data.expectedPrice,
        adminSellingPrice: res.data.adminSellingPrice,
        status: res.data.status,
        createdAt: res.data.createdAt,
      };

      setData(normalizedData);
      setFeatures({
        entertainment: Array.isArray(normalizedData.car.features?.entertainment)
          ? normalizedData.car.features!.entertainment
          : [],
        safety: Array.isArray(normalizedData.car.features?.safety)
          ? normalizedData.car.features!.safety
          : [],
        comfort: Array.isArray(normalizedData.car.features?.comfort)
          ? normalizedData.car.features!.comfort
          : [],
        interiorExterior: Array.isArray(
          normalizedData.car.features?.interiorExterior
        )
          ? normalizedData.car.features!.interiorExterior
          : [],
        custom: Array.isArray(normalizedData.car.features?.custom)
          ? normalizedData.car.features!.custom
          : [],
      });

      console.log("✅ Sell request loaded:", res.data);
    } catch (err) {
      console.error("❌ Fetch sell request error:", err);
      setError("Failed to load sell request");
    } finally {
      setLoading(false);
    }
  };

  /* ================= APPROVE REQUEST ================= */

  const approveRequest = async () => {
    // ✅ strong frontend validation
    if (
      adminPrice === "" ||
      adminPrice === null ||
      isNaN(Number(adminPrice)) ||
      Number(adminPrice) <= 0
    ) {
      alert("Please enter a valid final selling price");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        adminSellingPrice: Number(adminPrice),

        adminExpenses: expenses
          .filter(e => e.label && e.amount)
          .map(e => ({
            label: e.label,
            amount: Number(e.amount),
          })),

        sellerDocuments: documents
          .filter(d => d.label && d.fileUrls.length > 0)
          .map(d => ({
            label: d.label,
            fileUrls: d.fileUrls,
          })),
        features,

      };
      console.log("🔥 APPROVE REQUEST PAYLOAD:", payload);

      const res = await api.put(`/admin/approve/${requestId}`, payload);

      console.log("✅ APPROVE RESPONSE:", res.data);

      alert("Sell request approved successfully ✅");

      onClose(); // close modal & refresh parent
    } catch (err: any) {
      console.error("❌ APPROVE ERROR:", err.response?.data || err);

      alert(
        err.response?.data?.message || "Approval failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  //  DROP DOWN API FUNCTION
  const fetchDropdownOptions = async () => {
    try {
      const expenseRes = await api.get("/admin/expense-options");
      setExpenseOptions(expenseRes.data || []);
      console.log("Expense options:", expenseRes.data);


      const documentRes = await api.get("/admin/document-options");
      setDocumentOptions(documentRes.data || []);
      console.log("Document options:", documentOptions)
    } catch (err) {
      console.error("❌ Dropdown fetch error", err);
    }
  };

  const addExpenseRow = () => {
    setExpenses((prev) => [...prev, { label: "", amount: "" }]);
  };

  const updateExpense = (
    index: number,
    field: "label" | "amount",
    value: string
  ) => {
    setExpenses((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const removeExpense = (index: number) => {
    setExpenses((prev) => prev.filter((_, i) => i !== index));
  };

  const totalExpense = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  const totalSellablePrice = (data?.sellerPrice || 0) + totalExpense;

  const addDocumentRow = () => {
    setDocuments(prev => [
      ...prev,
      {
        label: "",
        files: [],
        fileUrls: [],
        previewUrls: [],
      },
    ]);
  };

  const updateDocumentLabel = (index: number, value: string) => {
    setDocuments((prev) => {
      const copy = [...prev];
      copy[index].label = value;
      return copy;
    });

    // auto-learn new type
    const cleaned = value.trim();
    if (
      cleaned.length > 1 &&
      !documentOptions.some(
        (opt) => opt.toLowerCase() === cleaned.toLowerCase()
      )
    ) {
      setDocumentOptions((prev) => [...prev, cleaned]);
    }
  };

  const updateDocumentFile = async (
    index: number,
    files: FileList
  ) => {
    try {
      const uploadedUrls: string[] = [];
      const previews: string[] = [];

      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
        previews.push(URL.createObjectURL(file));
      }

      setDocuments(prev =>
        prev.map((doc, i) =>
          i === index
            ? {
              ...doc,
              files: [...doc.files, ...Array.from(files)],
              fileUrls: [...doc.fileUrls, ...uploadedUrls],
              previewUrls: [...doc.previewUrls, ...previews],
            }
            : doc
        )
      );
    } catch (err) {
      console.error("❌ Document upload failed", err);
      alert("Document upload failed");
    }
  };


  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">
            Loading request details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-white rounded-xl">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            {error || "No data found"}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="fixed inset-0 bg-white overflow-y-auto p-4 sm:p-6 md:p-8 md:static md:rounded-xl md:ma[90vh]">
      <div className="max-w-4xl mx-auto px-1 sm:px-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
          Approve Sell Request
        </h2>

        <div className="space-y-6 md:space-y-8">
          {/* ================= SELLER DETAILS ================= */}
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Seller Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-gray-700 text-sm md:text-base">
              <p><strong>Name:</strong> {data.seller.name}</p>
              <p><strong>Phone:</strong> {data.seller.phone}</p>

              {data.seller.altPhone && (
                <p><strong>Alt Phone:</strong> {data.seller.altPhone}</p>
              )}
              {data.seller.email && (
                <p><strong>Email:</strong> {data.seller.email}</p>
              )}

              <p><strong>City:</strong> {data.seller.city}</p>
              {data.seller.area && (
                <p><strong>Area:</strong> {data.seller.area}</p>
              )}

              <p><strong>Expected Price:</strong> ₹{data.sellerPrice.toLocaleString()}</p>
              <p><strong>RC Owner:</strong> {data.rcDetails.rcOwner === "yes" ? "Self" : "No"}</p>

              {data.rcDetails.rcOwner === "no" && (
                <p><strong>RC Owner Name:</strong> {data.rcDetails.rcOwnerName}</p>
              )}
            </div>
          </section>

          {/* ================= CAR DETAILS ================= */}
          <section className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-green-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Car Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm md:text-base">
              <p><strong>Brand:</strong> {data.car.brand}</p>
              <p><strong>Year:</strong> {data.car.year}</p>

              {data.car.registrationNumber && (
                <p className="break-all">
                  <strong>Registration No:</strong> {data.car.registrationNumber}
                </p>
              )}

              {data.car.variant && <p><strong>Variant:</strong> {data.car.variant}</p>}
              {data.car.transmission && <p><strong>Transmission:</strong> {data.car.transmission}</p>}
              <p><strong>Fuel:</strong> {data.car.fuelType}</p>
              <p><strong>KMs Driven:</strong> {data.car.kmDriven.toLocaleString()} km</p>

              {data.car.condition && <p><strong>Condition:</strong> {data.car.condition}</p>}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
            <AddMoreFeature features={features} setFeatures={setFeatures} />
          </section>

          {/* ================= PRICES ================= */}
          <div className="grid grid-cols-1 gap-6">
            <section className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                Final Selling Price (Admin)
              </h3>

              <input
                type="number"
                min="1"
                value={adminPrice}
                onChange={(e) => setAdminPrice(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm md:text-base"
              />

              {data.adminSellingPrice && (
                <p className="mt-2 text-green-700 font-semibold text-sm md:text-base">
                  Approved Price: ₹{data.adminSellingPrice.toLocaleString()}
                </p>
              )}
            </section>
          </div>

          {/* ================= CAR IMAGES ================= */}
          <section className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-purple-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Car Images
            </h3>

            {data.car.images?.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto md:grid md:grid-cols-4 md:gap-4">
                {data.car.images.map((img, index) => (
                  <div
                    key={index}
                    className="min-w-[140px] md:min-w-0 border border-gray-300 rounded-lg overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`Car ${index + 1}`}
                      className="w-full h-28 md:h-32 object-cover cursor-pointer"
                      onClick={() => window.open(img, "_blank")}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-gray-500">
                No images uploaded by seller.
              </p>
            )}
          </section>

          {data?.car?.videos && data.car.videos.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Car Videos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.car.videos.map((video, index) => (
                  <video
                    key={index}
                    src={video} // ✅ DIRECT USE
                    controls
                    className="w-full h-48 rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ================= ADMIN EXPENSES ================= */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Admin Cost Breakdown
            </h3>

            <div className="space-y-4">
              {expenses.map((item, index) => (
                <div
                  key={index}
                  className="
          grid grid-cols-1
          sm:grid-cols-5
          gap-3
          items-start sm:items-center
        "
                >
                  {/* Expense label */}
                  <div className="sm:col-span-3">
                    <input
                      list={`expense-options-${index}`}
                      placeholder="Select or type expense (DP, Diesel...)"
                      value={item.label}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateExpense(index, "label", value);

                        const cleaned = value.trim();
                        if (
                          cleaned.length > 1 &&
                          !expenseOptions.some(
                            (opt) => opt.toLowerCase() === cleaned.toLowerCase()
                          )
                        ) {
                          setExpenseOptions((prev) => [...prev, cleaned]);
                        }
                      }}
                      className="
              w-full
              border
              px-3 py-2
              rounded-lg
              text-sm sm:text-base
            "
                    />

                    <datalist id={`expense-options-${index}`}>
                      {expenseOptions.map((opt, i) => (
                        <option key={i} value={opt} />
                      ))}
                    </datalist>
                  </div>

                  {/* Amount */}
                  <div className="sm:col-span-1">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) =>
                        updateExpense(index, "amount", e.target.value)
                      }
                      className="
              w-full
              border
              px-3 py-2
              rounded-lg
              text-sm sm:text-base
            "
                    />
                  </div>

                  {/* Remove */}
                  <div className="sm:col-span-1">
                    <button
                      onClick={() => removeExpense(index)}
                      className="
              text-red-600
              hover:underline
              text-sm
              w-full sm:w-auto
              text-left sm:text-center
            "
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addExpenseRow}
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              + Add another expense
            </button>

            {/* Totals */}
            <div className="mt-6 space-y-3 text-sm sm:text-base">
              <div className="flex justify-between">
                <span>Seller Expected Price:</span>
                <span className="font-semibold">
                  ₹{data.sellerPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Cost (Expenses):</span>
                <span className="font-semibold">
                  ₹{totalExpense.toLocaleString("en-IN")}
                </span>
              </div>

              <div
                className="
        border-t
        pt-3
        flex justify-between
        text-base sm:text-xl
        font-bold
        text-green-700
      "
              >
                <span>Total Sellable Price:</span>
                <span>₹{totalSellablePrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </section>


          {/* ================= SELLER DOCUMENTS ================= */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Seller Documents
            </h3>

            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="
          grid grid-cols-1
          sm:grid-cols-6
          gap-3
          items-start sm:items-center
        "
                >
                  {/* Smart dropdown / typing */}
                  <div className="sm:col-span-3">
                    <input
                      list={`doc-options-${index}`}
                      placeholder="Select or type document (RC, PAN...)"
                      value={doc.label}
                      onChange={(e) =>
                        updateDocumentLabel(index, e.target.value)
                      }
                      className="
              w-full
              border
              px-3 py-2
              rounded-lg
              text-sm sm:text-base
            "
                    />

                    <datalist id={`doc-options-${index}`}>
                      {documentOptions.map((opt, i) => (
                        <option key={i} value={opt} />
                      ))}
                    </datalist>
                  </div>

                  {/* File upload */}
                  <div className="sm:col-span-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="w-full text-sm"
                      onChange={(e) => {
                        if (e.target.files) {
                          updateDocumentFile(index, e.target.files); // ✅ FileList
                        }
                      }}
                    />
                  </div>

                  {/* Remove */}
                  <div className="sm:col-span-1">
                    <button
                      onClick={() => removeDocument(index)}
                      className="text-red-600 text-sm w-full sm:w-auto text-left sm:text-center"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Preview */}
                  {doc.previewUrls.length > 0 && (
                    <div
                      className="
              sm:col-span-6
              flex
              gap-2
              flex-wrap
              overflow-x-auto
            "
                    >
                      {doc.previewUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          className="
                  h-16 w-16
                  sm:h-20 sm:w-20
                  object-cover
                  rounded
                  border
                  flex-shrink-0
                "
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addDocumentRow}
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              + Add another document
            </button>
          </section>


          {/* ================= ACTIONS ================= */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-300"
            >
              Cancel
            </button>

            <button
              onClick={approveRequest}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-green-600 text-white"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApproveSellRequest;
