import React, { useEffect, useState } from "react";
import api from "@/api/api";
import AddMoreFeature from "./AddMoreFeature";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
/* ================= TYPES ================= */



/* ================= EDIT STATES ================= */




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
    coverImage?: string;
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

    extraAdminExpenses?: {
        label: string;
        amount: number;
    }[];

    sellerSettlement?: {
        onlinePayment?: {
            paymentMode?: string;
            bankName?: string;
            transactionId?: string;
            amount?: number;
        };

        cashPayment?: {
            amount?: number;
            receivedBy?: string;
        };

        totalPurchaseAmount?: number;
        totalPaidAmount?: number;
        dueAmount?: number;


    };

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

    const [coverImageIndex, setCoverImageIndex] =
        useState(0);

    /* ================= FETCH REQUEST ================= */

    const [editPassword, setEditPassword] =
        useState("");

    /* ================= EDIT MODES ================= */
    const [isSellerEditable, setIsSellerEditable] = useState(false);
    const [isCarEditable, setIsCarEditable] = useState(false);
    const [isRCEditable, setIsRCEditable] = useState(false);
    const [editableImages, setEditableImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);

    /* ================= EDIT DATA ================= */
    const [editableSeller, setEditableSeller] = useState({
        name: "",
        phone: "",
        altPhone: "",
        email: "",
        city: "",
        area: "",
    });

    const [editableCar, setEditableCar] = useState({
        brand: "",
        model: "",
        year: 0,
        variant: "",
        transmission: "",
        fuelType: "",
        kmDriven: 0,
        condition: "",
        registrationNumber: "",
    });

    const [editableRC, setEditableRC] = useState({
        rcOwner: "yes" as "yes" | "no",
        rcOwnerName: "",
        rcImage: "",
    });

    const [isSettlementEditable, setIsSettlementEditable] =
        useState(false);

    const [editableSettlement, setEditableSettlement] =
        useState({
            onlinePayment: {
                paymentMode: "",
                bankName: "",
                transactionId: "",
                amount: 0,
            },

            cashPayment: {
                amount: 0,
                receivedBy: "",
            },

            totalPurchaseAmount: 0,
            totalPaidAmount: 0,
            dueAmount: 0,
        });


    const [formData, setFormData] = useState({
        extraAdminExpenses: [
            {
                label: "",
                amount: "",
            },
        ],
    });

    const totalExtraCost =
        formData.extraAdminExpenses.reduce(
            (sum, exp) =>
                sum + (Number(exp.amount) || 0),
            0
        );


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

                adminSellingPrice:
                    res.data.adminSellingPrice,

                sellerSettlement:
                    res.data.sellerSettlement || {},

                status: res.data.status,

                createdAt: res.data.createdAt,

                extraAdminExpenses: res.data.extraAdminExpenses || [],

            };

            setData(normalizedData);

            if (
                normalizedData.car.coverImage &&
                normalizedData.car.images?.length
            ) {
                const index =
                    normalizedData.car.images.findIndex(
                        (img) =>
                            img ===
                            normalizedData.car.coverImage
                    );

                setCoverImageIndex(
                    index >= 0 ? index : 0
                );
            }
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

            // Initialize editable states
            setEditableSeller({
                name: normalizedData.seller.name || "",
                phone: normalizedData.seller.phone || "",
                altPhone: normalizedData.seller.altPhone || "",
                email: normalizedData.seller.email || "",
                city: normalizedData.seller.city || "",
                area: normalizedData.seller.area || "",
            });

            setEditableCar({
                brand: normalizedData.car.brand || "",
                model: normalizedData.car.model || "",
                year: normalizedData.car.year || 0,
                variant: normalizedData.car.variant || "",
                transmission: normalizedData.car.transmission || "",
                fuelType: normalizedData.car.fuelType || "",
                kmDriven: normalizedData.car.kmDriven || 0,
                condition: normalizedData.car.condition || "",
                registrationNumber: normalizedData.car.registrationNumber || "",
            });

            setEditableRC({
                rcOwner: normalizedData.rcDetails.rcOwner || "yes",
                rcOwnerName: normalizedData.rcDetails.rcOwnerName || "",
                rcImage: normalizedData.rcDetails.rcImage || "",
            });

            setEditableImages(normalizedData.car.images || []);
        } catch (err) {
            setError("Failed to load sell request");
        } finally {
            setLoading(false);
        }
    };





    /* ================= AUTO FILL ================= */

    useEffect(() => {
        if (data?.sellerSettlement) {
            setEditableSettlement({
                onlinePayment: {
                    paymentMode:
                        data.sellerSettlement.onlinePayment
                            ?.paymentMode || "",

                    bankName:
                        data.sellerSettlement.onlinePayment
                            ?.bankName || "",

                    transactionId:
                        data.sellerSettlement.onlinePayment
                            ?.transactionId || "",

                    amount:
                        data.sellerSettlement.onlinePayment
                            ?.amount || 0,
                },

                cashPayment: {
                    amount:
                        data.sellerSettlement.cashPayment
                            ?.amount || 0,

                    receivedBy:
                        data.sellerSettlement.cashPayment
                            ?.receivedBy || "",
                },

                totalPurchaseAmount:
                    data.sellerSettlement
                        ?.totalPurchaseAmount || 0,

                totalPaidAmount:
                    data.sellerSettlement
                        ?.totalPaidAmount || 0,

                dueAmount:
                    data.sellerSettlement?.dueAmount || 0,
            });
        }
    }, [data]);




    /* ================= ENABLE EDIT ================= */

    const enableSettlementEdit = () => {
        if (editPassword !== "super123") {
            alert("Invalid admin edit password");
            return;
        }

        setIsSettlementEditable(true);
    };

    /* ================= UPDATE SETTLEMENT ================= */

    const updateSettlement = async () => {
        console.log(
            "🔥 FRONTEND SETTLEMENT DATA",
            editableSettlement
        );
        try {
            await api.put(
                `/admin/update-settlement/${requestId}`,
                {
                    sellerSettlement: editableSettlement,
                }
            );

            alert("Settlement updated successfully ✅");

            fetchRequest();

            setIsSettlementEditable(false);
        } catch (err) {
            alert("Failed to update settlement");
        }
    };

    /* ================= UPDATE SELLER ================= */
    const updateSeller = async () => {
        try {
            await api.put(`/admin/sell-requests/${requestId}`, {
                seller: editableSeller,
            });
            alert("Seller details updated successfully ✅");
            fetchRequest();
            setIsSellerEditable(false);
        } catch (err) {
            alert("Failed to update seller details");
        }
    };

    /* ================= UPDATE CAR ================= */
    const updateCar = async () => {
        try {
            const formData = new FormData();
            formData.append("car", JSON.stringify(editableCar));
            formData.append("coverImageIndex", String(coverImageIndex));

            // Add new images
            newImages.forEach((file) => {
                formData.append("images", file);
            });

            await api.put(`/admin/sell-requests/${requestId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Car details updated successfully ✅");
            fetchRequest();
            setIsCarEditable(false);
            setNewImages([]);
        } catch (err) {
            alert("Failed to update car details");
        }
    };
    /* ================= UPDATE RC ================= */
    const updateRC = async () => {
        try {
            const payload = new FormData();

            payload.append(
                "rcDetails",
                JSON.stringify(editableRC)
            );

            await api.put(
                `/admin/sell-requests/${requestId}`,
                payload,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            alert("RC details updated successfully ✅");

            fetchRequest();

            setIsRCEditable(false);

        } catch (err) {
            console.log(err);

            alert("Failed to update RC details");
        }
    };
    /* ================= REMOVE IMAGE ================= */
    const removeImage = (index: number) => {
        const newImagesList = editableImages.filter((_, i) => i !== index);
        setEditableImages(newImagesList);
    };

    /* ================= HANDLE IMAGE UPLOAD ================= */
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setNewImages([...newImages, ...Array.from(files)]);
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

        if (
            adminPrice &&
            (isNaN(updatedAdminPrice) || updatedAdminPrice <= 0)
        ) {
            alert("Please enter a valid admin selling price");
            return;
        }

        setSubmitting(true);

        try {
            const payload = new FormData();

            payload.append(
                "coverImageIndex",
                String(coverImageIndex)
            );

            payload.append(
                "expectedPrice",
                updatedSellerPrice.toString()
            );

            payload.append(
                "features",
                JSON.stringify(features)
            );

            payload.append(
                "extraAdminExpenses",
                JSON.stringify(formData.extraAdminExpenses)
            );

            if (updatedAdminPrice) {
                payload.append(
                    "adminSellingPrice",
                    updatedAdminPrice.toString()
                );
            }

            // ✅ FIXED
            await api.put(
                `/admin/sell-requests/${requestId}`,
                payload,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Request updated successfully");

            fetchRequest();

        } catch (err) {
            console.log(err);
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
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Seller Details</h3>
                        {!isSellerEditable ? (
                            <button
                                onClick={() => setIsSellerEditable(true)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                            >
                                ✏️ Edit
                            </button>
                        ) : null}
                    </div>

                    {!isSellerEditable ? (
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
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editableSeller.name}
                                        onChange={(e) => setEditableSeller({ ...editableSeller, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={editableSeller.phone}
                                        onChange={(e) => setEditableSeller({ ...editableSeller, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                                    <input
                                        type="tel"
                                        value={editableSeller.altPhone}
                                        onChange={(e) => setEditableSeller({ ...editableSeller, altPhone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editableSeller.email}
                                        onChange={(e) => setEditableSeller({ ...editableSeller, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={editableSeller.city}
                                        onChange={(e) => setEditableSeller({ ...editableSeller, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                                    <input
                                        type="text"
                                        value={editableSeller.area}
                                        onChange={(e) => setEditableSeller({ ...editableSeller, area: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={updateSeller}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsSellerEditable(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* ================= CAR DETAILS ================= */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Car Details</h3>
                        {!isCarEditable ? (
                            <button
                                onClick={() => setIsCarEditable(true)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                            >
                                ✏️ Edit
                            </button>
                        ) : null}
                    </div>

                    {!isCarEditable ? (
                        <div className="space-y-4">
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

                            {/* Images Display */}
                            {editableImages.length > 0 && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Images
                                    </label>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {editableImages.map((url, i) => {
                                            const isCover = i === coverImageIndex;
                                            return (
                                                <div
                                                    key={i}
                                                    className="relative flex-shrink-0 w-40 h-28 rounded-lg overflow-hidden border bg-gray-100"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Car ${i + 1}`}
                                                        className="w-full h-full object-contain cursor-pointer transition-transform hover:scale-105"
                                                        onClick={() => window.open(url, "_blank")}
                                                    />
                                                    {isCover && (
                                                        <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                                                            Cover
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setCoverImageIndex(i)}
                                                        className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded hover:bg-black"
                                                    >
                                                        Set Cover
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Swipe to view more →</p>
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
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <input
                                        type="text"
                                        value={editableCar.brand}
                                        onChange={(e) => setEditableCar({ ...editableCar, brand: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                    <input
                                        type="text"
                                        value={editableCar.model}
                                        onChange={(e) => setEditableCar({ ...editableCar, model: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <input
                                        type="number"
                                        value={editableCar.year}
                                        onChange={(e) => setEditableCar({ ...editableCar, year: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                                    <input
                                        type="text"
                                        value={editableCar.variant}
                                        onChange={(e) => setEditableCar({ ...editableCar, variant: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                                    <input
                                        type="text"
                                        value={editableCar.transmission}
                                        onChange={(e) => setEditableCar({ ...editableCar, transmission: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                                    <select
                                        value={editableCar.fuelType}
                                        onChange={(e) =>
                                            setEditableCar({
                                                ...editableCar,
                                                fuelType: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Select Fuel Type
                                        </option>

                                        <option value="PETROL">
                                            Petrol
                                        </option>

                                        <option value="DIESEL">
                                            Diesel
                                        </option>

                                        <option value="CNG">
                                            CNG
                                        </option>

                                        
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">KM Driven</label>
                                    <input
                                        type="number"
                                        value={editableCar.kmDriven}
                                        onChange={(e) => setEditableCar({ ...editableCar, kmDriven: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                    <input
                                        type="text"
                                        value={editableCar.registrationNumber}
                                        onChange={(e) => setEditableCar({ ...editableCar, registrationNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                    <textarea
                                        value={editableCar.condition}
                                        onChange={(e) => setEditableCar({ ...editableCar, condition: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Image Management */}
                            <div className="border-t pt-4 mt-4">
                                <h4 className="font-semibold mb-3">Images Management</h4>

                                {/* Current Images */}
                                {editableImages.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Images ({editableImages.length})
                                        </label>
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {editableImages.map((url, i) => (
                                                <div
                                                    key={i}
                                                    className="relative flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden border bg-gray-100"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Car ${i + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(i)}
                                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Images Preview */}
                                {newImages.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Images ({newImages.length})
                                        </label>
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {newImages.map((file, i) => (
                                                <div
                                                    key={i}
                                                    className="relative flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden border bg-gray-100"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`New ${i + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[10px] px-1 rounded">
                                                        NEW
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload New Images */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Add New Images</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={updateCar}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCarEditable(false);
                                        setNewImages([]);
                                        setEditableImages(data?.car.images || []);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <AddMoreFeature features={features} setFeatures={setFeatures} />
                </section>

                {/* ================= RC DETAILS ================= */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">RC Details</h3>
                        {!isRCEditable ? (
                            <button
                                onClick={() => setIsRCEditable(true)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                            >
                                ✏️ Edit
                            </button>
                        ) : null}
                    </div>

                    {!isRCEditable ? (
                        <div className="space-y-4">
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
                                        className="h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                                        alt="RC"
                                        onClick={() => window.open(data.rcDetails.rcImage, "_blank")}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RC Owner</label>
                                    <select
                                        value={editableRC.rcOwner}
                                        onChange={(e) => setEditableRC({ ...editableRC, rcOwner: e.target.value as "yes" | "no" })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                                {editableRC.rcOwner === "no" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">RC Owner Name</label>
                                        <input
                                            type="text"
                                            value={editableRC.rcOwnerName}
                                            onChange={(e) => setEditableRC({ ...editableRC, rcOwnerName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {editableRC.rcImage && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current RC Image</label>
                                    <img
                                        src={editableRC.rcImage}
                                        className="h-32 object-cover rounded border"
                                        alt="RC"
                                    />
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={updateRC}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsRCEditable(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
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



                {/* ==================== SETTLEMENT SUMMARY ==================== */}
                <div className="mt-6 p-4 border rounded-xl bg-blue-50 dark:bg-blue-950">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                        <h3 className="text-lg font-semibold">
                            Settlement Summary
                        </h3>

                        {!isSettlementEditable && (
                            <div className="flex gap-2">

                                <input
                                    type="password"
                                    placeholder="Admin Edit Password"
                                    value={editPassword}
                                    onChange={(e) =>
                                        setEditPassword(e.target.value)
                                    }
                                    className="border rounded-lg px-3 py-2 text-sm"
                                />

                                <button
                                    onClick={enableSettlementEdit}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                                >
                                    Unlock Edit
                                </button>
                            </div>
                        )}

                    </div>

                    {/* SUMMARY */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                        <div>
                            <Label>Total Purchase Amount</Label>

                            <Input
                                type="number"
                                value={editableSettlement.totalPurchaseAmount}
                                disabled={!isSettlementEditable}
                                onChange={(e) =>
                                    setEditableSettlement({
                                        ...editableSettlement,
                                        totalPurchaseAmount: Number(e.target.value),
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label>Total Paid Amount</Label>

                            <Input
                                type="number"
                                value={editableSettlement.totalPaidAmount}
                                disabled={!isSettlementEditable}
                                onChange={(e) =>
                                    setEditableSettlement({
                                        ...editableSettlement,
                                        totalPaidAmount: Number(e.target.value),
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label>Due Amount</Label>

                            <Input
                                type="number"
                                value={editableSettlement.dueAmount}
                                disabled={!isSettlementEditable}
                                onChange={(e) =>
                                    setEditableSettlement({
                                        ...editableSettlement,
                                        dueAmount: Number(e.target.value),
                                    })
                                }
                            />
                        </div>

                    </div>

                    {/* ONLINE PAYMENT */}
                    <div className="mb-6">

                        <h4 className="font-semibold mb-3">
                            🏦 Online Payment
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div>
                                <Label>Payment Mode</Label>

                                <Input
                                    value={
                                        editableSettlement.onlinePayment
                                            .paymentMode
                                    }
                                    disabled={!isSettlementEditable}
                                    onChange={(e) =>
                                        setEditableSettlement({
                                            ...editableSettlement,
                                            onlinePayment: {
                                                ...editableSettlement.onlinePayment,
                                                paymentMode: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Bank Name</Label>

                                <Input
                                    value={
                                        editableSettlement.onlinePayment
                                            .bankName
                                    }
                                    disabled={!isSettlementEditable}
                                    onChange={(e) =>
                                        setEditableSettlement({
                                            ...editableSettlement,
                                            onlinePayment: {
                                                ...editableSettlement.onlinePayment,
                                                bankName: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Transaction ID</Label>

                                <Input
                                    value={
                                        editableSettlement.onlinePayment
                                            .transactionId
                                    }
                                    disabled={!isSettlementEditable}
                                    onChange={(e) =>
                                        setEditableSettlement({
                                            ...editableSettlement,
                                            onlinePayment: {
                                                ...editableSettlement.onlinePayment,
                                                transactionId: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Online Amount</Label>

                                <Input
                                    type="number"
                                    value={
                                        editableSettlement.onlinePayment
                                            .amount
                                    }
                                    disabled={!isSettlementEditable}
                                    onChange={(e) =>
                                        setEditableSettlement({
                                            ...editableSettlement,
                                            onlinePayment: {
                                                ...editableSettlement.onlinePayment,
                                                amount: Number(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </div>

                        </div>
                    </div>

                    {/* CASH PAYMENT */}
                    <div>

                        <h4 className="font-semibold mb-3">
                            💵 Cash Payment
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div>
                                <Label>Cash Amount</Label>

                                <Input
                                    type="number"
                                    value={
                                        editableSettlement.cashPayment.amount
                                    }
                                    disabled={!isSettlementEditable}
                                    onChange={(e) =>
                                        setEditableSettlement({
                                            ...editableSettlement,
                                            cashPayment: {
                                                ...editableSettlement.cashPayment,
                                                amount: Number(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Received By</Label>

                                <Input
                                    value={
                                        editableSettlement.cashPayment
                                            .receivedBy
                                    }
                                    disabled={!isSettlementEditable}
                                    onChange={(e) =>
                                        setEditableSettlement({
                                            ...editableSettlement,
                                            cashPayment: {
                                                ...editableSettlement.cashPayment,
                                                receivedBy: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>

                        </div>
                    </div>

                    {isSettlementEditable && (
                        <button
                            type="button"
                            onClick={() => {
                                console.log("BUTTON CLICKED");
                                updateSettlement();
                            }}
                            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                        >
                            Save Settlement
                        </button>
                    )}

                </div>



                {/* ================= EXTRA ADMIN EXPENSES ================= */}
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

                    <h3 className="text-xl font-semibold mb-4">
                        Additional Admin Expenses
                    </h3>

                    <div className="space-y-4">

                        {formData.extraAdminExpenses.map((exp, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3"
                            >

                                {/* LABEL */}
                                <div>
                                    <Label>Expense Label</Label>

                                    <Input
                                        placeholder="Expense label"
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
                                </div>

                                {/* AMOUNT */}
                                <div>
                                    <Label>Amount</Label>

                                    <Input
                                        type="number"
                                        placeholder="Amount"
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
                                        { label: "", amount: "" },
                                    ],
                                }))
                            }
                            className="text-blue-600 text-sm hover:underline"
                        >
                            + Add Expense
                        </button>

                        {/* TOTAL */}
                        <div className="bg-red-50 border p-4 rounded-lg flex justify-between items-center">

                            <span className="font-medium text-gray-700">
                                Total Post-Sale Expenses
                            </span>

                            <span className="font-semibold text-red-600 text-lg">
                                ₹{totalExtraCost.toLocaleString()}
                            </span>

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
