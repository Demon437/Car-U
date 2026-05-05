const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
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

    loanAmount: Number,
    financeCompany: String,

    status: {
      type: String,
      enum: ["APPLIED", "APPROVED", "DISBURSED"],
      default: "APPLIED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", LoanSchema);
