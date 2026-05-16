require("dotenv").config();
const SellRequest = require("../models/SellRequest");
const Car = require("../models/Car");
const BuyerDetails = require("../models/BuyerDetails");
const AdminExpenseMaster = require("../models/AdminExpenseMaster");
const SellerDocumentMaster = require("../models/SellerDocumentMaster");
const Sale = require("../models/Sale");
const Payment = require("../models/Payment");
const Loan = require("../models/Loan");
const PDFDocument = require("pdfkit");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const PurchasePayment = require("../models/PurchasePayment");

// ===============================
// GET /api/admin/sell-requests
// ===============================
exports.getPendingSellRequests = async (req, res) => {
  const requests = await SellRequest.find({ status: "PENDING" }).sort({
    createdAt: -1,
  });

  res.json(requests);
};

// ===============================
// PUT /api/admin/approve/:id
// ===============================

exports.approveSellRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      adminSellingPrice,
      adminExpenses = [],
      sellerDocuments = [],
      sellerSettlement,
      features,
    } = req.body;

    console.log(
      "🔥 sellerSettlement =>",
      sellerSettlement
    );

    console.log(
      "🔥 CASH =>",
      sellerSettlement?.cashPayment
    );

    const parsedSellerSettlement =
      typeof sellerSettlement === "string"
        ? JSON.parse(sellerSettlement)
        : sellerSettlement || {};

    const request = await SellRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }
    // 🔥 DEBUG (IMPORTANT)
    console.log("🚨 APPROVE TIME VIDEOS 👉", request.car?.videos);
    console.log("🚨 APPROVE TIME IMAGES 👉", request.car?.images);

    /* ================================
       SAVE NEW EXPENSE LABELS
    ================================= */
    if (Array.isArray(adminExpenses)) {
      for (const exp of adminExpenses) {
        if (exp.label) {
          await AdminExpenseMaster.updateOne(
            { label: exp.label.trim() },
            { $setOnInsert: { label: exp.label.trim() } },
            { upsert: true }
          );
        }
      }
    }

    /* ================================
       SAVE NEW DOCUMENT LABELS
    ================================= */
    if (Array.isArray(sellerDocuments)) {
      for (const doc of sellerDocuments) {
        if (doc.label) {
          await SellerDocumentMaster.updateOne(
            { label: doc.label.trim() },
            { $setOnInsert: { label: doc.label.trim() } },
            { upsert: true }
          );
        }
      }
    }

    /* ================================
       UPDATE SELL REQUEST
    ================================= */
    request.adminSellingPrice = Number(adminSellingPrice);

    request.adminExpenses = adminExpenses.map((e) => ({
      label: e.label,
      amount: Number(e.amount),
    }));

    request.sellerDocuments = sellerDocuments.map((d) => ({
      label: d.label,
      fileUrls: Array.isArray(d.fileUrls) ? d.fileUrls : [],
    }));

    request.car.features = normalizeFeatures(
      features || request.car?.features || {}
    );

    /* ================================
       UPDATE SELLER SETTLEMENT
    ================================= */


    request.sellerSettlement = parsedSellerSettlement;


    request.status = "APPROVED";
    request.approvedAt = new Date();

    /* ================================
       ADD INITIAL PAYMENTS TO REQUEST
    ================================ */
    request.purchasePayments = request.purchasePayments || [];

    // CASH PAYMENT ENTRY
    if (
      parsedSellerSettlement?.cashPayment?.amount > 0
    ) {
      request.purchasePayments.push({
        amount: Number(
          parsedSellerSettlement.cashPayment.amount
        ) || 0,
        paymentType: "CASH",
        paymentDate:
          parsedSellerSettlement.cashPayment
            ?.paymentDate || new Date(),
        note:
          parsedSellerSettlement.cashPayment
            ?.notes || "",
      });
    }

    // ONLINE PAYMENT ENTRY
    if (
      parsedSellerSettlement?.onlinePayment?.amount > 0
    ) {
      request.purchasePayments.push({
        amount: Number(
          parsedSellerSettlement.onlinePayment.amount
        ) || 0,
        paymentType:
          parsedSellerSettlement.onlinePayment
            ?.paymentMode || "ONLINE",
        paymentDate:
          parsedSellerSettlement.onlinePayment
            ?.paymentDate || new Date(),
        note:
          parsedSellerSettlement.onlinePayment
            ?.notes || "",
      });
    }

    /* ================================
       UPDATE SELLER SETTLEMENT TOTALS
    ================================ */
    const totalPurchaseAmount = request.sellerPrice || 0;
    const totalPaidAmount = request.purchasePayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const dueAmount = Math.max(
      0,
      totalPurchaseAmount - totalPaidAmount
    );

    request.sellerSettlement = {
      ...request.sellerSettlement,
      totalPurchaseAmount,
      totalPaidAmount,
      dueAmount,
    };

    await request.save();

    /* ================================
       CREATE INITIAL PAYMENT TIMELINE (PurchasePayment Collection)
    ================================ */

    // CASH PAYMENT ENTRY
    if (
      parsedSellerSettlement?.cashPayment?.amount > 0
    ) {
      await PurchasePayment.create({
        purchaseId: request._id,

        amount:
          Number(
            sellerSettlement.cashPayment.amount
          ) || 0,

        paymentType: "CASH",

        paymentDate:
          sellerSettlement.cashPayment
            ?.paymentDate || new Date(),

        note:
          sellerSettlement.cashPayment
            ?.notes || "",
      });
    }

    // ONLINE PAYMENT ENTRY
    if (
      sellerSettlement?.onlinePayment?.amount > 0
    ) {
      await PurchasePayment.create({
        purchaseId: request._id,

        amount:
          Number(
            sellerSettlement.onlinePayment.amount
          ) || 0,

        paymentType:
          sellerSettlement.onlinePayment
            ?.paymentMode || "ONLINE",

        paymentDate:
          sellerSettlement.onlinePayment
            ?.paymentDate || new Date(),

        note:
          sellerSettlement.onlinePayment
            ?.notes || "",
      });
    }


    /* ================================
       CREATE LIVE CAR (🔥 FIXED)
    ================================= */
    const car = await Car.create({
      sellRequestId: request._id,

      source: request.source,

      seller: request.seller,

      adminExpenses: request.adminExpenses || [],

      sellerDocuments: request.sellerDocuments || [],

      sellerSettlement: request.sellerSettlement || {},

      extraAdminExpenses: request.extraAdminExpenses || [],

      car: {
        ...request.car,
        year: request.car?.year || req.body.year,

        images: Array.isArray(request.car?.images)
          ? request.car.images
          : [],

        videos: Array.isArray(request.car?.videos)
          ? request.car.videos
          : [],
      },

      sellerPrice: request.sellerPrice,
      adminSellingPrice: request.adminSellingPrice,

      rcDetails: request.rcDetails,

      status: "LIVE",
    });
    console.log("✅ Car created with videos 👉", car.car?.videos);

    return res.status(200).json({
      message: "Car approved & LIVE",
      car,
      seller: request.seller,
      sellRequestId: request._id,
    });
  } catch (error) {
    console.error("❌ approveSellRequest ERROR:", error.message);
    console.error("❌ Full Error Stack:", error);

    // More detailed error message for debugging
    return res.status(500).json({
      message: "Server error",
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`) : null
    });
  }
};



exports.updateSettlement = async (req, res) => {
  console.log("🔥 UPDATE SETTLEMENT API HIT");
  console.log("BODY 👉", req.body);
  try {
    const { id } = req.params;

    const { sellerSettlement } = req.body;

    const request = await SellRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    /* ================================
       UPDATE SELLER SETTLEMENT
    ================================= */

    if (sellerSettlement) {
      request.sellerSettlement = {
        onlinePayment: {
          paymentMode:
            sellerSettlement.onlinePayment
              ?.paymentMode || "",

          bankName:
            sellerSettlement.onlinePayment
              ?.bankName || "",

          transactionId:
            sellerSettlement.onlinePayment
              ?.transactionId || "",

          amount:
            Number(
              sellerSettlement.onlinePayment
                ?.amount
            ) || 0,

          paymentDate:
            sellerSettlement.onlinePayment
              ?.paymentDate || null,

          notes:
            sellerSettlement.onlinePayment
              ?.notes || "",
        },

        cashPayment: {
          amount:
            Number(
              sellerSettlement.cashPayment
                ?.amount
            ) || 0,

          receivedBy:
            sellerSettlement.cashPayment
              ?.receivedBy || "",

          paymentDate:
            sellerSettlement.cashPayment
              ?.paymentDate || null,

          notes:
            sellerSettlement.cashPayment
              ?.notes || "",
        },

        totalPurchaseAmount:
          Number(
            sellerSettlement.totalPurchaseAmount
          ) || 0,

        totalPaidAmount:
          Number(
            sellerSettlement.totalPaidAmount
          ) || 0,

        dueAmount:
          Number(
            sellerSettlement.dueAmount
          ) || 0,
      };
    }

    await request.save();

    await Car.updateOne(
      { sellRequestId: request._id },
      {
        $set: {
          sellerSettlement:
            request.sellerSettlement,
        },
      }
    );

    return res.status(200).json({
      message:
        "Settlement updated successfully",
      sellerSettlement:
        request.sellerSettlement,
    });

  } catch (error) {
    console.error(
      "❌ updateSettlement ERROR:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// HELPER: Normalize Features
// ===============================
const normalizeFeatures = (features = {}) => {
  const convert = (obj) =>
    Array.isArray(obj)
      ? obj
      : Object.keys(obj || {}).filter((key) => obj[key] === true);

  return {
    entertainment: convert(features.entertainment),
    safety: convert(features.safety),
    comfort: convert(features.comfort),
    interiorExterior: convert(features.interiorExterior),
    custom: features.custom || [],
  };
};

// ===============================
// POST /api/admin/offline-car
// ===============================
exports.addOfflineCar = async (req, res) => {
  try {


    const { seller, car, rcDetails, sellerPrice, adminSellingPrice, sellerSettlement } = req.body;

    console.log("Body of request:", req.body);

    // console.log("🔥 Backend Received Car Data:", car);
    // console.log("🔥 Backend Received Features:", car.features);


    // Parse features and specifications if they come as strings
    // ================= PARSE CAR =================
    let parsedCar = { ...car };

    // Parse features
    if (car?.features && typeof car.features === "string") {
      try {
        parsedCar.features = JSON.parse(car.features);
      } catch {
        parsedCar.features = {};
      }
    }

    parsedCar.features = normalizeFeatures(parsedCar.features);

    // Parse specifications (optional)
    if (car?.specifications && typeof car.specifications === "string") {
      try {
        parsedCar.specifications = JSON.parse(car.specifications);
      } catch {
        parsedCar.specifications = {};
      }
    }




    // ================= ADMIN EXPENSES =================
    let adminExpenses = [];
    if (req.body.adminExpenses) {
      try {
        adminExpenses = JSON.parse(req.body.adminExpenses);
      } catch (err) {
        console.log("❌ Invalid adminExpenses JSON");
      }
    }

    // ================= SELLER DOCUMENTS =================
    let sellerDocuments = [];

    console.log("📄 BODY:", req.body);
    console.log("📁 FILES:", req.files);

    // ✅ GET LABELS
    const sellerDocLabels =
      req.body.sellerDocuments || [];

    // ✅ GET FILES
    const sellerDocFiles =
      req.files?.sellerDocuments || [];

    sellerDocuments = sellerDocFiles.map(
      (file, index) => ({
        label:
          sellerDocLabels?.[index]?.label ||
          `Document ${index + 1}`,

        fileUrls: [file.path],
      })
    );

    console.log(
      "✅ FINAL SELLER DOCS:",
      sellerDocuments
    );


    // ================= SELLER SETTLEMENT =================
    let parsedSellerSettlement = {};

    if (req.body.sellerSettlement) {
      try {
        parsedSellerSettlement = JSON.parse(
          req.body.sellerSettlement,
          console.log("🔥 Parsed sellerSettlement:", parsedSellerSettlement)

        );

      } catch (err) {
        console.log("❌ Invalid sellerSettlement JSON");
      }
    }


    // ================= VALIDATION =================
    if (!seller?.name || !seller?.phone || !seller?.city) {
      return res.status(400).json({ message: "Missing required seller details" });
    }

    if (!car?.brand || !car?.year || !car?.fuelType || !car?.kmDriven) {
      return res.status(400).json({ message: "Missing required car details" });
    }

    if (!sellerPrice || sellerPrice <= 0) {
      return res.status(400).json({ message: "Invalid seller price" });
    }

    if (!req.files || !req.files.rcImage) {
      return res.status(400).json({ message: "RC image is required" });
    }

    if (!req.files || req.files.images.length < 4) {
      return res.status(400).json({ message: "Minimum 4 car images required" });
    }

    // ================= FILE UPLOAD =================
    const rcImageUrl = req.files.rcImage[0].path;
    const carImageUrls = req.files.images.map((file) => file.path);

    const coverImageIndex =
      Number(req.body.coverImageIndex || 0);

    const coverImage =
      carImageUrls[coverImageIndex] ||
      carImageUrls[0];





    // ================= VIDEOS =================
    // ================= VIDEOS =================
    const videoFiles = req.files?.videos || [];

    console.log("VIDEO FILES 👉", videoFiles);

    const videoUrls = [];

    for (const file of videoFiles) {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "video",
        folder: "car-dealership/videos",
      });

      videoUrls.push(result.secure_url);
    }

    console.log("VIDEO URLS 👉", videoUrls);

    // ================= CREATE SELL REQUEST =================
    console.log("Car data being saved in SellRequest:", {
      ...parsedCar,
      images: carImageUrls,
      videos: videoUrls,
    });

    console.log("🔥 FINAL parsedCar 👉", parsedCar);

    const sellRequest = await SellRequest.create({
      sellerSettlement: parsedSellerSettlement,
      source: "OFFLINE",
      seller,
      car: {
        ...parsedCar,

        coverImage,

        // 🔥 FORCE YEAR FIX
        year: parsedCar.year || car.year || req.body.year,

        images: carImageUrls,
        videos: videoUrls,
      },
      rcDetails: {
        ...rcDetails,
        rcImage: rcImageUrl,
      },

      adminExpenses,      //  FIXED
      sellerDocuments,    //  FIXED

      sellerPrice: Number(sellerPrice),
      adminSellingPrice: Number(adminSellingPrice) || Number(sellerPrice),
      status: "APPROVED",
    });

    /* ================================
       ADD INITIAL PAYMENTS TO REQUEST (OFFLINE CAR)
    ================================ */
    let parsedOfflineSettlement = {};
    if (typeof parsedSellerSettlement === "string") {
      try {
        parsedOfflineSettlement = JSON.parse(parsedSellerSettlement);
      } catch {
        parsedOfflineSettlement = parsedSellerSettlement || {};
      }
    } else {
      parsedOfflineSettlement = parsedSellerSettlement || {};
    }

    sellRequest.purchasePayments = sellRequest.purchasePayments || [];

    // CASH PAYMENT ENTRY
    if (
      parsedOfflineSettlement?.cashPayment?.amount > 0
    ) {
      sellRequest.purchasePayments.push({
        amount: Number(
          parsedOfflineSettlement.cashPayment.amount
        ) || 0,
        paymentType: "CASH",
        paymentDate:
          parsedOfflineSettlement.cashPayment
            ?.paymentDate || new Date(),
        note:
          parsedOfflineSettlement.cashPayment
            ?.notes || "",
      });
    }

    // ONLINE PAYMENT ENTRY
    if (
      parsedOfflineSettlement?.onlinePayment?.amount > 0
    ) {
      sellRequest.purchasePayments.push({
        amount: Number(
          parsedOfflineSettlement.onlinePayment.amount
        ) || 0,
        paymentType:
          parsedOfflineSettlement.onlinePayment
            ?.paymentMode || "ONLINE",
        paymentDate:
          parsedOfflineSettlement.onlinePayment
            ?.paymentDate || new Date(),
        note:
          parsedOfflineSettlement.onlinePayment
            ?.notes || "",
      });
    }

    /* ================================
       UPDATE SELLER SETTLEMENT TOTALS (OFFLINE CAR)
    ================================ */
    const offlineTotalPurchase = Number(sellerPrice) || 0;
    const offlineTotalPaid = sellRequest.purchasePayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const offlineDueAmount = Math.max(
      0,
      offlineTotalPurchase - offlineTotalPaid
    );

    sellRequest.sellerSettlement = {
      ...sellRequest.sellerSettlement,
      totalPurchaseAmount: offlineTotalPurchase,
      totalPaidAmount: offlineTotalPaid,
      dueAmount: offlineDueAmount,
    };

    await sellRequest.save();

    /* ================================
       CREATE INITIAL PAYMENT TIMELINE (PurchasePayment Collection)
    ================================ */

    // CASH PAYMENT ENTRY
    if (
      parsedOfflineSettlement?.cashPayment?.amount > 0
    ) {
      await PurchasePayment.create({
        purchaseId: sellRequest._id,
        amount:
          Number(
            parsedOfflineSettlement.cashPayment.amount
          ) || 0,
        paymentType: "CASH",
        paymentDate:
          parsedOfflineSettlement.cashPayment
            ?.paymentDate || new Date(),
        note:
          parsedOfflineSettlement.cashPayment
            ?.notes || "",
      });
    }

    // ONLINE PAYMENT ENTRY
    if (
      parsedOfflineSettlement?.onlinePayment?.amount > 0
    ) {
      await PurchasePayment.create({
        purchaseId: sellRequest._id,
        amount:
          Number(
            parsedOfflineSettlement.onlinePayment.amount
          ) || 0,
        paymentType:
          parsedOfflineSettlement.onlinePayment
            ?.paymentMode || "ONLINE",
        paymentDate:
          parsedOfflineSettlement.onlinePayment
            ?.paymentDate || new Date(),
        note:
          parsedOfflineSettlement.onlinePayment
            ?.notes || "",
      });
    }

    // ================= CREATE LIVE CAR =================
    console.log("SellRequest.car before creating Car:", sellRequest.car);

    const liveCar = await Car.create({
      sellerSettlement: sellRequest.sellerSettlement,
      sellRequestId: sellRequest._id,

      source: "OFFLINE",

      seller: sellRequest.seller,

      adminExpenses: sellRequest.adminExpenses || [],
      sellerDocuments: sellRequest.sellerDocuments || [],

      car: sellRequest.car,

      sellerPrice: sellRequest.sellerPrice,
      adminSellingPrice: sellRequest.adminSellingPrice,

      rcDetails: sellRequest.rcDetails,

      status: "LIVE",
    });

    console.log("Car created successfully with features:", liveCar.car.features);

    return res.status(201).json({
      message: "✅ Offline car added & LIVE",
      sellRequest,
      liveCar,
    });

  } catch (error) {
    console.error("addOfflineCar ERROR:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};


// ===============================
// PUT /api/admin/reject/:id
// ===============================
exports.rejectSellRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Reject reason is required",
      });
    }

    const request = await SellRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    request.status = "REJECTED";
    request.rejectReason = reason;

    await request.save();

    res.status(200).json({
      message: "Sell request rejected successfully",
    });
  } catch (error) {
    console.error("rejectSellRequest ERROR:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ===============================
// GET /api/admin/dashboard-stats
// ===============================

exports.getDashboardStats = async (req, res) => {
  try {
    // ================= SELL REQUEST STATS =================
    const pendingRequests = await SellRequest.countDocuments({ status: "PENDING" });
    const approvedRequests = await SellRequest.countDocuments({ status: "APPROVED" });
    const rejectedRequests = await SellRequest.countDocuments({ status: "REJECTED" });

    // ================= CARS =================
    const liveCars = await Car.countDocuments({ status: "LIVE" });
    const soldCars = await Car.countDocuments({ status: "SOLD" });

    // ================= TOTAL REVENUE (FROM SALES) =================
    const sales = await Sale.find().select("paymentSummary");

    const totalRevenue = sales.reduce((sum, sale) => {
      if (!sale.paymentSummary) return sum;

      return sum + (sale.paymentSummary.paidAmount || 0);
    }, 0);

    res.status(200).json({
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      liveCars,
      soldCars,
      totalRevenue, // ✅ NOW CORRECT
    });

  } catch (error) {
    console.error("getDashboardStats ERROR:", error);
    res.status(500).json({
      message: "Failed to load dashboard stats",
    });
  }
};





// ================= SOLD =================
// ================= SOLD =================
exports.markCarAsSold = async (req, res) => {
  try {
    /* ================= EXTRACT DATA ================= */
    const buyerDetails = req.body.buyerDetails || {};
    const payment = req.body.payment || {};
    const sale = req.body.sale || {};

    const {
      buyerName,
      buyerPhone,
      buyerEmail = "",
      buyerCity = "",
      soldPrice,
      saleDate,
    } = buyerDetails;

    const { carId } = req.params;

    /* ================= BASIC VALIDATION ================= */
    if (!buyerName || !buyerPhone || !soldPrice) {
      return res.status(400).json({
        message: "buyerName, buyerPhone and soldPrice are required",
      });
    }

    const soldPriceNum = Number(soldPrice);

    if (Number.isNaN(soldPriceNum) || soldPriceNum <= 0) {
      return res.status(400).json({
        message: "Invalid sold price",
      });
    }

    /* ================= PAYMENT DATA ================= */
    const paymentData = {
      type: payment.type || "CASH",

      // Total Amounts
      cashAmount: Number(payment.cashAmount || 0),
      upiAmount: Number(payment.upiAmount || 0),
      bankAmount: Number(payment.bankAmount || 0),
      loanAmount: Number(payment.loanAmount || 0),
      blackAmount: Number(payment.blackAmount || 0),

      // Paid Amounts
      cashPaidAmount: Number(payment.cashPaidAmount || 0),
      upiPaidAmount: Number(payment.upiPaidAmount || 0),
      bankPaidAmount: Number(payment.bankPaidAmount || 0),
      loanPaidAmount: Number(payment.loanPaidAmount || 0),
      blackPaidAmount: Number(payment.blackPaidAmount || 0),

      // Additional Info
      financeCompany: payment.financeCompany || "",
      upiTransactionId: payment.upiTransactionId || "",
      bankTransactionId: payment.bankTransactionId || "",
      notes: payment.notes || "",
    };

    /* ================= CALCULATIONS ================= */
    const totalPaidNow =
      paymentData.cashPaidAmount +
      paymentData.upiPaidAmount +
      paymentData.bankPaidAmount +
      paymentData.loanPaidAmount +
      paymentData.blackPaidAmount;

    const remainingAmount = soldPriceNum - totalPaidNow;

    /* ================= PAYMENT VALIDATION ================= */
    if (totalPaidNow <= 0) {
      return res.status(400).json({
        message: "At least one paid amount is required",
      });
    }

    if (totalPaidNow > soldPriceNum) {
      return res.status(400).json({
        message: "Total paid amount cannot exceed sold price",
      });
    }

    if (
      paymentData.loanAmount > 0 &&
      !paymentData.financeCompany
    ) {
      return res.status(400).json({
        message:
          "Finance company is required when loan amount is entered",
      });
    }

    /* ================= FILE VALIDATION ================= */
    if (
      !req.files?.buyerAadhaarPhoto?.length ||
      !req.files?.buyerPANPhoto?.length ||
      !req.files?.buyerPhoto?.length
    ) {
      return res.status(400).json({
        message: "Buyer Aadhaar, PAN and Photo are required",
      });
    }

    if (
      !req.files?.form29?.length ||
      !req.files?.form30?.length
    ) {
      return res.status(400).json({
        message: "Form 29 and Form 30 are required",
      });
    }

    /* ================= FIND CAR ================= */
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    /* ================= UPDATE CAR ================= */
    car.status = "SOLD";
    car.soldAt = saleDate
      ? new Date(saleDate)
      : new Date();

    car.buyer = {
      name: buyerName,
      phone: buyerPhone,
      email: buyerEmail,
      city: buyerCity,
    };

    car.buyerPrice = soldPriceNum;

    /* ================= PAYMENT INFO ================= */
    car.payment = paymentData;

    /* ================= SALE SUMMARY ================= */
    car.sale = {
      totalAmount: soldPriceNum,
      paidAmount: totalPaidNow,
      remainingAmount,
    };

    /* ================= SAVE FILES ================= */
    car.buyerKyc = {
      aadhaar: req.files.buyerAadhaarPhoto.map(
        (f) => f.path
      ),
      pan: req.files.buyerPANPhoto.map(
        (f) => f.path
      ),
      photo: req.files.buyerPhoto.map(
        (f) => f.path
      ),
    };

    car.buyerRto = {
      form29: req.files.form29.map((f) => f.path),
      form30: req.files.form30.map((f) => f.path),
      form28:
        req.files.form28?.map((f) => f.path) || [],
      form35:
        req.files.form35?.map((f) => f.path) || [],
    };

    /* ================= EXTRA ADMIN EXPENSES ================= */
    let extraAdminExpenses = [];

    if (req.body.extraAdminExpensesJson) {
      try {
        extraAdminExpenses = JSON.parse(
          req.body.extraAdminExpensesJson
        );
      } catch {
        extraAdminExpenses = [];
      }
    }

    extraAdminExpenses = extraAdminExpenses.filter(
      (e) => e.label && Number(e.amount) > 0
    );

    car.adminExpenses = [
      ...(car.adminExpenses || []),
      ...extraAdminExpenses,
    ];

    await car.save();

    /* ================= CREATE SALE RECORD ================= */
    const saleRecord = await Sale.create({
      carId: car._id,
      soldPrice: soldPriceNum,
      saleDate: car.soldAt,
      paymentSummary: {
        totalAmount: soldPriceNum,
        paidAmount: totalPaidNow,
        remainingAmount,
        status:
          remainingAmount === 0
            ? "PAID"
            : totalPaidNow > 0
            ? "PARTIAL"
            : "PENDING",
      },
    });

    /* ================= CREATE PAYMENT ENTRIES ================= */
    let paidSoFar = 0;

    const paymentEntries = [
      {
        amount: paymentData.cashPaidAmount,
        paymentType: "CASH",
        paymentMode: "CASH",
        note: "Cash payment received",
      },
      {
        amount: paymentData.upiPaidAmount,
        paymentType: "UPI",
        paymentMode: "UPI",
        transactionId: paymentData.upiTransactionId,
        note: "UPI payment received",
      },
      {
        amount: paymentData.bankPaidAmount,
        paymentType: "BANK",
        paymentMode: "BANK",
        transactionId: paymentData.bankTransactionId,
        note: "Bank transfer received",
      },
      {
        amount: paymentData.loanPaidAmount,
        paymentType: "LOAN",
        paymentMode: "LOAN",
        note: "Loan amount disbursed",
      },
      {
        amount: paymentData.blackPaidAmount,
        paymentType: "BLACK",
        paymentMode: "BLACK",
        note: "Unrecorded cash received",
      },
    ];

    for (const entry of paymentEntries) {
      if (entry.amount > 0) {
        paidSoFar += entry.amount;

        await Payment.create({
          saleId: saleRecord._id,
          carId: car._id,

          amount: entry.amount,
          paymentType: entry.paymentType,
          paymentMode: entry.paymentMode,
          transactionId: entry.transactionId || "",
          note: entry.note,

          paidTillNow: paidSoFar,
          remainingAfterPayment:
            soldPriceNum - paidSoFar,

          invoiceDate: new Date(),
        });
      }
    }

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      message: "✅ Car marked as SOLD successfully",
      car,
      sale: saleRecord,
    });
  } catch (error) {
    console.error(
      "❌ markCarAsSold error:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};




// ===============================
// GET /api/admin/sales
// ===============================
exports.getAllSales = async (req, res) => {

  try {

    /* ================= FIND SALES ================= */
    const sales = await Sale.find()
      .sort({ createdAt: -1 })
      .populate("carId");

    /* ================= FORMAT RESPONSE ================= */
    const result = sales.map((sale) => {

      const car = sale.carId;

      return {

        saleId: sale._id,

        // ================= CAR =================
        car: {

          brand:
            car?.car?.brand,

          variant:
            car?.car?.variant,

          // ✅ NUMBER PLATE
          registrationNumber:
            car?.car?.registrationNumber ||
            car?.registrationNumber ||
            "—",
        },

        // ================= BUYER =================
        buyer: {

          name:
            car?.buyer?.name,

          phone:
            car?.buyer?.phone,
        },

        // ================= PAYMENT =================
        totalAmount:
          sale.paymentSummary.totalAmount,

        paidAmount:
          sale.paymentSummary.paidAmount,

        remainingAmount:
          sale.paymentSummary.remainingAmount,

        status:
          sale.paymentSummary.status,

        // ================= PAYMENT MODE =================
        paymentMode:
          car?.payment?.cashPaymentMode ||
          car?.payment?.type ||
          "—",

        // ================= SALE DATE =================
        soldAt:
          sale.saleDate,
      };
    });

    return res.status(200).json(result);

  } catch (error) {

    console.error(
      "❌ getAllSales error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch sales",
      error: error.message,
    });
  }
};


// ===============================
// POST /api/admin/sales/:saleId/payments
// ===============================
exports.addPaymentToSale = async (req, res) => {
  try {
    const { saleId } = req.params;
    const { amount, paymentType, paymentMode, note } = req.body;

    /* ================= VALIDATION ================= */
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0",
      });
    }

    if (!paymentType) {
      return res.status(400).json({
        message: "paymentType is required",
      });
    }

    /* ================= FIND SALE ================= */
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const remainingBefore = sale.paymentSummary.remainingAmount;

    if (amountNum > remainingBefore) {
      return res.status(400).json({
        message: "Payment amount cannot exceed remaining balance",
      });
    }

    /* ================= FIND CAR ================= */
    const car = await Car.findById(sale.carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    /* ================= SNAPSHOT CALCULATION ================= */
    const paidTillNow =
      sale.paymentSummary.paidAmount + amountNum;

    const remainingAfterPayment =
      sale.paymentSummary.totalAmount - paidTillNow;

    /* ================= INVOICE ================= */
    const generateInvoiceNumber = () => {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      return `INV-${year}-${random}`;
    };

    /* ================= CREATE PAYMENT ================= */
    const payment = await Payment.create({
      saleId: sale._id,
      carId: car._id,

      amount: amountNum,
      paymentType,
      paymentMode,
      note: note || "Additional payment",

      // ✅ SNAPSHOT (THE FIX)
      paidTillNow,
      remainingAfterPayment,

      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date(),
      paymentDate: new Date(),
    });

    /* ================= UPDATE SALE ================= */
    sale.paymentSummary.paidAmount = paidTillNow;
    sale.paymentSummary.remainingAmount = remainingAfterPayment;

    sale.paymentSummary.status =
      remainingAfterPayment === 0
        ? "PAID"
        : paidTillNow > 0
          ? "PARTIAL"
          : "PENDING";

    await sale.save();

    return res.status(201).json({
      message: "✅ Payment added successfully",
      payment,
      saleSummary: sale.paymentSummary,
    });

  } catch (error) {
    console.error("❌ addPaymentToSale error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



// ===============================
// GET /api/admin/sales/:saleId
// ===============================
exports.getSaleDetails = async (req, res) => {
  try {
    const { saleId } = req.params;

    /* ================= FIND SALE ================= */
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    /* ================= FIND CAR ================= */
    // ✅ FIX: payment field include
    const car = await Car.findById(sale.carId).select(
      "car seller buyer status buyerPrice soldAt payment"
    );

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    /* ================= FIND PAYMENTS ================= */
    const payments = await Payment.find({ saleId }).sort({ createdAt: 1 });

    /* ================= FIND LOAN ================= */
    const loan = await Loan.findOne({ saleId });

    /* ================= RESPONSE ================= */
    res.status(200).json({
      sale,

      // ✅ car.payment now available on frontend
      car,

      // payments should already include paymentMode
      payments,
      loan,
    });
  } catch (error) {
    console.error("❌ getSaleDetails error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


exports.getSellRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid request id",
      });
    }

    const request = await SellRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    // ✅ FRONTEND-SPECIFIC RESPONSE SHAPE
    const response = {
      _id: request._id,

      carDetails: request.car,

      images: request.car?.images || [],

      contact: request.seller,

      expectedPrice: request.sellerPrice,

      rcDetails: request.rcDetails,

      adminSellingPrice: request.adminSellingPrice,

      sellerSettlement:
        request.sellerSettlement || {},

      status: request.status,

      createdAt: request.createdAt,
    };


    res.status(200).json(response);
  } catch (error) {
    console.error("getSellRequestById ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// GET /api/admin/payments/:paymentId
// ===============================
exports.getPaymentInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;

    /* ================= FIND PAYMENT ================= */
    const payment = await Payment.findById(paymentId).lean();
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    /* ================= FIND SALE ================= */
    const sale = await Sale.findById(payment.saleId).lean();
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    /* ================= FIND CAR ================= */
    const carDoc = await Car.findById(payment.carId).lean();
    if (!carDoc) {
      return res.status(404).json({ message: "Car not found" });
    }

    /* ================= NORMALIZE CAR DATA ================= */
    const car = {
      // vehicle
      brand: carDoc.brand || carDoc.car?.brand || "",
      variant: carDoc.variant || carDoc.car?.variant || "",
      fuelType: carDoc.fuelType || carDoc.car?.fuelType || "",
      registrationNumber:
        carDoc.registrationNumber ||
        carDoc.car?.registrationNumber ||
        "",

      // buyer
      buyer: carDoc.buyer || {},

      // dates
      soldAt: carDoc.soldAt || null,
    };

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      payment,
      sale,
      car,
    });

  } catch (error) {
    console.error("❌ getPaymentInvoice error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ===============================
// GET PAYMENT INVOICE PDF
// ===============================
exports.getPaymentInvoicePDF = async (req, res) => {
  try {
    const { paymentId } = req.params;

    /* ================= FIND PAYMENT ================= */
    const payment = await Payment.findById(paymentId).lean();
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    /* ================= FIND SALE ================= */
    const sale = await Sale.findById(payment.saleId).lean();
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    /* ================= FIND CAR ================= */
    const carDoc = await Car.findById(payment.carId).lean();
    if (!carDoc) {
      return res.status(404).json({ message: "Car not found" });
    }

    /* ================= PDF SETUP ================= */
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Payment-Invoice-${paymentId}.pdf`
    );

    doc.pipe(res);

    /* ================= HEADER ================= */
    doc.fontSize(18).text("Prajapati Mukati Motors", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).text("Authorized Used Car Dealer", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("PAYMENT RECEIPT", { align: "center" });
    doc.moveDown(2);

    /* ================= INVOICE DETAILS ================= */
    doc.fontSize(11).text(`Invoice No: ${payment.invoiceNumber}`);
    doc.text(`Date: ${new Date(payment.invoiceDate).toLocaleDateString()}`);
    doc.moveDown();

    /* ================= BUYER ================= */
    doc.text(`Buyer Name: ${carDoc.buyer?.name || "-"}`);
    doc.text(`Phone: ${carDoc.buyer?.phone || "-"}`);
    doc.text(`City: ${carDoc.buyer?.city || "-"}`);
    doc.moveDown();

    /* ================= VEHICLE ================= */
    doc.text(`Car: ${carDoc.brand} ${carDoc.variant || ""}`);
    doc.text(`Registration No: ${carDoc.registrationNumber || "-"}`);
    doc.text(`Fuel: ${carDoc.fuelType || "-"}`);
    doc.moveDown();

    /* ================= PAYMENT DETAILS ================= */
    doc.text(`Payment Type: ${payment.paymentType}`);
    doc.text(`Payment Method: ${payment.paymentMethod || "-"}`);
    doc.text(`Amount Paid: ₹${payment.amount.toLocaleString("en-IN")}`);
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`);
    doc.moveDown();

    /* ================= SALE SUMMARY ================= */
    doc.text(`Total Vehicle Price: ₹${sale.paymentSummary.totalAmount.toLocaleString("en-IN")}`);
    doc.text(`Total Paid: ₹${sale.paymentSummary.paidAmount.toLocaleString("en-IN")}`);
    doc.text(`Remaining: ₹${sale.paymentSummary.remainingAmount.toLocaleString("en-IN")}`);
    doc.text(`Status: ${sale.paymentSummary.status}`);
    doc.moveDown(2);

    doc.text("Thank you for your business!", { align: "center" });
    doc.moveDown(0.5);
    doc.text("This is a system generated receipt.", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("❌ getPaymentInvoicePDF error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// GET FINAL CONSOLIDATED INVOICE
// ===============================
exports.getFinalInvoice = async (req, res) => {
  try {
    const { saleId } = req.params;

    /* ================= FIND SALE ================= */
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    if (sale.paymentSummary.status !== "PAID") {
      return res.status(400).json({
        message: "Final invoice available only after full payment",
      });
    }

    /* ================= FIND CAR ================= */
    const car = await Car.findById(sale.carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    /* ================= FIND PAYMENTS ================= */
    const payments = await Payment.find({ saleId: sale._id }).sort({
      paymentDate: 1,
    });

    /* ================= GENERATE FINAL INVOICE NO ================= */
    const year = new Date().getFullYear();
    const finalInvoiceNumber = `FIN-${year}-${sale._id
      .toString()
      .slice(-5)}`;

    res.status(200).json({
      finalInvoiceNumber,
      sale,
      car,
      payments,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("❌ getFinalInvoice error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ===============================
// GET /api/admin/purchase/:id/final-invoice
// ===============================
exports.getPurchaseFinalInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await SellRequest.findById(id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    const payments = await PurchasePayment.find({ 
      purchaseId: id 
    }).sort({ paymentDate: 1 });

    const year = new Date().getFullYear();
    const finalInvoiceNumber = `PFIN-${year}-${purchase._id.toString().slice(-5)}`;

    res.status(200).json({
      finalInvoiceNumber,
      contact: purchase.seller,
      carDetails: purchase.car,
      sellerSettlement: purchase.sellerSettlement,
      payments,
      generatedAt: new Date(),
    });

  } catch (error) {
    console.error("❌ getPurchaseFinalInvoice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// PUT /api/admin/sell-requests/:id
// ===============================
exports.updateSellRequest = async (req, res) => {

  console.log(
    "🔥 EXTRA EXPENSES RECEIVED 👉",
    req.body.extraAdminExpenses
  );

  try {

    const { id } = req.params;

    let {
      adminSellingPrice,
      adminExpenses = [],
      sellerDocuments = [],
      features,
      extraAdminExpenses,
      expectedPrice,
      coverImageIndex,
      seller,
      car,
      rcDetails,
    } = req.body;

    // ===============================
    // PARSE JSON STRINGS
    // ===============================
    if (typeof seller === "string") {
      seller = JSON.parse(seller);
    }

    if (typeof car === "string") {
      car = JSON.parse(car);
    }

    if (typeof rcDetails === "string") {
      rcDetails = JSON.parse(rcDetails);
    }

    const request = await SellRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Sell request not found",
      });
    }

    // ===============================
    // UPDATE SELLER DETAILS
    // ===============================
    if (seller) {

      request.seller = {
        ...request.seller,
        ...seller,
      };
    }

    // ===============================
    // UPDATE CAR DETAILS
    // ===============================
    if (car) {

      // ===============================
      // NORMALIZE ENUM VALUES
      // ===============================
      if (car.fuelType) {

        const fuelMap = {
          PETROL: "Petrol",
          DIESEL: "Diesel",
          EV: "Electric",
          ELECTRIC: "Electric",
          HYBRID: "Hybrid",
          CNG: "CNG",
        };

        car.fuelType =
          fuelMap[
          car.fuelType.toUpperCase()
          ] || car.fuelType;
      }

      if (car.transmission) {

        const transmissionMap = {
          MANUAL: "Manual",
          AUTOMATIC: "Automatic",
          AMT: "AMT",
          CVT: "CVT",
          DCT: "DCT",
        };

        car.transmission =
          transmissionMap[
          car.transmission.toUpperCase()
          ] || car.transmission;
      }

      // ===============================
      // SAFE FIELD UPDATE
      // ===============================
      request.car.brand =
        car.brand ??
        request.car.brand;

      request.car.model =
        car.model ??
        request.car.model;

      request.car.year =
        car.year ??
        request.car.year;

      request.car.variant =
        car.variant ??
        request.car.variant;

      request.car.transmission =
        car.transmission ??
        request.car.transmission;

      request.car.fuelType =
        car.fuelType ??
        request.car.fuelType;

      request.car.kmDriven =
        car.kmDriven ??
        request.car.kmDriven;

      request.car.condition =
        car.condition ??
        request.car.condition;

      request.car.registrationNumber =
        car.registrationNumber ??
        request.car.registrationNumber;

      // ===============================
      // KEEP OLD FEATURES
      // ===============================
      request.car.features =
        request.car.features || {
          entertainment: [],
          safety: [],
          comfort: [],
          interiorExterior: [],
          custom: [],
        };

      // ===============================
      // KEEP OLD SPECIFICATIONS
      // ===============================
      request.car.specifications =
        request.car.specifications || {
          mileage: "",
          engineDisplacement: "",
          cylinders: "",
          maxPower: "",
          maxTorque: "",
          seatingCapacity: "",
          fuelTankCapacity: "",
          bodyType: "",
          groundClearance: "",
        };
    }

    // ===============================
    // UPDATE RC DETAILS
    // ===============================
    if (rcDetails) {

      request.rcDetails = {
        ...request.rcDetails,
        ...rcDetails,
      };
    }

    // ===============================
    // UPDATE PRICES
    // ===============================
    if (expectedPrice !== undefined) {

      request.sellerPrice =
        Number(expectedPrice);
    }

    if (adminSellingPrice !== undefined) {

      request.adminSellingPrice =
        Number(adminSellingPrice);
    }

    // ===============================
    // UPDATE FEATURES
    // ===============================
    if (features !== undefined) {

      const parsedFeatures =
        typeof features === "string"
          ? JSON.parse(features)
          : features;

      request.car.features =
        normalizeFeatures(parsedFeatures);
    }

    // ===============================
    // EXTRA ADMIN EXPENSES
    // ===============================
    let parsedExtraExpenses = [];

    if (extraAdminExpenses) {

      parsedExtraExpenses =
        typeof extraAdminExpenses === "string"
          ? JSON.parse(extraAdminExpenses)
          : extraAdminExpenses;
    }

    request.extraAdminExpenses =
      parsedExtraExpenses
        .filter(
          (e) =>
            e.label &&
            String(e.label).trim() !== "" &&
            e.amount !== ""
        )
        .map((e) => ({
          label: String(e.label).trim(),

          amount:
            Number(e.amount) || 0,
        }));

    // ===============================
    // UPDATE IMAGES
    // ===============================
    if (
      req.files &&
      req.files.images &&
      req.files.images.length > 0
    ) {

      const newImageUrls =
        req.files.images.map(
          (file) => file.path
        );

      request.car.images = [
        ...(request.car.images || []),
        ...newImageUrls,
      ];
    }

    // ===============================
    // HANDLE COVER IMAGE
    // ===============================
    if (request.car.images?.length > 0) {

      if (coverImageIndex !== undefined) {

        request.car.coverImage =
          request.car.images[
          Number(coverImageIndex)
          ] || request.car.images[0];

      } else if (!request.car.coverImage) {

        request.car.coverImage =
          request.car.images[0];
      }
    }

    // ===============================
    // SAVE REQUEST
    // ===============================
    await request.save();

    // ===============================
    // UPDATE LIVE CAR
    // ===============================
    if (request.status === "APPROVED") {

      await Car.updateOne(
        {
          sellRequestId: request._id,
        },
        {
          $set: {

            sellerPrice:
              request.sellerPrice,

            adminSellingPrice:
              request.adminSellingPrice,

            extraAdminExpenses:
              request.extraAdminExpenses,

            seller:
              request.seller,

            rcDetails:
              request.rcDetails,

            car:
              request.car,
          },
        }
      );
    }

    return res.status(200).json({
      message:
        "Sell request updated successfully",

      request,
    });

  } catch (error) {

    console.error(
      "updateSellRequest ERROR:",
      error
    );

    return res.status(500).json({
      message: "Server error",

      error: error.message,
    });
  }
};


exports.getApprovedRequests = async (req, res) => {
  try {
    const approved = await SellRequest.find({
      status: "APPROVED",
    }).sort({ updatedAt: -1 });

    res.json(approved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch approved requests" });
  }
};


exports.getRejectedRequests = async (req, res) => {
  try {
    const rejected = await SellRequest.find({
      status: "REJECTED",
    }).sort({ updatedAt: -1 });

    res.status(200).json(rejected);
  } catch (error) {
    console.error("getRejectedRequests ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch rejected requests",
    });
  }
};

exports.getLiveCars = async (req, res) => {
  try {
    const requestedPage = parseInt(req.query.page, 10);
    const requestedLimit = parseInt(req.query.limit, 10);
    const hasPaginationQuery = Number.isFinite(requestedPage) || Number.isFinite(requestedLimit);

    if (hasPaginationQuery) {
      const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
      const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 9;
      const skip = (page - 1) * limit;

      const query = { status: "LIVE" };
      const totalCars = await Car.countDocuments(query);
      const cars = await Car.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

      return res.status(200).json({
        data: cars,
        currentPage: page,
        totalPages: Math.ceil(totalCars / limit),
        totalCars,
      });
    }

    const cars = await Car.find({ status: { $in: ["LIVE", "SOLD"] } }).sort({ createdAt: -1 });
    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cars" });
  }
};


// ===============================
// GET /api/cars/:id  (PUBLIC)
// ===============================
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate("sellRequestId");

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const sell = car.sellRequestId;

    console.log("🔥 GET CAR BY ID - EXTRA EXPENSES 👉", car.extraAdminExpenses);

    res.status(200).json({
      _id: car._id,

      // ===== CAR =====
      brand: car.car?.brand,
      model: car.car?.model,
      variant: car.car?.variant,
      year: car.car?.year,
      fuelType: car.car?.fuelType,
      kmDriven: car.car?.kmDriven,
      registrationNumber: car.car?.registrationNumber || null,
      transmission: car.car?.transmission || null,
      condition: car.car?.condition || null,
      images: car.car?.images || [],
      videos: car.car?.videos || [],
      features: car.car?.features || {},

      // ===== PRICES =====
      sellerPrice: car.sellerPrice,
      adminSellingPrice: car.adminSellingPrice,

      // ===== STATUS =====
      status: car.status,
      source: car.source,
      createdAt: car.createdAt,

      // ===== SELLER =====
      seller: sell?.seller || {},

      // ===== SELL REQUEST DATA (🔥 IMPORTANT) =====
      adminExpenses: sell?.adminExpenses || [],
      sellerDocuments: sell?.sellerDocuments || [],
      rcDetails: sell?.rcDetails || {},

      // ===== EXTRA ADMIN EXPENSES (🔥 FIXED) =====
      extraAdminExpenses: car.extraAdminExpenses || [],

      sellRequestId: sell?._id,
    });
  } catch (error) {
    console.error("getCarById ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};



/* ===============================
   GET EXPENSE DROPDOWN OPTIONS
================================ */
exports.getExpenseOptions = async (req, res) => {
  try {
    const list = await AdminExpenseMaster.find({ isActive: true })
      .sort({ label: 1 })
      .select("label -_id");

    res.json(list.map(i => i.label));
  } catch (err) {
    console.error("getExpenseOptions error", err);
    res.status(500).json({ message: "Failed to fetch expense options" });
  }
};

/* ===============================
   GET DOCUMENT DROPDOWN OPTIONS
================================ */
exports.getDocumentOptions = async (req, res) => {
  try {
    const list = await SellerDocumentMaster.find({ isActive: true })
      .sort({ label: 1 })
      .select("label -_id");

    res.json(list.map(i => i.label));
  } catch (err) {
    console.error("getDocumentOptions error", err);
    res.status(500).json({ message: "Failed to fetch document options" });
  }
};



exports.getSellerDocuments = async (req, res) => {
  try {
    const requests = await SellRequest.find()
      .sort({ updatedAt: -1 });

    console.log(
      "📄 Total Sell Requests:",
      requests.length
    );

    const result = requests.map((r) => {
      // ✅ HANDLE BOTH OLD + NEW STRUCTURE
      const documents =
        r.sellerDocuments ||
        r.documents ||
        [];

      return {
        sellRequestId: r._id,

        car: {
          brand: r.car?.brand,
          model: r.car?.model,
          variant: r.car?.variant,
          registrationNumber:
            r.car?.registrationNumber,
        },

        seller: r.seller || {},

        documents,

        createdAt: r.createdAt,
      };
    });

    // ✅ REMOVE EMPTY DOC ITEMS
    console.log(
      "✅ Seller Records Found:",
      result.length
    );

    res.status(200).json(result);
  } catch (err) {
    console.error(
      "❌ getSellerDocuments error",
      err
    );

    res.status(500).json({
      message: "Failed to load seller documents",
    });
  }
};

exports.deleteSellerDocument =
  async (req, res) => {

    console.log(
      "🔥 DELETE DOCUMENT API HIT"
    );

    try {

      const { sellRequestId } =
        req.params;

      const {
        label,
        fileIndex,
        password,
      } = req.body;

      console.log(
        "ENV PASSWORD:",
        process.env.ADMIN_DELETE_PASSWORD
      );

      // ✅ PASSWORD VALIDATION
      if (
        password !==
        process.env.ADMIN_DELETE_PASSWORD
      ) {
        return res.status(401).json({
          message:
            "Invalid admin password",
        });
      }

      const sellRequest =
        await SellRequest.findById(
          sellRequestId
        );

      if (!sellRequest) {
        return res.status(404).json({
          message:
            "Sell request not found",
        });
      }

      const document =
        sellRequest.sellerDocuments.find(
          (d) => d.label === label
        );

      if (!document) {
        return res.status(404).json({
          message:
            "Document not found",
        });
      }

      // ✅ REMOVE FILE
      document.fileUrls.splice(
        fileIndex,
        1
      );

      // ✅ REMOVE EMPTY DOC GROUP
      sellRequest.sellerDocuments =
        sellRequest.sellerDocuments.filter(
          (d) =>
            d.fileUrls.length > 0
        );

      await sellRequest.save();

      res.json({
        message:
          "Document deleted successfully",
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Delete failed",
      });
    }
  };



// ================= ADD PURCHASE PAYMENT =================
exports.addPurchasePayment = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const {
      amount,
      paymentType,
      note,
    } = req.body;

    const SellRequest = require("../models/SellRequest");

    // FIND PURCHASE
    const purchase =
      await SellRequest.findById(
        purchaseId
      );

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    const paymentAmount =
      Number(amount);

    if (
      !paymentAmount ||
      paymentAmount <= 0
    ) {
      return res.status(400).json({
        message: "Invalid payment amount",
      });
    }

    // CREATE ARRAY IF NOT EXISTS
    if (!purchase.purchasePayments) {
      purchase.purchasePayments = [];
    }

    // ADD PAYMENT
    purchase.purchasePayments.push({
      amount: paymentAmount,
      paymentType,
      note,
      paymentDate: new Date(),
    });

    // OLD PAID
    const oldPaid =
      purchase.purchasePayments.reduce(
        (sum, p) =>
          sum + (p.amount || 0),
        0
      );

    // TOTALS
    const totalPurchaseAmount =
      purchase.sellerPrice || 0;

    const dueAmount = Math.max(
      0,
      totalPurchaseAmount - oldPaid
    );

    // UPDATE sellerSettlement
    purchase.sellerSettlement = {
      ...purchase.sellerSettlement,

      totalPurchaseAmount,

      totalPaidAmount: oldPaid,

      dueAmount,
    };

    await purchase.save();

    /* ================================
       CREATE PURCHASEPAYMENT COLLECTION ENTRY
    ================================ */
    const PurchasePayment = require("../models/PurchasePayment");

    await PurchasePayment.create({
      purchaseId: purchaseId,
      amount: paymentAmount,
      paymentType: paymentType,
      paymentDate: new Date(),
      note: note || "",
      createdBy: "ADMIN",
    });

    res.status(200).json({
      success: true,
      message:
        "Purchase payment added successfully",
      payment:
        purchase.purchasePayments[
        purchase.purchasePayments.length -
        1
        ],
    });
  } catch (err) {
    console.error(
      "❌ addPurchasePayment error:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add purchase payment",
    });
  }
};

// ================= GET PURCHASE PAYMENTS =================
exports.getPurchasePayments = async (
  req,
  res
) => {
  try {
    const { purchaseId } = req.params;

    const SellRequest = require("../models/SellRequest");

    const purchase =
      await SellRequest.findById(
        purchaseId
      );

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    res.status(200).json(
      purchase.purchasePayments || []
    );
  } catch (err) {
    console.error(
      "❌ getPurchasePayments error:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch purchase payments",
    });
  }
};

// ================= GET PURCHASE PAYMENT INVOICE =================
exports.getPurchasePaymentInvoice = async (req, res) => {
  try {
    const { purchaseId, paymentIndex } = req.params;

    const SellRequest = require("../models/SellRequest");

    /* ================= FIND PURCHASE ================= */
    const purchase = await SellRequest.findById(purchaseId).lean();

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    /* ================= GET PAYMENT BY INDEX ================= */
    const payment = purchase.purchasePayments?.[paymentIndex];

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      payment,
      carDetails: purchase.car,
      contact: purchase.seller,
      purchaseDetails: {
        totalPurchaseAmount: purchase.sellerPrice,
        totalPaidAmount: purchase.purchasePayments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0
        ),
      },
    });
  } catch (error) {
    console.error(
      "❌ getPurchasePaymentInvoice error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


exports.getBuyerDocuments = async (req, res) => {
  try {
    const cars = await Car.find({ status: "SOLD" })

      .sort({ soldAt: -1 })   // 🔥 MOST IMPORTANT LINE
      .select("buyer buyerKyc buyerRto buyerPrice soldAt car _id");

    const response = cars.map((car) => ({
      id: car._id, // Add car ID for updates
      buyer: car.buyer,
      car: {
        brand: car.car?.brand,
        model: car.car?.model,
        variant: car.car?.variant,
        year: car.car?.year,
        registrationNumber: car.car?.registrationNumber,
      },
      soldPrice: car.buyerPrice,
      saleDate: car.soldAt,
      buyerKyc: car.buyerKyc,
      buyerRto: car.buyerRto,
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("❌ getBuyerDocuments error:", err);
    res.status(500).json({ message: "Failed to fetch buyer documents" });
  }
};

// UPDATE SELLER DOCUMENTS
exports.updateSellerDocuments = async (req, res) => {
  try {
    const { sellRequestId } = req.params;
    const { documents } = req.body;

    const sellRequest = await SellRequest.findById(sellRequestId);
    if (!sellRequest) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    sellRequest.sellerDocuments = documents;
    await sellRequest.save();

    res.json({ message: "Seller documents updated successfully", sellRequest });
  } catch (err) {
    console.error("updateSellerDocuments error", err);
    res.status(500).json({ message: "Failed to update seller documents" });
  }
};

// UPDATE BUYER DOCUMENTS
exports.updateBuyerDocuments = async (req, res) => {
  try {
    const { carId } = req.params;
    const { buyerKyc, buyerRto } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (buyerKyc) {
      car.buyerKyc = { ...car.buyerKyc, ...buyerKyc };
    }

    if (buyerRto) {
      car.buyerRto = { ...car.buyerRto, ...buyerRto };
    }

    await car.save();

    res.json({ message: "Buyer documents updated successfully", car });
  } catch (err) {
    console.error("updateBuyerDocuments error", err);
    res.status(500).json({ message: "Failed to update buyer documents" });
  }
};





// ===============================
// GET FINAL INVOICE PDF
// ===============================
exports.getFinalInvoicePDF = async (req, res) => {
  try {
    const { saleId } = req.params;

    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    if (sale.paymentSummary.status !== "PAID") {
      return res.status(400).json({
        message: "Final invoice available only after full payment",
      });
    }

    const car = await Car.findById(sale.carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const payments = await Payment.find({ saleId }).sort({
      paymentDate: 1,
    });

    /* ================= PDF SETUP ================= */
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Final-Invoice-${saleId}.pdf`
    );

    doc.pipe(res);

    /* ================= HEADER ================= */
    doc.fontSize(18).text("Prajapati Mukati Motors", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).text("Authorized Used Car Dealer", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("FINAL INVOICE", { align: "center" });
    doc.moveDown(2);

    /* ================= BUYER ================= */
    doc.fontSize(11).text(`Buyer Name: ${car.buyer?.name}`);
    doc.text(`Phone: ${car.buyer?.phone}`);
    doc.text(`City: ${car.buyer?.city || "-"}`);
    doc.moveDown();

    /* ================= VEHICLE ================= */
    doc.text(`Car: ${car.car?.brand} ${car.car?.variant || ""}`);
    doc.text(`Registration No: ${car.car?.registrationNumber || "-"}`);
    doc.text(`Fuel: ${car.car?.fuelType || "-"}`);
    doc.moveDown();

    /* ================= PAYMENT SUMMARY ================= */
    doc.text(`Total Amount: ₹${sale.paymentSummary.totalAmount}`);
    doc.text(`Paid Amount: ₹${sale.paymentSummary.paidAmount}`);
    doc.text(`Remaining: ₹${sale.paymentSummary.remainingAmount}`);
    doc.text(`Status: ${sale.paymentSummary.status}`);
    doc.moveDown();

    /* ================= PAYMENT HISTORY ================= */
    doc.text("Payment Details:");
    doc.moveDown(0.5);

    payments.forEach((p, i) => {
      doc.text(
        `${i + 1}. ₹${p.amount} - ${p.paymentType} (${new Date(
          p.paymentDate
        ).toLocaleDateString()})`
      );
    });

    doc.moveDown(2);
    doc.text("This is a system generated invoice.", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("❌ getFinalInvoicePDF error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET /api/admin/payments/:paymentId/pdf-cloudinary
// Generate Payment Invoice PDF and upload to Cloudinary
// ===============================
exports.getPaymentInvoicePDFCloudinary = async (req, res) => {
  try {
    const { paymentId } = req.params;

    /* ================= FIND PAYMENT ================= */
    const payment = await Payment.findById(paymentId).lean();
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    /* ================= FIND SALE ================= */
    const sale = await Sale.findById(payment.saleId).lean();
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    /* ================= FIND CAR ================= */
    const carDoc = await Car.findById(payment.carId).lean();
    if (!carDoc) {
      return res.status(404).json({ message: "Car not found" });
    }

    /* ================= GENERATE PDF TO BUFFER ================= */
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("error", reject);
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      /* ================= HEADER ================= */
      doc.fontSize(18).text("Prajapati Mukati Motors", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text("Authorized Used Car Dealer", { align: "center" });
      doc.moveDown();

      doc.fontSize(14).text("PAYMENT RECEIPT", { align: "center" });
      doc.moveDown(2);

      /* ================= INVOICE DETAILS ================= */
      doc.fontSize(11).text(`Invoice No: ${payment.invoiceNumber}`);
      doc.text(`Date: ${new Date(payment.invoiceDate).toLocaleDateString()}`);
      doc.moveDown();

      /* ================= BUYER ================= */
      doc.text(`Buyer Name: ${carDoc.buyer?.name || "-"}`);
      doc.text(`Phone: ${carDoc.buyer?.phone || "-"}`);
      doc.text(`City: ${carDoc.buyer?.city || "-"}`);
      doc.moveDown();

      /* ================= VEHICLE ================= */
      doc.text(`Car: ${carDoc.car?.brand} ${carDoc.car?.variant || ""}`);
      doc.text(`Registration No: ${carDoc.car?.registrationNumber || "-"}`);
      doc.text(`Fuel: ${carDoc.car?.fuelType || "-"}`);
      doc.moveDown();

      /* ================= PAYMENT DETAILS ================= */
      doc.text(`Payment Type: ${payment.paymentType}`);
      doc.text(`Payment Method: ${payment.paymentMethod || "-"}`);
      doc.text(`Amount Paid: ₹${payment.amount.toLocaleString("en-IN")}`);
      doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`);
      doc.moveDown();

      /* ================= SALE SUMMARY ================= */
      doc.text(
        `Total Vehicle Price: ₹${sale.paymentSummary.totalAmount.toLocaleString(
          "en-IN"
        )}`
      );
      doc.text(
        `Total Paid: ₹${sale.paymentSummary.paidAmount.toLocaleString(
          "en-IN"
        )}`
      );
      doc.text(
        `Remaining: ₹${sale.paymentSummary.remainingAmount.toLocaleString(
          "en-IN"
        )}`
      );
      doc.text(`Status: ${sale.paymentSummary.status}`);
      doc.moveDown(2);

      doc.text("Thank you for your business!", { align: "center" });
      doc.moveDown(0.5);
      doc.text("This is a system generated receipt.", { align: "center" });

      doc.end();
    });

    console.log("✅ PDF Buffer generated:", pdfBuffer.length, "bytes");

    /* ================= UPLOAD TO CLOUDINARY ================= */
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          type: "upload",
          folder: "car-invoices/payments",
          public_id: `Payment-Invoice-${paymentId}`,
          access_mode: "public",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(pdfBuffer);
    });


    console.log("✅ PDF uploaded to Cloudinary:", uploadResult.secure_url);

    res.json({
      message: "PDF generated and uploaded successfully",
      pdfUrl: uploadResult.secure_url,
      fileName: `Payment-Invoice-${paymentId}.pdf`,
    });
  } catch (error) {
    console.error("❌ getPaymentInvoicePDFCloudinary error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===============================
// GET /api/admin/sales/:saleId/final-invoice-pdf-cloudinary
// Generate Final Invoice PDF and upload to Cloudinary
// ===============================
exports.getFinalInvoicePDFCloudinary = async (req, res) => {
  try {
    const { saleId } = req.params;

    /* ================= FIND SALE ================= */
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    if (sale.paymentSummary.status !== "PAID") {
      return res.status(400).json({
        message: "Final invoice available only after full payment",
      });
    }

    /* ================= FIND CAR ================= */
    const car = await Car.findById(sale.carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    /* ================= FIND PAYMENTS ================= */
    const payments = await Payment.find({ saleId }).sort({
      paymentDate: 1,
    });

    /* ================= GENERATE PDF BUFFER ================= */
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", chunk => chunks.push(chunk));
      doc.on("error", reject);
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // ===== HEADER =====
      doc.fontSize(18).text("United Motors", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text("Authorized Used Car Dealer", { align: "center" });
      doc.moveDown();

      doc.fontSize(14).text("FINAL INVOICE", { align: "center" });
      doc.moveDown(2);

      // ===== SALE INFO =====
      doc.fontSize(11).text(`Sale ID: ${sale._id}`);
      doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`);
      doc.moveDown();

      // ===== BUYER =====
      doc.text(`Buyer Name: ${car.buyer?.name || "-"}`);
      doc.text(`Phone: ${car.buyer?.phone || "-"}`);
      doc.text(`City: ${car.buyer?.city || "-"}`);
      doc.moveDown();

      // ===== VEHICLE =====
      doc.text(`Car: ${car.car?.brand} ${car.car?.variant || ""}`);
      doc.text(`Year: ${car.car?.year || "-"}`);
      doc.text(`Registration No: ${car.car?.registrationNumber || "-"}`);
      doc.text(`Fuel: ${car.car?.fuelType || "-"}`);
      doc.moveDown();

      // ===== PAYMENT SUMMARY =====
      doc.text(
        `Total Amount: ₹${sale.paymentSummary.totalAmount.toLocaleString("en-IN")}`
      );
      doc.text(
        `Paid Amount: ₹${sale.paymentSummary.paidAmount.toLocaleString("en-IN")}`
      );
      doc.text(`Status: ${sale.paymentSummary.status}`);
      doc.moveDown(2);

      // ===== PAYMENT HISTORY =====
      if (payments.length) {
        doc.fontSize(12).text("Payment History", { underline: true });
        doc.moveDown(0.5);

        payments.forEach((p, i) => {
          doc.fontSize(10).text(
            `${i + 1}. ₹${p.amount.toLocaleString("en-IN")} - ${p.paymentType
            } (${new Date(p.paymentDate).toLocaleDateString()})`
          );
        });

        doc.moveDown(2);
      }

      doc.text("Thank you for your business!", { align: "center" });
      doc.moveDown(0.5);
      doc.text("This is a system generated invoice.", { align: "center" });

      doc.end();
    });

    console.log("✅ PDF Buffer generated:", pdfBuffer.length, "bytes");

    /* ================= UPLOAD TO CLOUDINARY ================= */
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          type: "upload",
          folder: "car-invoices/final",
          public_id: `Final-Invoice-${saleId}`,
          access_mode: "public",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(pdfBuffer);
    });

    console.log("✅ PDF uploaded to Cloudinary:", uploadResult.secure_url);

    res.json({
      message: "Final invoice generated & uploaded successfully",
      pdfUrl: uploadResult.secure_url,
      fileName: `Final-Invoice-${saleId}.pdf`,
    });
  } catch (error) {
    console.error("❌ getFinalInvoicePDFCloudinary error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
