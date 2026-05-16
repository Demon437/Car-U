import React, { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import AddMoreFeature from "./AddMoreFeature";

const AddOfflineCar: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [seller, setSeller] = useState({
    type: "individual", // new
    name: "",
    phone: "",
    altPhone: "",
    email: "",
    city: "",
    area: "",
    sourcePlatform: "", // new (Cars24, etc)
  });

  const [car, setCar] = useState({
    brand: "",
    model: "",
    year: "",
    variant: "",
    fuelType: "Petrol",
    transmission: "",
    kmDriven: "",
    condition: "",
    registrationNumber: "", // Added for backend requirement
  });

  const [rcDetails, setRcDetails] = useState({
    rcOwner: "no",
    rcOwnerName: "",
    rcImage: null as File | null,
  });

  const [coverImageIndex, setCoverImageIndex] =
    useState(0);
  const [images, setImages] = useState<(File | string)[]>([]);

  const [pricing, setPricing] = useState({
    sellerPrice: "",
    adminSellingPrice: "",
  });

  // Features and specifications
  const [features, setFeatures] = useState({
    entertainment: [],
    safety: [],
    comfort: [],
    interiorExterior: [],
    custom: []
  });

  const [specifications, setSpecifications] = useState({
    mileage: "",
    engineDisplacement: "",
    cylinders: "",
    maxPower: "",
    maxTorque: "",
    seatingCapacity: "",
    fuelTankCapacity: "",
    bodyType: "",
    groundClearance: "",
  });

  // Admin expenses
  const [expenses, setExpenses] = useState([{ label: "DP", amount: "" }]);



  const [expenseOptions, setExpenseOptions] = useState([
    "DP",
    "Diesel",
    "Mechanic Delhi",
    "Mechanic Rau",
    "Mechanic Indore",
    "Washing",
    "Seat Cover",
    "Tyre",
    "Painter",
    "Injector",
  ]);

  // Seller documents
  const [documents, setDocuments] = useState([
    { label: "RC Original", file: null as File | null },
  ]);


  const [sellerSettlement, setSellerSettlement] = useState({
    onlinePayment: {
      paymentMode: "",
      bankName: "",
      transactionId: "",
      amount: "",
      paymentDate: "",
      notes: "",
    },

    cashPayment: {
      amount: "",
      receivedBy: "",
      paymentDate: "",
      notes: "",
    },

    totalPurchaseAmount: "",
    totalPaidAmount: "",
    dueAmount: "",
  });

  const [documentOptions, setDocumentOptions] = useState([
    "RC Original",
    "Insurance",
    "Form 28",
    "Form 29",
    "PAN Card",
    "Aadhaar Card",
    "PUC",
    "NOC",
  ]);

  const [errors, setErrors] = useState<any>({});

  const totalAdminCost = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  const sellerExpectedPrice = Number(pricing.sellerPrice) || 0;

  const netCostPrice =
    sellerExpectedPrice;

  const onlineAmount =
    Number(sellerSettlement.onlinePayment.amount) || 0;

  const cashAmount =
    Number(sellerSettlement.cashPayment.amount) || 0;

  const totalPaidAmount =
    onlineAmount + cashAmount;

  const dueAmount =
    netCostPrice - totalPaidAmount;


  const validateForm = () => {
    const newErrors: any = {};

    if (!seller.name.trim()) newErrors.sellerName = "Seller name is required";
    if (!seller.phone.trim())
      newErrors.sellerPhone = "Phone number is required";
    if (!seller.city.trim()) newErrors.sellerCity = "City is required";

    if (!car.brand.trim()) newErrors.carBrand = "Car brand is required";
    if (!car.model.trim()) newErrors.carModel = "Car model is required";
    if (
      !car.year ||
      parseInt(car.year) < 1990 ||
      parseInt(car.year) > new Date().getFullYear()
    )
      newErrors.carYear = "Valid year is required";
    if (!car.fuelType) newErrors.carFuelType = "Fuel type is required";
    if (!car.kmDriven || parseInt(car.kmDriven) < 0)
      newErrors.carKmDriven = "Valid KM driven is required";
    if (!car.registrationNumber.trim()) newErrors.carRegistrationNumber = "Registration number is required"; // Added validation

    if (rcDetails.rcOwner === "no" && !rcDetails.rcOwnerName.trim())
      newErrors.rcOwnerName = "RC owner name is required";

    if (!rcDetails.rcImage) newErrors.rcImage = "RC image is required";
    if (images.length < 4)
      newErrors.carImages =
        "Minimum 4 car images required (front, rear, engine, plate)";

    if (!pricing.sellerPrice || parseInt(pricing.sellerPrice) <= 0)
      newErrors.sellerPrice = "Valid seller price is required";
    if (!pricing.adminSellingPrice || parseInt(pricing.adminSellingPrice) <= 0)
      newErrors.adminSellingPrice = "Valid admin selling price is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== EXPENSES ==========
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


  const [videos, setVideos] = useState<File[]>([]);

  // ========== DOCUMENTS ==========
  const addDocumentRow = () => {
    setDocuments((prev) => [...prev, { label: "", file: null }]);
  };

  const updateDocumentLabel = (index: number, value: string) => {
    setDocuments((prev) => {
      const copy = [...prev];
      copy[index].label = value;
      return copy;
    });

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

  const updateDocumentFile = (index: number, file: File) => {
    setDocuments((prev) => {
      const copy = [...prev];
      copy[index].file = file;
      return copy;
    });
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!validateForm()) {
      alert("Please fill all required fields correctly");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();





      // Add seller details
      Object.entries(seller).forEach(([key, value]) => {
        formData.append(`seller[${key}]`, value);
      });

      // Add car details
      Object.entries(car).forEach(([key, value]) => {
        formData.append(`car[${key}]`, value);
      });

      // Add features
      if (features) {
        console.log("🔥 Frontend Features Data:", features);
        formData.append(`car[features]`, JSON.stringify(features));
      }

      // Add specifications
      if (specifications) {
        console.log("🔥 Frontend Specifications Data:", specifications);
        formData.append(`car[specifications]`, JSON.stringify(specifications));
      }

      // Debug entire form data
      console.log("🔥 Complete FormData being sent:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }


      // Add RC details under car
      // ✅ RC DETAILS (ROOT LEVEL)
      formData.append(`rcDetails[rcOwner]`, rcDetails.rcOwner);

      if (rcDetails.rcOwner === "no") {
        formData.append(
          `rcDetails[rcOwnerName]`,
          rcDetails.rcOwnerName
        );
      }
      if (rcDetails.rcImage) {
        formData.append("rcImage", rcDetails.rcImage);
      }

      // Add car images
      images.forEach((img, idx) => {
        if (img instanceof File) {
          formData.append("images", img);
        }
      });

      formData.append(
        "coverImageIndex",
        String(coverImageIndex)
      );


      videos.forEach((vid) => {
        if (vid instanceof File) {
          formData.append("videos", vid); // 🔥 FIX
        }
      });

      // Add pricing
      formData.append("sellerPrice", pricing.sellerPrice);
      formData.append("adminSellingPrice", pricing.adminSellingPrice);

      // ===== ADMIN EXPENSES =====
      const cleanedExpenses = expenses.filter(
        (e) => e.label && e.amount
      );

      formData.append(
        "adminExpenses",
        JSON.stringify(cleanedExpenses)
      );


      // ===== SELLER SETTLEMENT =====
      const finalSellerSettlement = {
        ...sellerSettlement,

        totalPurchaseAmount: netCostPrice,

        totalPaidAmount,

        dueAmount,
      };

      formData.append(
        "sellerSettlement",
        JSON.stringify(finalSellerSettlement)
      );

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Seller Settlement Details</CardTitle>
          <CardDescription>
            Track online and cash payments made to seller
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ONLINE PAYMENT */}
          <div>
            <h3 className="font-semibold mb-4">
              Online Payment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <Label>Payment Mode</Label>

                <Input
                  placeholder="UPI / NEFT / RTGS"
                  value={sellerSettlement.onlinePayment.paymentMode}
                  onChange={(e) =>
                    setSellerSettlement({
                      ...sellerSettlement,
                      onlinePayment: {
                        ...sellerSettlement.onlinePayment,
                        paymentMode: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label>Bank Name</Label>

                <Input
                  placeholder="HDFC Bank"
                  value={sellerSettlement.onlinePayment.bankName}
                  onChange={(e) =>
                    setSellerSettlement({
                      ...sellerSettlement,
                      onlinePayment: {
                        ...sellerSettlement.onlinePayment,
                        bankName: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label>Transaction ID</Label>

                <Input
                  placeholder="UTR / Transaction ID"
                  value={sellerSettlement.onlinePayment.transactionId}
                  onChange={(e) =>
                    setSellerSettlement({
                      ...sellerSettlement,
                      onlinePayment: {
                        ...sellerSettlement.onlinePayment,
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
                  placeholder="Amount"
                  value={sellerSettlement.onlinePayment.amount}
                  onChange={(e) =>
                    setSellerSettlement({
                      ...sellerSettlement,
                      onlinePayment: {
                        ...sellerSettlement.onlinePayment,
                        amount: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* CASH PAYMENT */}
          <div>
            <h3 className="font-semibold mb-4">
              Cash Payment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <Label>Cash Amount</Label>

                <Input
                  type="number"
                  placeholder="Cash Amount"
                  value={sellerSettlement.cashPayment.amount}
                  onChange={(e) =>
                    setSellerSettlement({
                      ...sellerSettlement,
                      cashPayment: {
                        ...sellerSettlement.cashPayment,
                        amount: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label>Received By</Label>

                <Input
                  placeholder="Received By"
                  value={sellerSettlement.cashPayment.receivedBy}
                  onChange={(e) =>
                    setSellerSettlement({
                      ...sellerSettlement,
                      cashPayment: {
                        ...sellerSettlement.cashPayment,
                        receivedBy: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="font-semibold mb-3">
              Settlement Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <Label>Total Purchase Amount</Label>

                <Input
                  value={netCostPrice}
                  readOnly
                />
              </div>

              <div>
                <Label>Total Paid Amount</Label>

                <Input
                  value={totalPaidAmount}
                  readOnly
                />
              </div>

              <div>
                <Label>Due Amount</Label>

                <Input
                  value={dueAmount}
                  readOnly
                />
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      // ===== SELLER DOCUMENTS =====
      documents.forEach((doc, i) => {
        if (doc.label && doc.file) {

          // ✅ LABEL
          formData.append(
            `sellerDocuments[${i}][label]`,
            doc.label
          );

          // ✅ FILE
          formData.append(
            `sellerDocuments`,
            doc.file
          );
        }
      });

      await api.post("/admin/offline-car", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Offline car added successfully!");
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding offline car");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-1 px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">
            Add Offline Car
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Manually add car details with complete seller, car, and pricing
            information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-4 sm:px-6">
          {/* ==================== SELLER DETAILS ==================== */}
          <div className="space-y-4 sm:space-y-5 p-4 sm:p-5 bg-blue-50 dark:bg-blue-950 rounded-xl">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100">
              👤 Seller Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Seller Type */}
              <div className="space-y-1">
                <Label className="text-sm">Seller Type *</Label>
                <Select
                  value={seller.type}
                  onValueChange={(value) =>
                    setSeller({ ...seller, type: value, sourcePlatform: "" })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="platform">
                      Platform (Cars24, etc)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Seller Name */}
              <div className="space-y-1">
                <Label htmlFor="sellerName" className="text-sm">
                  Seller Name *
                </Label>
                <Input
                  id="sellerName"
                  placeholder={
                    seller.type === "platform"
                      ? "Warehouse / Account Name"
                      : "Enter seller name"
                  }
                  value={seller.name}
                  onChange={(e) => {
                    // ✅ Auto capitalize first letter of every word
                    const value = e.target.value.replace(
                      /\b\w/g,
                      (char) => char.toUpperCase()
                    );

                    setSeller({
                      ...seller,
                      name: value,
                    });
                  }}
                  className={`h-11 ${errors.sellerName ? "border-red-500" : ""
                    }`}
                />

                {errors.sellerName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sellerName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="sellerPhone" className="text-sm">
                  Phone Number *
                </Label>
                <Input
                  id="sellerPhone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={seller.phone}
                  onChange={(e) => {
                    // ✅ Only numbers allowed
                    const value = e.target.value.replace(/\D/g, "");

                    // ✅ Limit to 10 digits
                    if (value.length <= 10) {
                      setSeller({
                        ...seller,
                        phone: value,
                      });
                    }
                  }}
                  maxLength={10}
                  className={`h-11 ${errors.sellerPhone ? "border-red-500" : ""
                    }`}
                />

                {errors.sellerPhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sellerPhone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="sellerEmail" className="text-sm">
                  Email
                </Label>
                <Input
                  id="sellerEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={seller.email}
                  onChange={(e) =>
                    setSeller({ ...seller, email: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              {/* Area */}
              <div className="space-y-1">
                <Label htmlFor="sellerArea" className="text-sm">
                  Area / Locality
                </Label>
                <Input
                  id="sellerArea"
                  placeholder="Enter area or locality"
                  value={seller.area}
                  onChange={(e) => {
                    // ✅ Auto capitalize first letter of every word
                    const value = e.target.value.replace(
                      /\b\w/g,
                      (char) => char.toUpperCase()
                    );

                    setSeller({
                      ...seller,
                      area: value,
                    });
                  }}
                  className="h-11"
                />
              </div>

              {/* Platform Name */}
              {seller.type === "platform" && (
                <div className="space-y-1">
                  <Label className="text-sm">Platform Name *</Label>
                  <Input
                    placeholder="Cars24 / CarDekho / Spinny"
                    value={seller.sourcePlatform}
                    onChange={(e) =>
                      setSeller({ ...seller, sourcePlatform: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
              )}

              {/* Alternate Phone */}
              <div className="space-y-1">
                <Label htmlFor="sellerAltPhone" className="text-sm">
                  Alternate Phone
                </Label>
                <Input
                  id="sellerAltPhone"
                  placeholder="Optional alternate phone"
                  value={seller.altPhone}
                  onChange={(e) =>
                    setSeller({ ...seller, altPhone: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <Label htmlFor="sellerCity" className="text-sm">
                  City *
                </Label>
                <Input
                  id="sellerCity"
                  placeholder="Enter city"
                  value={seller.city}
                  onChange={(e) =>
                    setSeller({ ...seller, city: e.target.value })
                  }
                  className={`h-11 ${errors.sellerCity ? "border-red-500" : ""}`}
                />
                {errors.sellerCity && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sellerCity}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ==================== CAR DETAILS ==================== */}
          <div className="space-y-4 sm:space-y-5 p-4 sm:p-5 bg-green-50 dark:bg-green-950 rounded-xl">
            <h3 className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-100">
              🚗 Car Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Brand */}
              <div className="space-y-1">
                <Label htmlFor="carBrand" className="text-sm">
                  Brand *
                </Label>
                <Input
                  id="carBrand"
                  placeholder="e.g., Maruti, Hyundai, Honda"
                  value={car.brand}
                  onChange={(e) => {
                    // ✅ Auto capitalize first letter of every word
                    const value = e.target.value.replace(
                      /\b\w/g,
                      (char) => char.toUpperCase()
                    );

                    setCar({
                      ...car,
                      brand: value,
                    });
                  }}
                  className={`h-11 ${errors.carBrand ? "border-red-500" : ""
                    }`}
                />

                {errors.carBrand && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.carBrand}
                  </p>
                )}
              </div>

              {/* Model */}
              <div className="space-y-1">
                <Label htmlFor="carModel" className="text-sm">
                  Name *
                </Label>
                <Input
                  id="carModel"
                  placeholder="e.g., Swift, Creta, City"
                  value={car.model}
                  onChange={(e) => {
                    const value = e.target.value;

                    const capitalized =
                      value.charAt(0).toUpperCase() +
                      value.slice(1);

                    setCar({
                      ...car,
                      model: capitalized,
                    });
                  }}
                  className={`h-11 ${errors.carModel ? "border-red-500" : ""}`}
                />

                {errors.carModel && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.carModel}
                  </p>
                )}
              </div>

              {/* Year */}
              <div className="space-y-1">
                <Label htmlFor="carYear" className="text-sm">
                  Year *
                </Label>
                <Input
                  id="carYear"
                  type="number"
                  placeholder="e.g., 2020"
                  value={car.year}
                  onChange={(e) => setCar({ ...car, year: e.target.value })}
                  className={`h-11 ${errors.carYear ? "border-red-500" : ""}`}
                />
                {errors.carYear && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.carYear}
                  </p>
                )}
              </div>

              {/* Variant */}
              <div className="space-y-1">
                <Label htmlFor="carVariant" className="text-sm">
                  Variant
                </Label>
                <Input
                  id="carVariant"
                  placeholder="e.g., LXI, VXI, ZXI, AMT, SX, ZX"
                  value={car.variant}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();

                    setCar({
                      ...car,
                      variant: value,
                    });
                  }}
                  className="h-11"
                />
              </div>

              {/* Fuel Type */}
              <div className="space-y-1">
                <Label htmlFor="carFuelType" className="text-sm">
                  Fuel Type *
                </Label>
                <Select
                  value={car.fuelType}
                  onValueChange={(value) => setCar({ ...car, fuelType: value })}
                >
                  <SelectTrigger
                    id="carFuelType"
                    className={`h-11 ${errors.carFuelType ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="CNG">CNG</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                {errors.carFuelType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.carFuelType}
                  </p>
                )}
              </div>

              {/* Transmission */}
              <div className="space-y-1">
                <Label htmlFor="carTransmission" className="text-sm">
                  Transmission *
                </Label>
                <Select
                  value={car.transmission}
                  onValueChange={(value) =>
                    setCar({ ...car, transmission: value })
                  }
                >
                  <SelectTrigger
                    id="carTransmission"
                    className={`h-11 ${errors.carTransmission ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="AMT">AMT</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                    <SelectItem value="DCT">DCT</SelectItem>
                  </SelectContent>
                </Select>
                {errors.carTransmission && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.carTransmission}
                  </p>
                )}
              </div>

              {/* KM Driven */}
              <div className="space-y-1">
                <Label htmlFor="carKmDriven" className="text-sm">
                  KM Driven *
                </Label>
                <Input
                  id="carKmDriven"
                  type="number"
                  placeholder="e.g., 45000"
                  value={car.kmDriven}
                  onChange={(e) =>
                    setCar({ ...car, kmDriven: e.target.value })
                  }
                  className={`h-11 ${errors.carKmDriven ? "border-red-500" : ""}`}
                />
                {errors.carKmDriven && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.carKmDriven}
                  </p>
                )}
              </div>

              {/* Registration Number */}
              <div className="space-y-1">
                <Label htmlFor="carRegistrationNumber" className="text-sm">
                  Registration Number *
                </Label>
                <Input
                  id="carRegistrationNumber"
                  placeholder="e.g., MP04CG1234"
                  value={car.registrationNumber}
                  onChange={(e) => {
                    // ✅ Remove spaces and convert to uppercase
                    const value = e.target.value
                      .replace(/\s/g, "")
                      .toUpperCase();

                    // ✅ Limit max length
                    if (value.length <= 10) {
                      setCar({
                        ...car,
                        registrationNumber: value,
                      });
                    }
                  }}
                  maxLength={10}
                  className={`h-11 ${errors.carRegistrationNumber
                    ? "border-red-500"
                    : ""
                    }`}
                />

                {errors.carRegistrationNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.carRegistrationNumber}
                  </p>
                )}
              </div>

              {/* Condition */}
              <div className="md:col-span-2 space-y-1">
                <Label htmlFor="carCondition" className="text-sm">
                  Condition
                </Label>
                <Input
                  id="carCondition"
                  placeholder="e.g., Excellent, Good, Fair"
                  value={car.condition}
                  onChange={(e) => {
                    // ✅ Auto capitalize first letter of every word
                    const value = e.target.value.replace(
                      /\b\w/g,
                      (char) => char.toUpperCase()
                    );

                    setCar({
                      ...car,
                      condition: value,
                    });
                  }}
                  className="h-11"
                />
              </div>
            </div>
          </div>


          {/* ==================== CAR IMAGES ==================== */}
          <div className="space-y-4 sm:space-y-5 p-4 sm:p-5 bg-indigo-50 dark:bg-indigo-950 rounded-xl">
            <h3 className="text-base sm:text-lg font-semibold text-indigo-900 dark:text-indigo-100">
              📸 Car Images <span className="text-xs font-normal">(Minimum 4 Required)</span>
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Required: Front, Rear, Engine Bay, Number Plate + Interior photos
            </p>

            {/* IMAGES GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {images.map((img, i) => {
                const src =
                  typeof img === "string"
                    ? img
                    : URL.createObjectURL(img);

                const isCover = i === coverImageIndex;

                return (
                  <div
                    key={i}
                    className="
        relative
        border
        rounded-xl
        p-1.5
        bg-white dark:bg-gray-800
        shadow-sm
        overflow-hidden
      "
                  >
                    {/* IMAGE */}
                    <img
                      src={src}
                      alt={`Car image ${i + 1}`}
                      className="
          w-full
          aspect-square
          object-cover
          rounded-lg
        "
                    />

                    {/* COVER BADGE */}
                    {isCover && (
                      <div
                        className="
            absolute top-2 left-2
            bg-green-600 text-white
            text-[10px]
            px-2 py-1
            rounded-full
            font-semibold
          "
                      >
                        Cover
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {/* SET COVER */}
                      <button
                        type="button"
                        onClick={() =>
                          setCoverImageIndex(i)
                        }
                        className="
            bg-black/70 text-white
            text-[10px]
            px-2 py-1
            rounded
            hover:bg-black
          "
                      >
                        Cover
                      </button>

                      {/* REMOVE */}
                      <button
                        type="button"
                        onClick={() => {
                          setImages((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          );

                          // FIX INDEX
                          if (coverImageIndex >= i) {
                            setCoverImageIndex(0);
                          }
                        }}
                        className="
            bg-red-600 text-white
            w-6 h-6 rounded-full
            text-sm
            flex items-center justify-center
            hover:bg-red-700
          "
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ADD IMAGE CARD */}
              {images.length < 10 && (
                <label
                  className="
          border-2 border-dashed
          rounded-xl
          p-4
          flex flex-col
          items-center
          justify-center
          cursor-pointer
          bg-white/70
          hover:bg-white
          transition
          min-h-[120px]
        "
                >
                  <span className="text-3xl font-light text-gray-400">+</span>
                  <span className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Add Image
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setImages((prev) =>
                          [...prev, ...Array.from(e.target.files)].slice(0, 10)
                        );
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* ERROR */}
            {errors.carImages && (
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.carImages}
              </p>
            )}

            {/* COUNTER */}
            <p className="text-xs text-muted-foreground">
              Images selected: <b>{images.length}</b> / 10
            </p>
          </div>

          <div className="mt-4">
            <label className="block font-semibold mb-2">Upload Videos</label>

            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);

                setVideos((prev) => {
                  const updated = [...prev, ...files];
                  return updated.slice(0, 3); // max 3
                });
              }}
            />
          </div>

          {/* ==================== RC DETAILS ==================== */}
          <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              📄 RC Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rcOwner">Is RC in seller's name? *</Label>
                <Select
                  value={rcDetails.rcOwner}
                  onValueChange={(value) =>
                    setRcDetails({
                      ...rcDetails,
                      rcOwner: value,
                      rcOwnerName: "",
                      rcImage: null,
                    })
                  }
                >
                  <SelectTrigger id="rcOwner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {rcDetails.rcOwner === "no" && (
                <div>
                  <Label htmlFor="rcOwnerName">RC Owner Name *</Label>
                  <Input
                    id="rcOwnerName"
                    placeholder="Enter RC owner's name"
                    value={rcDetails.rcOwnerName}
                    onChange={(e) => {
                      const value = e.target.value;

                      // ✅ Capitalize every word
                      const capitalized = value
                        .toLowerCase()
                        .replace(/\b\w/g, (char) =>
                          char.toUpperCase()
                        );

                      setRcDetails({
                        ...rcDetails,
                        rcOwnerName: capitalized,
                      });
                    }}
                    className={errors.rcOwnerName ? "border-red-500" : ""}
                  />

                  {errors.rcOwnerName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.rcOwnerName}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ================= RC IMAGE UPLOAD (ALWAYS REQUIRED) ================= */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">RC Image Upload *</Label>

              {(() => {
                const rcPreview =
                  rcDetails.rcImage instanceof File
                    ? URL.createObjectURL(rcDetails.rcImage)
                    : null;

                return (
                  <div
                    className="
          w-full
          max-w-full sm:max-w-xs
          border
          rounded-xl
          p-4
          space-y-3
          bg-white dark:bg-gray-800
          shadow-sm
        "
                  >
                    {/* IMAGE PREVIEW */}
                    <div
                      className="
            relative
            w-full
            aspect-square
            border
            rounded-xl
            bg-muted
            flex
            items-center
            justify-center
            overflow-hidden
          "
                    >
                      {rcPreview ? (
                        <img
                          src={rcPreview}
                          alt="RC Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          No RC Image Selected
                        </span>
                      )}
                    </div>

                    {/* FILE INPUT */}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      id="upload-rc"
                      onChange={(e) => {
                        if (e.target.files) {
                          setRcDetails({
                            ...rcDetails,
                            rcImage: e.target.files[0],
                          });
                        }
                      }}
                    />

                    {/* ACTION BUTTON */}
                    <label
                      htmlFor="upload-rc"
                      className="
            w-full
            inline-flex
            items-center
            justify-center
            gap-2
            px-4 py-2.5
            rounded-lg
            text-sm
            font-medium
            text-blue-600
            border border-blue-200
            bg-blue-50
            cursor-pointer
            hover:bg-blue-100
            transition
          "
                    >
                      {rcPreview ? "Replace RC Image" : "Upload RC Image"}
                    </label>

                    {/* ERROR */}
                    {errors.rcImage && (
                      <p className="text-red-500 text-xs sm:text-sm">
                        {errors.rcImage}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>

          {/* ==================== FEATURES & SPECIFICATIONS ==================== */}
          <div className="space-y-6 p-4 sm:p-5 bg-white dark:bg-gray-950 rounded-2xl border shadow-sm">
            <AddMoreFeature
              features={features}
              setFeatures={setFeatures}
              specifications={specifications}
              setSpecifications={setSpecifications}
            />
          </div>

          {/* ==================== ADMIN COST BREAKDOWN ==================== */}
          <div className="space-y-6 p-4 sm:p-5 bg-white dark:bg-gray-950 rounded-2xl border shadow-sm">
            {/* ================= HEADER ================= */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                💸 Admin Cost Breakdown
              </h3>
              <span className="text-xs text-gray-500">
                Auto calculated
              </span>
            </div>

            {/* ================= EXPENSE ROWS ================= */}
            <div className="space-y-3">
              {expenses.map((item, index) => (
                <div
                  key={index}
                  className="
          grid
          grid-cols-1
          sm:grid-cols-6
          gap-3
          items-center
          bg-gray-50 dark:bg-gray-900
          p-3
          rounded-xl
        "
                >
                  {/* LABEL */}
                  <div className="sm:col-span-3">
                    <Input
                      list={`expense-options-${index}`}
                      placeholder="DP, Diesel, Mechanic..."
                      value={item.label}
                      className="bg-white dark:bg-gray-950"
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
                    />

                    <datalist id={`expense-options-${index}`}>
                      {expenseOptions.map((opt, i) => (
                        <option key={i} value={opt} />
                      ))}
                    </datalist>
                  </div>

                  {/* AMOUNT */}
                  <div className="sm:col-span-2">
                    <Input
                      type="number"
                      placeholder="₹ Amount"
                      value={item.amount}
                      className="bg-white dark:bg-gray-950"
                      onChange={(e) =>
                        updateExpense(index, "amount", e.target.value)
                      }
                    />
                  </div>

                  {/* REMOVE */}
                  <div className="flex justify-end sm:justify-center">
                    <button
                      onClick={() => removeExpense(index)}
                      className="
              text-red-600
              text-sm
              font-medium
              hover:underline
              px-2 py-1
            "
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= ADD EXPENSE ================= */}
            <button
              onClick={addExpenseRow}
              className="
      inline-flex
      items-center
      gap-1
      text-blue-600
      text-sm
      font-medium
      hover:underline
    "
            >
              + Add another expense
            </button>

            {/* ================= SUMMARY ================= */}
            <div className="mt-6 border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Seller Expected Price
                </span>
                <span className="font-semibold text-gray-900">
                  ₹{sellerExpectedPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Total Admin Cost
                </span>
                <span className="font-semibold text-red-600">
                  ₹{totalAdminCost.toLocaleString()}
                </span>
              </div>

              {/* NET COST */}
              <div className="flex justify-between items-center mt-2 pt-3 border-t">
                <span className="text-base font-semibold text-gray-900">
                  Net Cost Price
                </span>
                <span className="text-lg sm:text-xl font-bold text-green-700">
                  ₹{netCostPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>




          {/* ==================== SELLER DOCUMENTS ==================== */}
          <div className="space-y-4 p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border">
            <h3 className="text-base sm:text-lg font-semibold">
              📂 Seller Documents
            </h3>

            {documents.map((doc, index) => (
              <div
                key={index}
                className="
        grid
        grid-cols-1
        sm:grid-cols-6
        gap-3
        items-start
        bg-white dark:bg-gray-900
        p-3
        rounded-xl
        border
      "
              >
                {/* DOCUMENT LABEL */}
                <div className="sm:col-span-3">
                  <Input
                    list={`doc-options-${index}`}
                    placeholder="RC, PAN, Insurance..."
                    value={doc.label}
                    onChange={(e) =>
                      updateDocumentLabel(index, e.target.value)
                    }
                  />

                  <datalist id={`doc-options-${index}`}>
                    {documentOptions.map((opt, i) => (
                      <option key={i} value={opt} />
                    ))}
                  </datalist>
                </div>

                {/* FILE UPLOAD */}
                <div className="sm:col-span-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        updateDocumentFile(index, e.target.files[0]);
                      }
                    }}
                    className="
            w-full
            text-sm
            file:mr-3
            file:px-3
            file:py-1.5
            file:rounded-lg
            file:border-0
            file:bg-blue-50
            file:text-blue-600
            hover:file:bg-blue-100
            cursor-pointer
          "
                  />
                </div>

                {/* REMOVE */}
                <div className="flex justify-end sm:justify-center">
                  <button
                    onClick={() => removeDocument(index)}
                    className="
            text-red-600
            text-sm
            font-medium
            hover:underline
            px-2 py-1
          "
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* ADD DOCUMENT */}
            <button
              onClick={addDocumentRow}
              className="
      inline-flex
      items-center
      gap-1
      text-blue-600
      text-sm
      font-medium
      hover:underline
    "
            >
              + Add another document
            </button>
          </div>


          {/* ==================== PRICING DETAILS ==================== */}
          <div className="space-y-4 p-4 sm:p-5 bg-orange-50 dark:bg-orange-950 rounded-xl border">
            <h3 className="text-base sm:text-lg font-semibold text-orange-900 dark:text-orange-100">
              💰 Pricing & Buyer Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SELLER PRICE */}
              <div>
                <Label htmlFor="sellerPrice">
                  Seller Expected Price (₹) *
                </Label>
                <Input
                  id="sellerPrice"
                  type="number"
                  placeholder="e.g., 500000"
                  value={pricing.sellerPrice}
                  onChange={(e) =>
                    setPricing({ ...pricing, sellerPrice: e.target.value })
                  }
                  className={`mt-1 ${errors.sellerPrice ? "border-red-500" : ""}`}
                />
                {errors.sellerPrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sellerPrice}
                  </p>
                )}
              </div>

              {/* ADMIN PRICE */}
              <div>
                <Label htmlFor="adminSellingPrice">
                  Admin Selling Price (₹) *
                </Label>
                <Input
                  id="adminSellingPrice"
                  type="number"
                  placeholder="e.g., 550000"
                  value={pricing.adminSellingPrice}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      adminSellingPrice: e.target.value,
                    })
                  }
                  className={`mt-1 ${errors.adminSellingPrice ? "border-red-500" : ""
                    }`}
                />
                {errors.adminSellingPrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.adminSellingPrice}
                  </p>
                )}
              </div>
            </div>
          </div>



          {/* ==================== SELLER SETTLEMENT DETAILS ==================== */}
          <div className="space-y-6 p-4 sm:p-5 bg-blue-50 dark:bg-blue-950 rounded-xl border">

            <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100">
              🏦 Seller Settlement Details
            </h3>

            {/* ONLINE PAYMENT */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm sm:text-base">
                Online Payment
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <Label>Payment Mode</Label>

                  <Input
                    placeholder="UPI / NEFT / RTGS"
                    value={sellerSettlement.onlinePayment.paymentMode}
                    onChange={(e) =>
                      setSellerSettlement({
                        ...sellerSettlement,
                        onlinePayment: {
                          ...sellerSettlement.onlinePayment,
                          paymentMode: e.target.value,
                        },
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Bank Name</Label>

                  <Input
                    placeholder="HDFC Bank"
                    value={sellerSettlement.onlinePayment.bankName}
                    onChange={(e) =>
                      setSellerSettlement({
                        ...sellerSettlement,
                        onlinePayment: {
                          ...sellerSettlement.onlinePayment,
                          bankName: e.target.value,
                        },
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Transaction ID</Label>

                  <Input
                    placeholder="Transaction / UTR ID"
                    value={sellerSettlement.onlinePayment.transactionId}
                    onChange={(e) =>
                      setSellerSettlement({
                        ...sellerSettlement,
                        onlinePayment: {
                          ...sellerSettlement.onlinePayment,
                          transactionId: e.target.value,
                        },
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Online Amount (₹)</Label>

                  <Input
                    type="number"
                    placeholder="e.g., 200000"
                    value={sellerSettlement.onlinePayment.amount}
                    onChange={(e) =>
                      setSellerSettlement({
                        ...sellerSettlement,
                        onlinePayment: {
                          ...sellerSettlement.onlinePayment,
                          amount: e.target.value,
                        },
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* CASH PAYMENT */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm sm:text-base">
                Cash Payment
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <Label>Cash Amount (₹)</Label>

                  <Input
                    type="number"
                    placeholder="e.g., 50000"
                    value={sellerSettlement.cashPayment.amount}
                    onChange={(e) =>
                      setSellerSettlement({
                        ...sellerSettlement,
                        cashPayment: {
                          ...sellerSettlement.cashPayment,
                          amount: e.target.value,
                        },
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Received By</Label>

                  <Input
                    placeholder="Seller Name"
                    value={sellerSettlement.cashPayment.receivedBy}
                    onChange={(e) =>
                      setSellerSettlement({
                        ...sellerSettlement,
                        cashPayment: {
                          ...sellerSettlement.cashPayment,
                          receivedBy: e.target.value,
                        },
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-white dark:bg-black/20 rounded-lg border p-4">

              <h4 className="font-medium text-sm sm:text-base mb-4">
                Settlement Summary
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div>
                  <Label>Total Purchase Amount</Label>

                  <Input
                    value={netCostPrice}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>

                <div>
                  <Label>Total Paid Amount</Label>

                  <Input
                    value={totalPaidAmount}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>

                <div>
                  <Label>Due Amount</Label>

                  <Input
                    value={dueAmount}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ==================== SUBMIT BUTTON ==================== */}
          <div
            className="
    flex flex-col
    sm:flex-row
    gap-3
    pt-6
  "
          >
            <Button
              onClick={submit}
              disabled={loading}
              className="
      w-full
      sm:w-auto
      bg-green-600
      hover:bg-green-700
      text-base
      py-3
      sm:py-2
    "
            >
              {loading ? "Saving..." : "✅ Save Offline Car"}
            </Button>

            <Button
              onClick={() => navigate("/admin/dashboard")}
              variant="outline"
              className="
      w-full
      sm:w-auto
      py-3
      sm:py-2
    "
            >
              Cancel
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default AddOfflineCar;
