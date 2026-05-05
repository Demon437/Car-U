const Seller = require("../models/Seller");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ================= REGISTER SELLER =================
exports.registerSeller = async (req, res) => {
  try {
    const { name, email, phone, password, city, area, sellerType, platformName } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingSeller) {
      return res.status(400).json({
        message: "Seller with this email or phone already exists",
      });
    }

    // Create new seller
    const seller = await Seller.create({
      name,
      email,
      phone,
      password,
      city,
      area,
      sellerType: sellerType || "individual",
      platformName,
    });

    // Generate token
    const token = generateToken(seller._id);

    res.status(201).json({
      message: "Seller registered successfully",
      data: {
        seller: {
          id: seller._id,
          name: seller.name,
          email: seller.email,
          phone: seller.phone,
          city: seller.city,
          sellerType: seller.sellerType,
          isVerified: seller.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Seller Registration Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN SELLER =================
exports.loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find seller by email
    const seller = await Seller.findOne({ email }).select("+password");

    if (!seller) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if seller is active
    if (!seller.isActive) {
      return res.status(401).json({
        message: "Account is deactivated",
      });
    }

    // Compare password
    const isPasswordValid = await seller.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(seller._id);

    res.status(200).json({
      message: "Login successful",
      data: {
        seller: {
          id: seller._id,
          name: seller.name,
          email: seller.email,
          phone: seller.phone,
          city: seller.city,
          sellerType: seller.sellerType,
          isVerified: seller.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Seller Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET SELLER PROFILE =================
exports.getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id)
      .populate("listedCars", "car.brand car.model car.year status createdAt");

    if (!seller) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      data: {
        seller: {
          id: seller._id,
          name: seller.name,
          email: seller.email,
          phone: seller.phone,
          city: seller.city,
          area: seller.area,
          fullAddress: seller.fullAddress,
          sellerType: seller.sellerType,
          platformName: seller.platformName,
          profileImage: seller.profileImage,
          description: seller.description,
          isVerified: seller.isVerified,
          isActive: seller.isActive,
          listedCars: seller.listedCars,
          createdAt: seller.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Get Seller Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
