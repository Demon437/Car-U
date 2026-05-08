const mongoose = require("mongoose");

/* =================================================
   SUB SCHEMAS (⚠️ MUST BE DECLARED FIRST)
================================================= */

// =====================
// ADMIN EXPENSE ITEM
// =====================
const AdminExpenseSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

// =====================
// SELLER DOCUMENT ITEM
// =====================
const SellerDocumentSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    fileUrls: { type: [String], default: [] }, // 🔥 ARRAY
  },
  { _id: false }
);

/* =================================================
   MAIN SELL REQUEST SCHEMA
================================================= */
const SellRequestSchema = new mongoose.Schema(
  {
    // =====================
    // SOURCE
    // =====================
    source: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      default: "ONLINE",
      required: true,
    },

    // =====================
    // SELLER / CONTACT DETAILS
    // =====================
    seller: {

      type: {
        type: String,
        enum: ["individual", "dealer", "platform"],
        default: "individual",
        required: true,
      },

      platformName: {
        type: String, // Cars24, CarDekho, Spinny
        required: function () {
          return this.type === "platform";
        },
      },
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true },
      altPhone: { type: String },
      email: { type: String, lowercase: true, trim: true },
      city: { type: String, required: true },
      area: { type: String },
    },

    // =====================
    // ADMIN COST BREAKDOWN
    // =====================
    adminExpenses: {
      type: [AdminExpenseSchema],
      default: [],
    },

    // =====================
    // SELLER DOCUMENTS
    // =====================
    sellerDocuments: {
      type: [SellerDocumentSchema],
      default: [],
    },

    // =====================
    // CAR DETAILS
    // =====================
    car: {
      brand: { type: String, required: true, trim: true },
      model: { type: String, trim: true },
      year: { type: Number, required: true },
      registrationNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        match: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/,
      },
      variant: { type: String, trim: true },
      fuelType: {
        type: String,
        enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
        required: true,
      },
      transmission: {
        type: String,
        enum: ["Manual", "Automatic", "AMT", "CVT", "DCT"],
      },
      kmDriven: { type: Number, required: true },
      condition: { type: String },

      // [0]=front, [1]=rear, [2]=engine, [3]=plate, [4+]=interior
      images: {
        type: [String],
        validate: {
          validator: (v) => v && v.length >= 4,
          message:
            "Minimum 4 images required (front, rear, engine, number plate)",
        },
      },

      coverImage: {
        type: String,
        default: "",
      },

      videos: {
        type: [String],
        default: [],
      },

      features: {
        entertainment: { type: [String], default: [] },
        safety: { type: [String], default: [] },
        comfort: { type: [String], default: [] },
        interiorExterior: { type: [String], default: [] },
        custom: { type: [String], default: [] },
      },

      specifications: {
        mileage: { type: String, default: "" },
        engineDisplacement: { type: String, default: "" },
        cylinders: { type: String, default: "" },
        maxPower: { type: String, default: "" },
        maxTorque: { type: String, default: "" },
        seatingCapacity: { type: String, default: "" },
        fuelTankCapacity: { type: String, default: "" },
        bodyType: { type: String, default: "" },
        groundClearance: { type: String, default: "" },
      },
    },

    // =====================
    // PRICING
    // =====================
    sellerPrice: { type: Number, required: true },
    adminSellingPrice: { type: Number, default: null },

    // =====================
    // RC DETAILS
    // =====================
    rcDetails: {
      rcOwner: {
        type: String,
        enum: ["yes", "no"],
        required: true,
      },
      rcOwnerName: {
        type: String,
        required: function () {
          return this.rcDetails?.rcOwner === "no";
        },
      },
      rcImage: {
        type: String,
        required: false,
      },
    },

    // =====================
    // STATUS FLOW
    // =====================
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SOLD"],
      default: "PENDING",
      index: true,
    },

    // =====================
    // ADMIN ACTIONS
    // =====================
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectReason: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellRequest", SellRequestSchema);
