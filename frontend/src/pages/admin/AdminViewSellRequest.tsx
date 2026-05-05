import React, { useEffect, useState } from "react";
import api from "@/api/api";
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

interface Car {
    brand: string;
    model: string;
    registrationNumber?: string;
    year: number;
    variant?: string;
    transmission?: string;
    fuelType: string;
    kmDriven: number;
    condition?: string;
    images: string[];
    features?: CarFeatures;
    videos?: string[]; // ✅ ADD THIS

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

const AdminViewSellRequest: React.FC<Props> = ({ requestId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState<SellRequest | null>(null);
    console.log("FULL DATA 👉", data);
console.log("VIDEOS 👉", data?.car?.videos);
    const [error, setError] = useState("");

    const [sellerPrice, setSellerPrice] = useState("");
    const [adminPrice, setAdminPrice] = useState("");
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
    }, []);

    const fetchRequest = async () => {
        try {
            setLoading(true);

            const res = await api.get(`/admin/sell-requests/${requestId}`);

            const normalizedData: SellRequest = {
                _id: res.data._id,
                seller: res.data.contact,
                car: res.data.carDetails,
                rcDetails: res.data.rcDetails,
                sellerPrice: res.data.expectedPrice,
                adminSellingPrice: res.data.adminSellingPrice,
                status: res.data.status,
                createdAt: res.data.createdAt,
            };

            setData(normalizedData);
            setSellerPrice(normalizedData.sellerPrice.toString());
            setAdminPrice(normalizedData.adminSellingPrice?.toString() || "");
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
                interiorExterior: Array.isArray(normalizedData.car.features?.interiorExterior)
                    ? normalizedData.car.features!.interiorExterior
                    : [],
                custom: Array.isArray(normalizedData.car.features?.custom)
                    ? normalizedData.car.features!.custom
                    : [],
            });
        } catch (err) {
            setError("Failed to load sell request");
        } finally {
            setLoading(false);
        }
    };

    /* ================= UPDATE REQUEST ================= */

    const updateRequest = async () => {
        if (!data) return;

        const updatedSellerPrice = parseFloat(sellerPrice);
        const updatedAdminPrice = parseFloat(adminPrice);

        if (isNaN(updatedSellerPrice) || updatedSellerPrice <= 0) {
            alert("Please enter a valid seller expected price");
            return;
        }

        if (adminPrice && (isNaN(updatedAdminPrice) || updatedAdminPrice <= 0)) {
            alert("Please enter a valid admin selling price");
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("expectedPrice", updatedSellerPrice.toString());
            formData.append("features", JSON.stringify(features));

            if (updatedAdminPrice) {
                formData.append("adminSellingPrice", updatedAdminPrice.toString());
            }

            await api.put(`/admin/sell-requests/${requestId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Request updated successfully");
            fetchRequest();
        } catch (err) {
            alert("Failed to update request");
        } finally {
            setSubmitting(false);
        }
    };

    /* ================= LOADING ================= */

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                <p className="ml-4 text-lg text-gray-700">Loading request details...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error || "Request not found"}</p>
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-gray-300 rounded-lg"
                >
                    Close
                </button>
            </div>
        );
    }

    /* ================= UI ================= */

    return (
        <div className="flex flex-col max-h-[92vh]">
            {/* HEADER */}
            <div className="sticky top-0 z-10 bg-white border-b p-4 md:p-6 flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    Sell Request Details
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                    ×
                </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* ================= SELLER DETAILS ================= */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">Seller Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="mt-1 text-gray-900">{data.seller.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <p className="mt-1 text-gray-900">{data.seller.phone}</p>
                        </div>
                        {data.seller.altPhone && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alternate Phone</label>
                                <p className="mt-1 text-gray-900">{data.seller.altPhone}</p>
                            </div>
                        )}
                        {data.seller.email && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <p className="mt-1 text-gray-900">{data.seller.email}</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <p className="mt-1 text-gray-900">{data.seller.city}</p>
                        </div>
                        {data.seller.area && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Area</label>
                                <p className="mt-1 text-gray-900">{data.seller.area}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ================= CAR DETAILS ================= */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">Car Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Brand</label>
                            <p className="mt-1 text-gray-900">{data.car.brand}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Model</label>
                            <p className="mt-1 text-gray-900">{data.car.model}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Year</label>
                            <p className="mt-1 text-gray-900">{data.car.year}</p>
                        </div>
                        {data.car.variant && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Variant</label>
                                <p className="mt-1 text-gray-900">{data.car.variant}</p>
                            </div>
                        )}
                        {data.car.transmission && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Transmission</label>
                                <p className="mt-1 text-gray-900">{data.car.transmission}</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                            <p className="mt-1 text-gray-900">{data.car.fuelType}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">KM Driven</label>
                            <p className="mt-1 text-gray-900">
                                {data.car.kmDriven.toLocaleString()}
                            </p>
                        </div>
                        {data.car.condition && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Condition</label>
                                <p className="mt-1 text-gray-900">{data.car.condition}</p>
                            </div>
                        )}
                        {data.car.registrationNumber && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                                <p className="mt-1 text-gray-900">{data.car.registrationNumber}</p>
                            </div>
                        )}
                    </div>

                    {data.car.images && data.car.images.length > 0 && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Images
                            </label>

                            {/* Mobile friendly image slider */}
                            <div
                                className="
                flex gap-3 overflow-x-auto
                snap-x snap-mandatory
                pb-2
            "
                            >
                                {data.car.images.map((url, i) => (
                                    <div
                                        key={i}
                                        className="
                        flex-shrink-0
                        w-40 h-28
                        snap-center
                        rounded-lg
                        overflow-hidden
                        border
                        bg-gray-100
                    "
                                    >
                                        <img
                                            src={url}
                                            alt={`Car ${i + 1}`}
                                            className="
                            w-full h-full
                            object-cover
                            cursor-pointer
                            transition-transform
                            hover:scale-105
                        "
                                            onClick={() => window.open(url, "_blank")}
                                        />
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                                Swipe to view more →
                            </p>
                        </div>
                    )}


                    {data?.car?.videos && data.car.videos.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Car Videos</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.car.videos.map((video, index) => (
                                    
                                    <video
                                        key={index}
                                        controls
                                        className="w-full h-48 rounded-lg"
                                    >
                                        <source src={video} type="video/mp4" />
                                        
                                    </video>
                                    
                                ))}
                            </div>
                        </div>
                    )}


                </section>

                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <AddMoreFeature features={features} setFeatures={setFeatures} />
                </section>

                {/* ================= RC DETAILS ================= */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">RC Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">RC Owner</label>
                            <p className="mt-1 text-gray-900">
                                {data.rcDetails.rcOwner === "yes" ? "Yes" : "No"}
                            </p>
                        </div>
                        {data.rcDetails.rcOwner === "no" && data.rcDetails.rcOwnerName && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    RC Owner Name
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {data.rcDetails.rcOwnerName}
                                </p>
                            </div>
                        )}
                    </div>

                    {data.rcDetails.rcImage && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                RC Image
                            </label>
                            <img
                                src={data.rcDetails.rcImage}
                                className="h-32 object-cover rounded border"
                                alt="RC"
                            />
                        </div>
                    )}
                </section>

                {/* ================= PRICING ================= */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">Pricing</h3>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seller Expected Price
                            </label>
                            <input
                                type="number"
                                value={sellerPrice}
                                onChange={(e) => setSellerPrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Selling Price
                            </label>
                            <input
                                type="number"
                                value={adminPrice}
                                onChange={(e) => setAdminPrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </section>

                {/* ================= STATUS ================= */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">Status</h3>
                    <p
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${data.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : data.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : data.status === "REJECTED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                    >
                        {data.status}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        Created At: {new Date(data.createdAt).toLocaleString()}
                    </p>
                </section>
            </div>

            {/* ACTION BAR */}
            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-4">
                <button
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-lg bg-gray-300 text-gray-700"
                >
                    Cancel
                </button>
                <button
                    onClick={updateRequest}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-medium"
                >
                    {submitting ? "Updating..." : "Update"}
                </button>
            </div>
        </div>
    );
};

export default AdminViewSellRequest;
