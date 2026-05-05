import React, { useEffect, useState } from "react";
import api from "@/api/api";
import { uploadFile } from "@/utils/uploadFile";
import {
    Search,
    FileText,
    Users,
    Car,
    Phone,
    MapPin,
    ExternalLink,
    Calendar,
    CreditCard,
    User,
    FileCheck,
    Upload,
    X
} from "lucide-react";

/* ================= TYPES ================= */

type Person = {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    area?: string;
};

type CarDetails = {
    brand?: string;
    model?: string;
    variant?: string;
    year?: number;
    registrationNumber?: string;
};

type SellerDocumentItem = {
    label: string;
    fileUrls: string[];
};

type SellerDocumentRecord = {
    sellRequestId: string;
    car: CarDetails;
    seller: Person;
    documents: SellerDocumentItem[];
    createdAt: string;
};

type BuyerKycDocs = {
    aadhaar?: string[];
    pan?: string[];
    photo?: string[];
};

type BuyerRtoDocs = {
    form29?: string[];
    form30?: string[];
    form28?: string[];
    form35?: string[];
};

type BuyerDocumentRecord = {
    id: string; // Add car ID for updates
    buyer: Person;
    car: CarDetails;
    soldPrice?: number;
    saleDate?: string;

    buyerKyc?: BuyerKycDocs;
    buyerRto?: BuyerRtoDocs;
};

/* ================= COMPONENT ================= */

const AdminDocuments: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"seller" | "buyer">("seller");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [sellerDocs, setSellerDocs] = useState<SellerDocumentRecord[]>([]);
    const [buyerDocs, setBuyerDocs] = useState<BuyerDocumentRecord[]>([]);

    // Upload states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedSellerDoc, setSelectedSellerDoc] = useState<SellerDocumentRecord | null>(null);
    const [selectedBuyerDoc, setSelectedBuyerDoc] = useState<BuyerDocumentRecord | null>(null);
    const [uploadType, setUploadType] = useState<"seller" | "buyer">("seller");
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [imageLabel, setImageLabel] = useState("");

    /* ================= FETCH ================= */

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {


        try {
            setLoading(true);

            const [sellerRes, buyerRes] = await Promise.all([
                api.get("/admin/seller-documents"),
                api.get("/admin/buyer-documents"),
            ]);

            console.log("Seller docs response:", sellerRes.data);
            console.log("Buyer docs response:", buyerRes.data);

            setSellerDocs(sellerRes.data || []);
            setBuyerDocs(buyerRes.data || []);
        } catch (err) {
            console.error("❌ Failed to load documents", err);
        } finally {
            setLoading(false);
        }



    };

    /* ================= UPLOAD FUNCTIONS ================= */

    const handleFileSelect = (files: FileList) => {
        const fileArray = Array.from(files);
        setSelectedFiles(fileArray);
        const previews = fileArray.map(file => URL.createObjectURL(file));
        setFilePreviews(previews);
    };

    const uploadImages = async () => {
        if (selectedFiles.length === 0) {
            alert("Please select files to upload");
            return;
        }

        if (!imageLabel.trim()) {
            alert("Please enter a label for the images");
            return;
        }

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (const file of selectedFiles) {
                const url = await uploadFile(file);
                uploadedUrls.push(url);
            }

            if (uploadType === "seller" && selectedSellerDoc) {
                // For seller documents, add to the first document or create a new one
                const updatedDoc = { ...selectedSellerDoc };
                if (updatedDoc.documents.length === 0) {
                    updatedDoc.documents.push({
                        label: imageLabel,
                        fileUrls: uploadedUrls
                    });
                } else {
                    // Add to existing document or create new one with the label
                    const existingDoc = updatedDoc.documents.find(doc => doc.label === imageLabel);
                    if (existingDoc) {
                        existingDoc.fileUrls = [...existingDoc.fileUrls, ...uploadedUrls];
                    } else {
                        updatedDoc.documents.push({
                            label: imageLabel,
                            fileUrls: uploadedUrls
                        });
                    }
                }

                // Update in backend
                await api.put(`/admin/seller-documents/${selectedSellerDoc.sellRequestId}`, {
                    documents: updatedDoc.documents
                });

                // Update local state
                setSellerDocs(prev => prev.map(doc =>
                    doc.sellRequestId === selectedSellerDoc.sellRequestId ? updatedDoc : doc
                ));

            } else if (uploadType === "buyer" && selectedBuyerDoc) {
                // For buyer documents, add to KYC photos with the label
                const updatedDoc = { ...selectedBuyerDoc };
                if (!updatedDoc.buyerKyc) updatedDoc.buyerKyc = {};

                // Use the label to determine which KYC field to update
                const label = imageLabel.toLowerCase();
                let updateData: any = {};

                if (label.includes("aadhaar") || label.includes("aadhar")) {
                    if (!updatedDoc.buyerKyc.aadhaar) updatedDoc.buyerKyc.aadhaar = [];
                    updatedDoc.buyerKyc.aadhaar = [...updatedDoc.buyerKyc.aadhaar, ...uploadedUrls];
                    updateData.buyerKyc = { aadhaar: updatedDoc.buyerKyc.aadhaar };
                } else if (label.includes("pan")) {
                    if (!updatedDoc.buyerKyc.pan) updatedDoc.buyerKyc.pan = [];
                    updatedDoc.buyerKyc.pan = [...updatedDoc.buyerKyc.pan, ...uploadedUrls];
                    updateData.buyerKyc = { pan: updatedDoc.buyerKyc.pan };
                } else {
                    // Default to photo field
                    if (!updatedDoc.buyerKyc.photo) updatedDoc.buyerKyc.photo = [];
                    updatedDoc.buyerKyc.photo = [...updatedDoc.buyerKyc.photo, ...uploadedUrls];
                    updateData.buyerKyc = { photo: updatedDoc.buyerKyc.photo };
                }

                // Update in backend
                await api.put(`/admin/buyer-documents/${selectedBuyerDoc.id}`, updateData);

                // Update local state
                setBuyerDocs(prev => prev.map(doc =>
                    doc.id === selectedBuyerDoc.id ? updatedDoc : doc
                ));
            }

            alert("Images uploaded successfully!");
            closeUploadModal();

        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const openUploadModal = (type: "seller" | "buyer", item: any) => {
        setUploadType(type);
        if (type === "seller") {
            setSelectedSellerDoc(item);
            setSelectedBuyerDoc(null);
        } else {
            setSelectedBuyerDoc(item);
            setSelectedSellerDoc(null);
        }
        setShowUploadModal(true);
    };

    const closeUploadModal = () => {
        setShowUploadModal(false);
        setSelectedFiles([]);
        setFilePreviews([]);
        setImageLabel("");
        setSelectedSellerDoc(null);
        setSelectedBuyerDoc(null);
    };

    /* ================= SEARCH FILTER ================= */

    const filterData = <T extends any>(data: T[]) => {
        if (!search.trim()) return data;

        const q = search.toLowerCase();

        return data.filter((item: any) => {
            const searchableText = `
        ${item.car?.brand ?? ""}
        ${item.car?.model ?? ""}
        ${item.car?.variant ?? ""}
        ${item.car?.registrationNumber ?? ""}
        ${item.seller?.name ?? ""}
        ${item.seller?.phone ?? ""}
        ${item.buyer?.name ?? ""}
        ${item.buyer?.phone ?? ""}
      `.toLowerCase();

            return searchableText.includes(q);
        });
    };

    /* ================= UI HELPERS ================= */

    const TabButton = ({
        id,
        label,
        icon: Icon,
    }: {
        id: "seller" | "buyer";
        label: string;
        icon: any;
    }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-sm
        ${activeTab === id
                    ? "bg-blue-600 text-white shadow-blue-200"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );


    const DocumentGrid = ({
        label,
        files = [],
    }: {
        label: string;
        files?: string[];
    }) => {
        if (!files || files.length === 0) return null;

        return (
            <div className="mb-6">
                {/* Label */}
                <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    {label}
                </h5>

                {/* Image Grid */}
                <div
                    className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    md:grid-cols-4
                    gap-3
                "
                >
                    {files.map((url, index) => (
                        <div
                            key={index}
                            onClick={() => window.open(url, "_blank")}
                            className="
                            relative
                            group
                            cursor-pointer
                            rounded-xl
                            overflow-hidden
                            border
                            bg-white
                            shadow-sm
                            hover:shadow-md
                            transition
                        "
                        >
                            <img
                                src={url}
                                alt={`${label} ${index + 1}`}
                                className="
                                w-full
                                h-32
                                object-cover
                                group-hover:scale-105
                                transition-transform
                            "
                            />

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                                <ExternalLink
                                    size={18}
                                    className="text-white opacity-0 group-hover:opacity-100"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };



    /* ================= RENDER ================= */

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
                <p className="text-gray-500 font-medium">Loading documents repository...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 min-h-screen bg-gray-50/50">

            {/* ================= HEADER ================= */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        Document Repository
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-1">
                        Manage and view all seller and buyer documentation
                    </p>
                </div>

                {/* SEARCH */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="
          block w-full
          pl-10 pr-4 py-3
          border border-gray-200
          rounded-xl
          bg-white
          text-sm sm:text-base
          focus:outline-none
          focus:ring-2 focus:ring-blue-500/20
          focus:border-blue-500
        "
                    />
                </div>
            </div>

            {/* ================= TABS ================= */}
            <div
                className="
      flex gap-3
      border-b border-gray-200 pb-1
      overflow-x-auto scrollbar-hide
      -mx-4 px-4 sm:mx-0 sm:px-0
    "
            >
                <TabButton id="seller" label="Seller Documents" icon={FileText} />
                <TabButton id="buyer" label="Buyer Records" icon={Users} />
            </div>

            {/* ================= SELLER DOCUMENTS ================= */}
            {activeTab === "seller" && (
                <div className="space-y-6">

                    {filterData(sellerDocs).length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
                            <FileText className="mx-auto text-gray-400 mb-3" size={36} />
                            <h3 className="text-lg font-medium">No documents found</h3>
                            <p className="text-gray-500 text-sm">Try adjusting your search</p>
                        </div>
                    ) : (

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filterData(sellerDocs).map((item, index) => (
                                <div
                                    key={index}
                                    className="
                bg-white
                rounded-2xl
                border
                shadow-sm
                hover:shadow-md
                transition
                overflow-hidden
                flex flex-col
              "
                                >

                                    {/* CARD HEADER */}
                                    <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-gray-50 to-white">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                                    <Car size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                                        {item.car?.brand} {item.car?.model}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        {item.car?.variant} • {item.car?.year}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* SELLER INFO */}
                                    <div className="px-4 sm:px-5 py-4 space-y-2 text-sm">
                                        <p className="font-medium text-gray-800">
                                            {item.seller?.name}
                                        </p>
                                        <p className="text-gray-500 flex items-center gap-2">
                                            <Phone size={12} /> {item.seller?.phone}
                                        </p>
                                        <p className="text-gray-500 flex items-center gap-2">
                                            <MapPin size={12} /> {item.seller?.city}
                                        </p>
                                        <p className="text-gray-500 flex items-center gap-2 break-all">
                                            <CreditCard size={12} />
                                            {item.car?.registrationNumber || "N/A"}
                                        </p>
                                    </div>

                                    {/* DOCUMENTS */}
                                    <div className="bg-gray-50/60 p-4 sm:p-5 border-t space-y-4">

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <h4 className="text-xs font-semibold uppercase text-gray-600 flex items-center gap-2">
                                                <FileCheck size={14} />
                                                Attached Documents
                                            </h4>

                                            <button
                                                onClick={() => openUploadModal("seller", item)}
                                                className="
                      w-full sm:w-auto
                      flex items-center justify-center gap-2
                      px-4 py-2
                      bg-blue-600 text-white
                      rounded-lg
                      text-sm
                    "
                                            >
                                                <Upload size={14} />
                                                Add Images
                                            </button>
                                        </div>

                                        {item.documents.map((doc, i) => (
                                            <div
                                                key={i}
                                                className="bg-white rounded-xl border p-3 space-y-3"
                                            >
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-gray-800">
                                                        {doc.label}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {doc.fileUrls.length} files
                                                    </span>
                                                </div>

                                                {/* IMAGES */}
                                                <div
                                                    className="
                        grid grid-cols-2 gap-3
                        sm:flex sm:overflow-x-auto sm:gap-3
                      "
                                                >
                                                    {doc.fileUrls.map((url, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => window.open(url, "_blank")}
                                                            className="
                            relative
                            rounded-lg
                            overflow-hidden
                            border
                            cursor-pointer
                          "
                                                        >
                                                            <img
                                                                src={url}
                                                                alt={doc.label}
                                                                className="
                              w-full h-28
                              sm:h-20 sm:w-20
                              object-cover
                            "
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition flex items-center justify-center">
                                                                <ExternalLink className="text-white opacity-0 hover:opacity-100" size={16} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}


            {/* ================= BUYER RECORDS CONTENT ================= */}
            {activeTab === "buyer" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

                    {filterData(buyerDocs).length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
                            <Users className="mx-auto text-gray-400 mb-3" size={36} />
                            <h3 className="text-lg font-medium text-gray-900">
                                No buyer records found
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Records appear here after cars are marked as sold
                            </p>
                        </div>
                    ) : (

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filterData(buyerDocs).map((item, index) => (
                                <div
                                    key={index}
                                    className="
              bg-white
              rounded-2xl
              border
              shadow-sm
              hover:shadow-md
              transition
              overflow-hidden
              flex flex-col
            "
                                >

                                    {/* ================= HEADER ================= */}
                                    <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-green-50/60 to-white">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                                    <Car size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                                        {item.car?.brand} {item.car?.model}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        {item.car?.variant} • {item.car?.year}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right text-xs text-gray-500">
                                                <p className="uppercase tracking-wide">Sale Date</p>
                                                <p className="font-medium text-gray-700">
                                                    {item.saleDate
                                                        ? new Date(item.saleDate).toLocaleDateString()
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ================= BUYER DETAILS ================= */}
                                    <div className="px-4 sm:px-5 py-4 space-y-3">
                                        <h4 className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-2">
                                            <Users size={12} />
                                            Buyer Details
                                        </h4>

                                        <div className="space-y-1 text-sm">
                                            <p className="font-medium text-gray-900">
                                                {item.buyer?.name || "N/A"}
                                            </p>
                                            <p className="text-gray-600">
                                                {item.buyer?.phone || "N/A"}
                                            </p>
                                            <p className="text-gray-500 text-xs break-all">
                                                {item.buyer?.email || "N/A"}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {item.buyer?.city || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ================= KYC DOCUMENTS ================= */}
                                    <div className="bg-gray-50/60 px-4 sm:px-5 py-4 border-t space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <h4 className="text-xs font-semibold uppercase text-gray-600">
                                                KYC Documents
                                            </h4>

                                            <button
                                                onClick={() => openUploadModal("buyer", item)}
                                                className="
                    w-full sm:w-auto
                    flex items-center justify-center gap-2
                    px-4 py-2
                    bg-green-600 text-white
                    rounded-lg
                    text-sm
                  "
                                            >
                                                <Upload size={14} />
                                                Add Images
                                            </button>
                                        </div>

                                        <DocumentGrid
                                            label="Aadhaar Card"
                                            files={item.buyerKyc?.aadhaar}
                                        />
                                        <DocumentGrid
                                            label="PAN Card"
                                            files={item.buyerKyc?.pan}
                                        />
                                        <DocumentGrid
                                            label="Passport Size Photo"
                                            files={item.buyerKyc?.photo}
                                        />
                                    </div>

                                    {/* ================= RTO DOCUMENTS ================= */}
                                    <div className="px-4 sm:px-5 py-4 border-t space-y-3">
                                        <h4 className="text-xs font-semibold uppercase text-gray-600">
                                            RTO Documents
                                        </h4>

                                        <DocumentGrid label="Form 29" files={item.buyerRto?.form29} />
                                        <DocumentGrid label="Form 30" files={item.buyerRto?.form30} />
                                        <DocumentGrid label="Form 28" files={item.buyerRto?.form28} />
                                        <DocumentGrid label="Form 35" files={item.buyerRto?.form35} />
                                    </div>

                                    {/* ================= FOOTER ================= */}
                                    <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Calendar size={14} />
                                            <span>
                                                Sold on{" "}
                                                {item.saleDate
                                                    ? new Date(item.saleDate).toLocaleDateString()
                                                    : "N/A"}
                                            </span>
                                        </div>

                                        <div
                                            className="
                  flex items-center gap-2
                  text-blue-600
                  font-medium
                  cursor-pointer
                  hover:underline
                "
                                        >
                                            <CreditCard size={14} />
                                            <span>View Invoice</span>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}


            {/* ================= UPLOAD MODAL ================= */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

                    {/* Bottom-sheet on mobile, dialog on desktop */}
                    <div
                        className="
        bg-white
        w-full
        sm:max-w-md
        rounded-t-2xl sm:rounded-2xl
        shadow-2xl
        max-h-[90vh]
        flex flex-col
      "
                    >

                        {/* ================= HEADER ================= */}
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Upload Images
                            </h3>
                            <button
                                onClick={closeUploadModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* ================= BODY ================= */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

                            {/* LABEL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image Label / Name
                                </label>
                                <input
                                    type="text"
                                    value={imageLabel}
                                    onChange={(e) => setImageLabel(e.target.value)}
                                    placeholder="Aadhaar Card, PAN Card, Damage Images..."
                                    className="
              w-full
              px-4 py-3
              border border-gray-300
              rounded-xl
              focus:outline-none
              focus:ring-2 focus:ring-blue-500/40
            "
                                    required
                                />
                            </div>

                            {/* FILE INPUT */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Images
                                </label>

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                                    className="
              w-full
              px-4 py-3
              border border-dashed border-gray-300
              rounded-xl
              bg-gray-50
              focus:outline-none
              focus:ring-2 focus:ring-blue-500/40
            "
                                />
                            </div>

                            {/* PREVIEW */}
                            {filePreviews.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preview
                                    </label>

                                    <div
                                        className="
                grid
                grid-cols-3
                sm:grid-cols-4
                gap-3
                max-h-48
                overflow-y-auto
                pr-1
              "
                                    >
                                        {filePreviews.map((url, i) => (
                                            <div
                                                key={i}
                                                className="relative group"
                                                onClick={() => window.open(url, "_blank")}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Preview ${i + 1}`}
                                                    className="
                      w-full
                      h-24
                      object-cover
                      rounded-xl
                      border
                      cursor-pointer
                    "
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ================= FOOTER ================= */}
                        <div className="px-5 py-4 border-t bg-gray-50 flex gap-3">
                            <button
                                onClick={closeUploadModal}
                                className="
            flex-1
            px-4 py-3
            border border-gray-300
            rounded-xl
            text-gray-700
            hover:bg-gray-100
          "
                            >
                                Cancel
                            </button>

                            <button
                                onClick={uploadImages}
                                disabled={uploading || selectedFiles.length === 0}
                                className="
            flex-1
            px-4 py-3
            bg-blue-600
            text-white
            rounded-xl
            hover:bg-blue-700
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
                            >
                                {uploading ? "Uploading..." : "Upload"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDocuments;
