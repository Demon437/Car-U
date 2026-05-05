const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },

    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentType: {
      type: String,
      enum: ["CASH", "UPI", "BANK", "LOAN"],
      required: true,
    },

    paymentMode: {
      type: String,
      enum: ["CASH", "UPI", "BANK"],
    },

    note: String,

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    // ✅ SNAPSHOT (THE FIX)
    paidTillNow: {
      type: Number,
      required: true,
    },

    remainingAfterPayment: {
      type: Number,
      required: true,
    },

    // 🧾 INVOICE
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
