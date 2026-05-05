const mongoose = require("mongoose");

const BuyerDetailsSchema = new mongoose.Schema(
  {
    /* ================= RELATION ================= */
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
      index: true,
    },

    /* ================= BASIC INFO ================= */
    buyerName: {
      type: String,
      required: true,
      trim: true,
    },

    buyerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    buyerEmail: {
      type: String,
      trim: true,
      default: "",
    },

    buyerCity: {
      type: String,
      trim: true,
      default: "",
    },

    /* ================= KYC DOCUMENTS ================= */
    kycDocuments: {
      buyerAadhaarPhoto: {
        type: String,
        required: true,
      },

      buyerPANPhoto: {
        type: String,
        required: true,
      },

      buyerPhoto: {
        type: String,
        required: true,
      },
    },

    /* ================= RTO DOCUMENTS ================= */
    rtoDocuments: {
      form29: {
        type: String,
        required: true,
      },

      form30: {
        type: String,
        required: true,
      },

      form28: {
        type: String,
        default: "",
      },

      form35: {
        type: String,
        default: "",
      },
    },

    /* ================= SALE INFO ================= */
    soldPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    saleDate: {
      type: Date,
      default: Date.now,
    },

    /* ================= PROFIT / MARGIN ================= */
    profit: {
      type: Number,
      default: 0,
    },

    margin: {
      type: Number,
      default: 0,
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("BuyerDetails", BuyerDetailsSchema);
