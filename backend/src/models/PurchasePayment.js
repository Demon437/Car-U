const mongoose = require("mongoose");

const purchasePaymentSchema =
    new mongoose.Schema(
        {
            // Linked Purchase / Sell Request
            purchaseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SellRequest",
                required: true,
            },

            // Payment Amount
            amount: {
                type: Number,
                required: true,
                default: 0,
            },

            // CASH / ONLINE / UPI / BANK etc
            paymentType: {
                type: String,
                default: "CASH",
            },

            // Payment Date
            paymentDate: {
                type: Date,
                default: Date.now,
            },

            // Optional Note
            note: {
                type: String,
                default: "",
            },

            // Optional Invoice Number
            invoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
},

            // Created By Admin
            createdBy: {
                type: String,
                default: "ADMIN",
            },
        },
        {
            timestamps: true,
        }
    );

module.exports = mongoose.model(
    "PurchasePayment",
    purchasePaymentSchema
);