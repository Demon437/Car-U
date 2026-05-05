const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SellerSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  
  // Address Information
  city: {
    type: String,
    required: true,
  },
  area: {
    type: String,
  },
  fullAddress: {
    type: String,
  },
  
  // Business Information
  sellerType: {
    type: String,
    enum: ["individual", "dealer", "platform"],
    default: "individual",
  },
  platformName: {
    type: String,
    required: function() {
      return this.sellerType === "platform";
    },
  },
  
  // Profile Information
  profileImage: {
    type: String,
  },
  description: {
    type: String,
  },
  
  // Verification Status
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  verificationDocuments: [{
    type: String, // URLs to documents
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Cars listed by this seller
  listedCars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SellRequest",
  }],
}, {
  timestamps: true,
});

// Hash password before saving
SellerSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
SellerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Seller", SellerSchema);
