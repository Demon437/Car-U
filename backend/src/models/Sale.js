const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
   {
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    // 🔥 SNAPSHOT OF CAR (THIS FIXES YOUR ISSUE)
    car: {
      brand: String,
      model: String,
      variant: String,
      year: Number,
      fuelType: String,
      transmission: String,
      kmDriven: Number,
      condition: String,
      images: [String],
    },

    soldPrice: { type: Number, required: true },
    saleDate: { type: Date, default: Date.now },

    paymentSummary: {
      totalAmount: { type: Number, required: true },
      paidAmount: { type: Number, required: true },
      remainingAmount: { type: Number, required: true },
      status: {
        type: String,
        enum: ["PAID", "PARTIAL", "PENDING"],
        default: "PENDING",
      },
    },

    buyerSnapshot: {
      name: String,
      phone: String,
      email: String,
      city: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", SaleSchema);
