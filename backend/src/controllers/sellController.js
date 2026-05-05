const SellRequest = require("../models/SellRequest");
const cloudinary = require("../config/cloudinary");

const normalizeFeatures = (raw = {}) => {
  const safeArray = (value) =>
    Array.isArray(value)
      ? value
        .map((item) => String(item || "").trim())
        .filter(Boolean)
      : [];

  return {
    entertainment: safeArray(raw.entertainment),
    safety: safeArray(raw.safety),
    comfort: safeArray(raw.comfort),
    interiorExterior: safeArray(raw.interiorExterior),
    custom: safeArray(raw.custom),
  };
};


// ===============================
// POST /api/sell (WITH IMAGES)
// ===============================
exports.createSellRequest = async (req, res) => {
  try {
    console.log("========= SELL REQUEST START =========");

    // 🔹 BODY DEBUG
    console.log("REQ BODY 👉");
    console.dir(req.body, { depth: null });

    // 🔹 FILES DEBUG
    console.log("REQ FILES 👉");
    console.dir(req.files, { depth: null });

    // ================= IMAGES =================
    const images = req.files?.images || [];
    const rcImage = req.files?.rcImage?.[0];
    // const videoFile = req.files?.video?.[0];
    const videoFile = req.files?.videos || [];

    console.log("CAR IMAGES COUNT 👉", images.length);
    console.log("RC IMAGE 👉", rcImage ? rcImage.path : "NO RC IMAGE");
    console.log("VIDEO COUNT 👉", videoFile.length);

    const imageUrls = images.map((file) => {
      console.log("UPLOADED IMAGE PATH 👉", file.path);
      return file.path;
    });

    if (videoFile.length > 3) {
      return res.status(400).json({
        message: "Maximum 3 videos allowed"
      });
    }

    for (const video of videoFile) {
      if (video.size > 20 * 1024 * 1024) {
        return res.status(400).json({
          message: "Video size should be less than 20MB"
        });
      }
    }

    // for video duration 
    const ffmpeg = require('fluent-ffmpeg');
    for (const video of videoFile) {
      try {
        const duration = await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(video.path, (err, metadata) => {
            if (err) reject(err);
            else resolve(metadata.format.duration);
          })
        });
        console.log("VIDEO DURATION 👉", duration);


        if (duration > 20) {
          return res.status(400).json({
            message: `Video ${video.originalname} exceeds 20 seconds limit`
          });
        }

      }
      catch (error) {
        console.error("Video duration check failed:", error);
      }
    }

    const rcImageUrl = rcImage ? rcImage.path : null;
    const videoUrls = [];

for (const file of videoFile) {
  const result = await cloudinary.uploader.upload(file.path, {
    resource_type: "video", // 🔥 VERY IMPORTANT
    folder: "car-dealership/videos",
  });

  console.log("UPLOADED VIDEO 👉", result.secure_url);

  videoUrls.push(result.secure_url);
}

    const rawFeaturesInput =
      req.body.features || req.body["car.features"] || req.body["car[features]"];

    let parsedFeatures = normalizeFeatures();
    if (rawFeaturesInput) {
      try {
        const rawFeatures =
          typeof rawFeaturesInput === "string"
            ? JSON.parse(rawFeaturesInput)
            : rawFeaturesInput;
        parsedFeatures = normalizeFeatures(rawFeatures);
      } catch (error) {
        console.error("❌ FEATURES PARSE ERROR 👉", error);
      }
    }
    console.log("PARSED FEATURES 👉", parsedFeatures);

    // ================= CREATE REQUEST =================
    const sellRequest = await SellRequest.create({
      source: "ONLINE",

      seller: {
        name: req.body.name,
        phone: req.body.phone,
        altPhone: req.body.altPhone,
        email: req.body.email,
        city: req.body.city,
        area: req.body.area,
      },

      car: {
        brand: req.body.brand,
        model: req.body.model,
        year: Number(req.body.year),
        variant: req.body.variant,
        transmission: req.body.transmission,
        fuelType: req.body.fuel,
        registrationNumber: req.body.registrationNumber,
        kmDriven: Number(req.body.km),
        condition: req.body.description,
        images: imageUrls,
        videos: videoUrls,
        features: parsedFeatures,
      },

      sellerPrice: Number(req.body.expectedPrice),

      rcDetails: {
        rcOwner: req.body.rcOwner,
        rcOwnerName:
          req.body.rcOwner === "no" ? req.body.rcOwnerName : null,
        rcImage:
          req.body.rcOwner === "yes" ? rcImageUrl : null,
      },
    });

    console.log("SELL REQUEST SAVED 👉", sellRequest._id);
    console.log("SELL REQUEST SAVED FEATURES 👉", sellRequest?.car?.features);
    console.log("========= SELL REQUEST END =========");

    res.status(201).json({
      message: "Car sell request created successfully",
      data: sellRequest,
    });
  } catch (error) {
    console.error("❌ SELL REQUEST ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};

