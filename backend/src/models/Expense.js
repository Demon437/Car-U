const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      default: "General",
    },

    // ✅ PAYMENT MODE
    paymentMode: {
      type: String,
      enum: [
        "CASH",
        "UPI",
        "BANK_TRANSFER",
        "CARD",
        "CHEQUE",
        "LOAN",
        "OTHER",
      ],
      default: "CASH",
    },

    // ✅ OPTIONAL NOTES
    notes: {
      type: String,
      default: "",
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);