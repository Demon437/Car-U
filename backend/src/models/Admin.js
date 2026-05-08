const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "ADMIN",
    },

    // PASSWORD RESET
    resetPasswordToken: String,

    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);