import { useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  Upload,
  Car,
  User,
  IndianRupee,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// ADD THIS IMPORT
import api from "@/api/api";

import { useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddMoreFeature from "./admin/AddMoreFeature";
import FeatureBlock from "./FeatureBlock";

const steps = [
  { icon: Car, title: "Car Details", description: "Tell us about your car" },
  { icon: CheckCircle, title: "Features", description: "Car features" },
  {
    icon: Upload,
    title: "Upload Photos",
    description: "Add photos of your car",
  },
  { icon: User, title: "Contact Info", description: "Your contact details" },
];

const brands = [
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Toyota",
  "Hyundai",
  "Honda",
  "Tata",
  "Mahindra",
  "Other",
];
const years = Array.from({ length: 15 }, (_, i) => (2024 - i).toString());
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];

const transmissionTypes = ["Manual", "Automatic", "AMT", "CVT", "DCT"];

interface SellCarFormData {
  brand: string;
  model: string;
  year: string;
  variant: string;
  fuel: string;
  transmission: string;
  km: string;
  registrationNumber: string;

  expectedPrice: string;
  description: string;

  name: string;
  phone: string;
  email: string;
  city: string;

  // ✅ NEW CONTACT FIELDS
  altPhone?: string;
  area?: string;

  // ✅ RC FLOW
  rcOwner?: "yes" | "no" | "";
  rcOwnerName?: string;
  rcImage?: File | string;

  // ✅ ADMIN
  adminSellingPrice: string;
}

interface CarFeatures {
  entertainment: string[];
  safety: string[];
  comfort: string[];
  interiorExterior: string[];
  custom: string[];
}

interface SellCarProps {
  isAdmin?: boolean;
  requestId?: string;
  initialData?: Partial<SellCarFormData>;
  onClose?: () => void;
}

const SellCar: React.FC<SellCarProps> = ({
  isAdmin = false,
  requestId,
  initialData,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<SellCarFormData>({
    brand: "",
    model: "",
    year: "",
    variant: "",
    fuel: "",
    km: "",
    expectedPrice: "",
    description: "",
    registrationNumber: "",
    transmission: "",
    name: "",
    phone: "",
    email: "",
    city: "",

    altPhone: "",
    area: "",

    rcOwner: "",
    rcOwnerName: "",
    rcImage: undefined,

    adminSellingPrice: "",
  });

  // ✅ MIXED TYPE (File + URL)

  const [images, setImages] = useState<(File | string)[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [features, setFeatures] = useState<CarFeatures>({
    entertainment: [],
    safety: [],
    comfort: [],
    interiorExterior: [],
    custom: [],
  });

  const handleInputChange = (
    field: keyof SellCarFormData,
    value: string | File
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 📌 Reset form function
  const resetForm = () => {
    setFormData({
      brand: "",
      model: "",
      year: "",
      variant: "",
      fuel: "",
      km: "",
      expectedPrice: "",
      description: "",
      registrationNumber: "",
      transmission: "",
      name: "",
      phone: "",
      email: "",
      city: "",
      altPhone: "",
      area: "",
      rcOwner: "",
      rcOwnerName: "",
      rcImage: undefined,
      adminSellingPrice: "",
    });
    setImages([]);
    setVideos([]);
    setFeatures({
      entertainment: [],
      safety: [],
      comfort: [],
      interiorExterior: [],
      custom: [],
    });
    setCurrentStep(0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages((prev) =>
        [...prev, ...Array.from(e.target.files!)].slice(0, 10)
      );
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type (video)
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file');
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('Video size should be less than 50MB');
        return;
      }

      setVideos(prev => {
        const copy = [...prev];
        copy[index] = file;
        return copy;
      });
    }
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    // ================= STEP 1: CAR DETAILS VALIDATION =================
    if (currentStep === 0) {
      if (!formData.brand.trim()) {
        alert("Brand is required");
        return;
      }

      if (!formData.year) {
        alert("Year is required");
        return;
      }

      if (!formData.fuel) {
        alert("Fuel type is required");
        return;
      }

      if (!formData.km) {
        alert("Kilometers driven is required");
        return;
      }

      if (!formData.transmission) {
        alert("Transmission is required");
        return;
      }

      // ✅ REGISTRATION NUMBER REQUIRED
      if (!formData.registrationNumber?.trim()) {
        alert("Registration number is required");
        return;
      }

      // ✅ REGISTRATION NUMBER FORMAT VALIDATION (⬅️ YAHI CODE)
      const regRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;

      if (!regRegex.test(formData.registrationNumber)) {
        alert("Invalid registration number format (e.g. MP09AB1234)");
        return;
      }
    }

    // ================= STEP 2: IMAGE VALIDATION =================
    if (currentStep === 2) {
      if (images.length < 4) {
        alert("Minimum 4 car images are required");
        return;
      }
    }

    // ✅ SAB SAHI → NEXT STEP
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (!isAdmin || !requestId) return;

    const fetchRequest = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/admin/sell-requests/${requestId}`);
        const data = res.data;

        setFormData({
          brand: data.carDetails.brand,
          model: data.carDetails.model,
          year: String(data.carDetails.year),
          variant: data.carDetails.variant || "",
          fuel: data.carDetails.fuel || "",
          km: String(data.carDetails.km || ""),

          // ✅ ADD THIS
          registrationNumber: data.carDetails.registrationNumber || "",

          expectedPrice: String(data.expectedPrice),
          transmission: data.carDetails.transmission || "",
          description: data.carDetails.description || "",

          name: data.contact.name,
          phone: data.contact.phone,
          email: data.contact.email || "",
          city: data.contact.city || "",

          adminSellingPrice: "",
        });

        setFeatures({
          entertainment: Array.isArray(data.carDetails?.features?.entertainment)
            ? data.carDetails.features.entertainment
            : [],
          safety: Array.isArray(data.carDetails?.features?.safety)
            ? data.carDetails.features.safety
            : [],
          comfort: Array.isArray(data.carDetails?.features?.comfort)
            ? data.carDetails.features.comfort
            : [],
          interiorExterior: Array.isArray(
            data.carDetails?.features?.interiorExterior
          )
            ? data.carDetails.features.interiorExterior
            : [],
          custom: Array.isArray(data.carDetails?.features?.custom)
            ? data.carDetails.features.custom
            : [],
        });


        setImages(data.images || []);

        // Set videos if exists
        if (data.carDetails?.videos) {
          setVideos(data.carDetails.videos);
        } else if (data.carDetails?.video) {
          // Backward compatibility - convert single video to array
          setVideos([data.carDetails.video]);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load request data");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [isAdmin, requestId]);

  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 20 }, (_, i) =>
    (currentYear - i).toString()
  );

  const handleSubmit = async () => {
    if (isSubmitting) return; // prevent double click

    try {
      setIsSubmitting(true);

      // ================= ADMIN FLOW =================
      if (isAdmin) {
        if (!formData.adminSellingPrice) {
          alert("Enter admin selling price");
          return;
        }

        if (!requestId) {
          alert("Missing request id");
          return;
        }

        console.log("🛠️ ADMIN DATA:", formData);

        await api.put(`/admin/approve/${requestId}`, {
          adminSellingPrice: Number(formData.adminSellingPrice),
        });

        onClose?.();
        return;
      }

      // ================= USER FLOW =================
      const data = new FormData();

      // 🔥 STEP 1: RAW STATE CHECK
      console.log("📦 FORM DATA:", formData);
      console.log("🎯 FEATURES:", features);
      console.log("🖼️ IMAGES:", images);

      Object.entries(formData).forEach(([key, value]) => {
        if (!value) return;

        if (key === "rcImage" && value instanceof File) {
          data.append("rcImage", value);
        } else {
          data.append(key, String(value));
        }
      });

      data.append("features", JSON.stringify(features));
      console.log("📤 FORM DATA TO BE SENT:", Object.fromEntries(data.entries()));

      images.forEach((img) => {
        if (img instanceof File) {
          data.append("images", img);
        }
      });

      // Add videos if exists (only if they are new Files, not URL strings)
      videos.forEach((vid) => {
        if (vid instanceof File) {
          data.append("video", vid);
        }
      });

      await api.post("/sell", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Car submitted successfully");
      resetForm(); // 📌 Reset all form fields
    } catch (error: any) {
      console.error("Submit Error:", error);

      // Better error handling
      if (error.response) {
        console.error("Error Response:", error.response.data);
        console.error("Error Status:", error.response.status);
        alert(`Submission failed: ${error.response.data?.message || error.response.statusText || 'Unknown error'}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("No response from server. Please check your connection.");
      } else {
        console.error("Request setup error:", error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      // ALWAYS stop loader
      setIsSubmitting(false);
    }
  };


  return (
    // <div className="min-h-screen bg-background">
    <div className="min-h-screen bg-background text-foreground">

      {!isAdmin && <Navbar />}

      {/* Hero */}
      <section className="pt-16 pb-4 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-primary">
              <IndianRupee className="w-4 h-4" />
              Free Car Valuation
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Sell Your Car at the Best Price
            </h1>
            <p className="text-lg text-muted-foreground">
              Get the best value for your car in just 3 simple steps. Free
              inspection and quick payment!
            </p>
          </div>
        </div>
      </section>

      {/* Steps Indicator */}
      <section className="py-8 pt-0 border-b border-border bg-gradient-hero">
        <section className="py-6 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-3">
              {/* Top text */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Step {currentStep + 1} of 4</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>

              {/* Progress bar */}
              <div className="relative h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                <div
                  className="
            absolute left-0 top-0 h-full
            bg-gradient-to-r from-red-500 via-red-400 to-red-300
            rounded-full
            transition-all duration-700 ease-out
            shadow-[0_0_12px_rgba(234,179,8,0.8)]
          "
                  style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center ">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-center ">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${index <= currentStep
                      ? "bg-gradient-primary shadow-glow"
                      : "bg-secondary"
                      }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6 text-primary-foreground" />
                    ) : (
                      <step.icon
                        className={`w-6 h-6 ${index <= currentStep
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                          }`}
                      />
                    )}
                  </div>
                  <div className="hidden md:block text-center">
                    <p
                      className={`text-sm font-medium ${index <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                        }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 md:w-24 h-0.5 ${index < currentStep ? "bg-primary" : "bg-border"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      {/* ================= STEP 1: CAR DETAILS ================= */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* <div className="bg-white dark:bg-gray-900 border border-border rounded-2xl shadow-xl p-6 md:p-10"> */}
            <div className="bg-background border border-border rounded-2xl shadow-xl p-6 md:p-10">

              {/* ================= STEP 1: CAR DETAILS ================= */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Car Details
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Fill basic details about your car
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-muted/30 p-5 rounded-xl border">
                    {/* Brand */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Name *</Label>
                      <Input
                        readOnly={isAdmin}
                        value={formData.brand}
                        onChange={(e) =>
                          handleInputChange("brand", e.target.value)
                        }
                        placeholder="Enter brand name"
                      />
                    </div>

                    {/* Model */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Model *</Label>
                      <Input
                        readOnly={isAdmin}
                        value={formData.model}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                        placeholder="Enter car model (e.g., Swift, City, Creta)"
                      />
                    </div>


                    {/* Year */}
                    <div className="space-y-1.5">
                      <Label>Year *</Label>
                      <Select
                        disabled={isAdmin}
                        value={formData.year}
                        onValueChange={(v) => handleInputChange("year", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={y}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>


                    {/* Registration Number */}
                    <div className="space-y-1.5">
                      <Label>Registration Number *</Label>
                      <Input
                        readOnly={isAdmin}
                        value={formData.registrationNumber}
                        onChange={(e) =>
                          handleInputChange("registrationNumber", e.target.value.toUpperCase())
                        }
                        placeholder="e.g., MP09AB1234"
                      />
                    </div>


                    {/* Variant */}
                    <div className="space-y-1.5">
                      <Label>Variant</Label>
                      <Input
                        readOnly={isAdmin}
                        value={formData.variant}
                        onChange={(e) =>
                          handleInputChange("variant", e.target.value)
                        }
                        placeholder="e.g., Luxury, Sport, Base"
                      />
                    </div>

                    {/* Fuel */}
                    <div className="space-y-1.5">
                      <Label>Fuel Type *</Label>
                      <Select
                        disabled={isAdmin}
                        value={formData.fuel}
                        onValueChange={(v) => handleInputChange("fuel", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel" />
                        </SelectTrigger>
                        <SelectContent>
                          {fuelTypes.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* KM */}
                    <div className="space-y-1.5">
                      <Label>Kilometers Driven *</Label>
                      <Input
                        type="number"
                        readOnly={isAdmin}
                        value={formData.km}
                        onChange={(e) =>
                          handleInputChange("km", e.target.value)
                        }
                      />
                    </div>
                    {/* Transmission */}
                    <div className="space-y-1.5">
                      <Label>Transmission *</Label>
                      <Select
                        disabled={isAdmin}
                        value={formData.transmission}
                        onValueChange={(v) =>
                          handleInputChange("transmission", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          {transmissionTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Expected Price */}
                  <div className="space-y-1.5">
                    <Label>Expected Price (₹)</Label>
                    <Input
                      type="number"
                      readOnly={isAdmin}
                      value={formData.expectedPrice}
                      onChange={(e) =>
                        handleInputChange("expectedPrice", e.target.value)
                      }
                    />
                  </div>

                  {/* Admin Price */}
                  {isAdmin && (
                    <div className="space-y-1.5">
                      <Label>Admin Selling Price (₹)</Label>
                      <Input
                        type="number"
                        value={formData.adminSellingPrice}
                        onChange={(e) =>
                          handleInputChange("adminSellingPrice", e.target.value)
                        }
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label>Description / Condition</Label>
                    <Textarea
                      readOnly={isAdmin}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Accident history, repaint, tyre condition etc."
                    />
                  </div>
                  {/* 
                  <div className="rounded-xl border bg-muted/20 p-4 md:p-5">
                    <AddMoreFeature
                      features={features}
                      setFeatures={setFeatures}
                    />
                  </div> */}
                </div>
              )}

              {/* =============== STEP 2: CAR FEATURE =============== */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Car Feature
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Fill all feature of your car
                  </p>

                  <div className="rounded-xl border bg-muted/20 p-4 md:p-5">
                    <AddMoreFeature
                      features={features}
                      setFeatures={setFeatures}
                    />
                  </div>
                </div>
              )}

              {/* ================= STEP 2: CAR IMAGES ================= */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Upload Car Photos
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Please upload clear photos of your car from different
                    angles. These photos help us verify and evaluate your car
                    accurately.
                  </p>

                  {/* ================= EXTERIOR PHOTOS ================= */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Exterior Photos</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: "front", label: "Front View", index: 0 },
                        { key: "rear", label: "Rear View", index: 1 },
                        {
                          key: "engine",
                          label: "Engine / Dashboard",
                          index: 2,
                        },
                      ].map(({ key, label, index }) => {
                        const img = images[index];
                        const preview =
                          typeof img === "string"
                            ? img
                            : img instanceof File
                              ? URL.createObjectURL(img)
                              : null;

                        return (
                          <div
                            key={key}
                            // className="border rounded-2xl p-4 space-y-3 bg-background shadow-sm hover:shadow-md transition"
                            className="border border-border rounded-2xl p-4 space-y-3 bg-muted/30 hover:bg-muted/40 transition"

                          >
                            <p className="text-sm font-medium text-center">
                              {label}
                            </p>

                            <div className="aspect-square border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                              {preview ? (
                                <img
                                  src={preview}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  No Image
                                </span>
                              )}
                            </div>

                            {!isAdmin && (
                              <>
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  id={`upload-${key}`}
                                  onChange={(e) => {
                                    if (!e.target.files) return;
                                    const file = e.target.files[0];
                                    setImages((prev) => {
                                      const copy = [...prev];
                                      copy[index] = file;
                                      return copy;
                                    });
                                  }}
                                />
                                <label
                                  htmlFor={`upload-${key}`}
                                  className="block text-center text-sm text-primary cursor-pointer"
                                >
                                  {preview ? "Replace" : "Upload"}
                                </label>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ================= NUMBER PLATE ================= */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Number Plate Photo <span className="text-red-500">*</span>
                    </h3>

                    {(() => {
                      const index = 3;
                      const img = images[index];
                      const preview =
                        typeof img === "string"
                          ? img
                          : img instanceof File
                            ? URL.createObjectURL(img)
                            : null;

                      return (
                        <div className="max-w-xs border rounded-xl p-3 space-y-1.5">
                          <div className="aspect-square border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {preview ? (
                              <img
                                src={preview}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No Image
                              </span>
                            )}
                          </div>

                          {!isAdmin && (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                id="upload-plate"
                                onChange={(e) => {
                                  if (!e.target.files) return;
                                  const file = e.target.files[0];
                                  setImages((prev) => {
                                    const copy = [...prev];
                                    copy[index] = file;
                                    return copy;
                                  });
                                }}
                              />
                              <label
                                htmlFor="upload-plate"
                                className="block text-center text-sm text-primary cursor-pointer"
                              >
                                {preview ? "Replace" : "Upload"}
                              </label>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* ================= INTERIOR PHOTOS ================= */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Interior Photos (Multiple)
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Upload photos of seats, dashboard, back seat, etc.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.slice(4).map((img, i) => {
                        const src =
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img);

                        return (
                          <div
                            key={i}
                            // className="relative border rounded-2xl p-2 bg-background shadow hover:shadow-md transition"
                            className="relative border border-border rounded-2xl p-2 bg-muted/30 hover:bg-muted/40 transition"

                          >
                            <img
                              src={src}
                              className="w-full aspect-square object-cover rounded"
                            />

                            {!isAdmin && (
                              <button
                                onClick={() =>
                                  setImages((prev) =>
                                    prev.filter((_, idx) => idx !== i + 4)
                                  )
                                }
                                className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* ADD INTERIOR IMAGE CARD */}
                      {!isAdmin && (
                        <div className="border rounded-xl p-3 flex items-center justify-center text-center">
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            id="upload-interior"
                            onChange={(e) => {
                              if (!e.target.files) return;
                              const file = e.target.files[0];
                              setImages((prev) => [...prev, file]);
                            }}
                          />
                          <label
                            htmlFor="upload-interior"
                            className="text-sm font-medium text-primary cursor-pointer hover:underline"
                          >
                            + Add Interior Photo
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= CAR VIDEOS ================= */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Car Videos (Optional - Max 3)
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Upload up to 3 videos to showcase different angles and features of your car.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[0, 1, 2].map((index) => {
                        const video = videos[index];
                        const preview = typeof video === 'string' ? video : video instanceof File ? URL.createObjectURL(video) : null;

                        return (
                          <div key={index} className="border rounded-xl p-3 space-y-1.5">
                            <div className="aspect-video border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                              {preview ? (
                                <video
                                  src={preview}
                                  className="w-full h-full object-cover rounded"
                                  controls
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Video {index + 1}
                                </span>
                              )}
                            </div>

                            {!isAdmin && (
                              <>
                                <input
                                  type="file"
                                  accept="video/*"
                                  multiple
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    console.log("FILES SELECTED 👉", files);

                                    setVideos((prev) => [...prev, ...files]); // ✅ FIX
                                  }}
                                />
                                <div className="flex gap-2">
                                  <label
                                    htmlFor={`upload-video-${index}`}
                                    className="flex-1 text-center text-sm text-primary cursor-pointer hover:underline py-1 border border-border rounded bg-muted/30 hover:bg-muted/40 transition"
                                  >
                                    {video ? "Replace" : "Upload"}
                                  </label>
                                  {video && (
                                    <button
                                      onClick={() => removeVideo(index)}
                                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 3: CONTACT INFORMATION ================= */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Contact Information
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Please provide accurate details for inspection, verification
                    and payment.
                  </p>

                  {/* ================= BASIC CONTACT ================= */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-muted/30 p-5 rounded-xl border">
                    <div className="space-y-1.5">
                      <Label>Full Name *</Label>
                      <Input
                        readOnly={isAdmin}
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Mobile Number *</Label>
                      <Input
                        readOnly={isAdmin}
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="10-digit mobile number"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Alternate Phone</Label>
                      <Input
                        readOnly={isAdmin}
                        value={formData.altPhone || ""}
                        onChange={(e) =>
                          handleInputChange("altPhone", e.target.value)
                        }
                        placeholder="Optional"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input
                        readOnly={isAdmin}
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="example@email.com"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>City *</Label>
                      <Input
                        readOnly={isAdmin}
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        placeholder="City where car is located"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Area / Locality</Label>
                      <Input
                        readOnly={isAdmin}
                        value={formData.area || ""}
                        onChange={(e) =>
                          handleInputChange("area", e.target.value)
                        }
                        placeholder="Area / locality"
                      />
                    </div>
                  </div>

                  {/* ================= RC OWNERSHIP ================= */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      RC Ownership Details
                    </h3>

                    <div className="max-w-sm space-y-1.5">
                      <Label>Is RC in your name? *</Label>
                      <Select
                        disabled={isAdmin}
                        value={formData.rcOwner ?? ""}
                        onValueChange={(v) => handleInputChange("rcOwner", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ================= IF RC = NO - SHOW OWNER NAME ================= */}
                    {formData.rcOwner === "no" && (
                      <div className="space-y-4 border rounded-xl p-4 bg-muted/40">
                        <div className="space-y-1.5">
                          <Label>RC Owner Name *</Label>
                          <Input
                            readOnly={isAdmin}
                            value={formData.rcOwnerName || ""}
                            onChange={(e) =>
                              handleInputChange("rcOwnerName", e.target.value)
                            }
                            placeholder="Name as per RC"
                          />
                        </div>
                      </div>
                    )}

                    {/* ================= RC IMAGE (ALWAYS REQUIRED) ================= */}
                    <div className="space-y-1.5 border border-border rounded-xl p-4 bg-muted/40">
                      <Label>RC Image Upload * (Always Required)</Label>

                      {(() => {
                        const rcPreview =
                          typeof formData.rcImage === "string"
                            ? formData.rcImage
                            : formData.rcImage instanceof File
                              ? URL.createObjectURL(formData.rcImage)
                              : null;

                        return (
                          <div className="max-w-xs border border-border rounded-xl p-3 space-y-1.5 bg-background">
                            <div className="aspect-square border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                              {rcPreview ? (
                                <img
                                  src={rcPreview}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  No RC Image
                                </span>
                              )}
                            </div>

                            {!isAdmin && (
                              <>
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  id="upload-rc"
                                  onChange={(e) => {
                                    if (!e.target.files) return;
                                    handleInputChange(
                                      "rcImage",
                                      e.target.files[0]
                                    );
                                  }}
                                />
                                <label
                                  htmlFor="upload-rc"
                                  className="block text-center text-sm text-primary cursor-pointer hover:underline"
                                >
                                  {rcPreview
                                    ? "Replace RC Image"
                                    : "Upload RC Image"}
                                </label>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* ================= INFO NOTE ================= */}
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      RC details are mandatory for ownership verification and
                      legal transfer.
                    </p>
                  </div>
                </div>
              )}

              {/* ================= NAVIGATION BUTTONS ================= */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t bg-background/80 backdrop-blur sticky bottom-0">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>

                {currentStep < 3 ? (
                  <Button variant="hero" onClick={nextStep}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>

                        {isAdmin ? "Approving..." : "Submitting..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {isAdmin ? "Approve Car" : "Submit for Valuation"}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isAdmin && <Footer />}
    </div>
  );
};

export default SellCar;



