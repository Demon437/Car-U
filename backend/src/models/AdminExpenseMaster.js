// models/AdminExpenseMaster.js
const mongoose = require("mongoose");

const AdminExpenseMasterSchema = new mongoose.Schema(
    {
        label: { type: String, required: true, unique: true, trim: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "AdminExpenseMaster",
    AdminExpenseMasterSchema
);
