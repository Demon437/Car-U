const multer = require("multer");

const {
  CloudinaryStorage,
} = require("multer-storage-cloudinary");

const cloudinary =
  require("../config/cloudinary");

// =======================================
// CLOUDINARY STORAGE
// =======================================
const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {

    // =======================================
    // DETECT FILE TYPE
    // =======================================
    let resourceType = "image";

    // ✅ VIDEO FILES
    if (
      file.mimetype.startsWith(
        "video/"
      )
    ) {

      resourceType = "video";
    }

    // ✅ PDF FILES
    else if (
      file.mimetype ===
      "application/pdf"
    ) {

      // IMPORTANT:
      // PDFs should be RAW
      resourceType = "raw";
    }

    return {
      folder: "car-dealership",

      // ✅ IMPORTANT
      resource_type: resourceType,

      // ✅ MAKE FILE PUBLIC
      type: "upload",
      access_mode: "public",

      // ✅ KEEP ORIGINAL EXTENSION
      // Example:
      // invoice.pdf
      // rc-book.pdf
      // video.mp4
      public_id: `${Date.now()}-${
        file.originalname
          .replace(/\s+/g, "-")
      }`,
    };
  },
});

// =======================================
// MULTER CONFIG
// =======================================
const upload = multer({
  storage,

  limits: {

    // ✅ 20MB LIMIT
    fileSize:
      20 * 1024 * 1024,

    // ✅ MAX FILES
    files: 20,
  },

  // =======================================
  // FILE FILTER
  // =======================================
  fileFilter: (
    req,
    file,
    cb
  ) => {

    const isImage =
      file.mimetype.startsWith(
        "image/"
      );

    const isVideo =
      file.mimetype.startsWith(
        "video/"
      );

    const isPdf =
      file.mimetype ===
      "application/pdf";

    // ✅ ALLOW IMAGE / VIDEO / PDF
    if (
      isImage ||
      isVideo ||
      isPdf
    ) {

      cb(null, true);

    } else {

      cb(
        new Error(
          "Only image, video and PDF files are allowed"
        ),
        false
      );
    }
  },
});

module.exports = upload;