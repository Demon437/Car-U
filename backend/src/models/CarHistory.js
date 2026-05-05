const mongoose = require("mongoose");

const CarHistorySchema = new mongoose.Schema(
    {
        source: {
            type: String,
            enum: ["ONLINE", "OFFLINE"],
            required: true,
        },

        sellRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SellRequest",
        },

        seller: {
            name: String,
            phone: String,
            email: String,
            city: String,
        },

        car: {
            brand: String,
            model: String,
            year: Number,
            fuelType: String,
            transmission: String,
            kmDriven: Number,
            condition: String,
            images: [String],
        },

        sellerPrice: Number,
        adminSellingPrice: Number,

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },

        approvedAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("CarHistory", CarHistorySchema);
