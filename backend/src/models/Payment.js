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

    // Amount received in this payment entry
    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    // CASH | UPI | BANK | LOAN | BLACK
    paymentType: {
      type: String,
      enum: ["CASH", "UPI", "BANK", "LOAN", "BLACK"],
      required: true,
    },

    // Optional mode
    paymentMode: {
      type: String,
      default: "",
    },

    // Transaction / Reference ID
    transactionId: {
      type: String,
      default: "",
    },

    // Notes
    note: {
      type: String,
      default: "",
    },

    // Actual payment date
    paymentDate: {
      type: Date,
      default: Date.now,
    },

    // Snapshot after this payment
    paidTillNow: {
      type: Number,
      required: true,
      default: 0,
    },

    remainingAfterPayment: {
      type: Number,
      required: true,
      default: 0,
    },

    // Invoice fields
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