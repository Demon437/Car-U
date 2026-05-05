// models/SellerDocumentMaster.js
const mongoose = require("mongoose");


const SellerDocumentMasterSchema = new mongoose.Schema(
    {
        label: { type: String, required: true, unique: true, trim: true },
        isRequired: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "SellerDocumentMaster",
    SellerDocumentMasterSchema
);
