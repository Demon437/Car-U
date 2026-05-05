const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

// 🔥 ADMIN DOCUMENT UPLOAD (single file)
router.post(
    "/",
    upload.single("file"),
    (req, res) => {
        try {
            if (!req.file || !req.file.path) {
                return res.status(400).json({
                    message: "File upload failed",
                });
            }

            return res.status(200).json({
                message: "File uploaded successfully",
                url: req.file.path, // ✅ Cloudinary URL
            });
        } catch (err) {
            console.error("UPLOAD ERROR:", err);
            res.status(500).json({ message: "Upload error" });
        }
    }
);

module.exports = router;
