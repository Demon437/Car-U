const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'employee'],
        default: 'employee',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);