const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const adminController = require("../controllers/adminController");
const adminAuthController = require("../controllers/adminAuthController");
const historyController = require("../controllers/historyController");

// DEBUG LOGS (VERY IMPORTANT)
// console.log("auth:", typeof auth);
// console.log("loginAdmin:", typeof adminAuthController.loginAdmin);
// console.log("getDashboardStats:", typeof adminController.getDashboardStats);
// console.log("getPendingSellRequests:", typeof adminController.getPendingSellRequests);
// console.log("approveSellRequest:", typeof adminController.approveSellRequest);
// console.log("rejectSellRequest:", typeof adminController.rejectSellRequest);
// console.log("addOfflineCar:", typeof adminController.addOfflineCar);
// console.log("getLiveCars:", typeof adminController.getLiveCars);
// console.log("markCarAsSold:", typeof adminController.markCarAsSold);
// console.log("getAllHistory:", typeof historyController.getAllHistory);

// ================= AUTH =================

// LOGIN
router.post(
  "/login",
  adminAuthController.loginAdmin
);

// FORGOT PASSWORD
router.post(
  "/forgot-password",
  adminAuthController.forgotPassword
);

// RESET PASSWORD
router.post(
  "/reset-password/:token",
  adminAuthController.resetPassword
);

// ================= DASHBOARD =================
router.get("/dashboard-stats", auth, adminController.getDashboardStats);

// ================= SELL REQUEST FLOW =================
router.get("/sell-requests", auth, adminController.getPendingSellRequests);

router.put("/approve/:id", auth, adminController.approveSellRequest);

// 🔴 LINE 28 MOST PROBABLY THIS ONE
router.put("/reject/:id", auth, adminController.rejectSellRequest);

// Update sell request (for approved requests)
router.put("/sell-requests/:id", auth, upload.array("images", 10), adminController.updateSellRequest);

// ================= OFFLINE SELLER =================
router.post(
  "/offline-car",
  auth,
  upload.fields([
    { name: "rcImage", maxCount: 1 },

    { name: "images", maxCount: 10 },

    { name: "videos", maxCount: 3 },

    // ✅ SELLER DOCUMENTS
    { name: "sellerDocuments", maxCount: 20 },
  ]),
  adminController.addOfflineCar
);


// ================= CARS =================
router.get("/cars", adminController.getLiveCars);
router.put(
  "/mark-sold/:carId",
  auth,
  upload.fields([
    { name: "buyerAadhaarPhoto", maxCount: 1 },
    { name: "buyerPANPhoto", maxCount: 1 },
    { name: "buyerPhoto", maxCount: 1 },
    { name: "form29", maxCount: 1 },
    { name: "form30", maxCount: 1 },
    { name: "form28", maxCount: 1 },
    { name: "form35", maxCount: 1 },
  ]),
  adminController.markCarAsSold
);

router.get(
  "/sales",
  auth,
  adminController.getAllSales
);

// Add payment to an existing sale
router.post(
  "/sales/:saleId/payments",
  auth,
  adminController.addPaymentToSale
);


// Get full sale details
router.get(
  "/sales/:saleId",
  auth,
  adminController.getSaleDetails
);

// ================= PAYMENT INVOICE =================
router.get(
  "/payments/:paymentId",
  auth,
  adminController.getPaymentInvoice
);

router.get(
  "/payments/:paymentId/pdf",
  auth,
  adminController.getPaymentInvoicePDF
);

// PAYMENT INVOICE TO CLOUDINARY
router.get(
  "/payments/:paymentId/pdf-cloudinary",
  auth,
  adminController.getPaymentInvoicePDFCloudinary
);


// ================= FINAL INVOICE =================
router.get(
  "/sales/:saleId/final-invoice",
  auth,
  adminController.getFinalInvoice
);


// ================= HISTORY =================
router.get("/history", auth, historyController.getAllHistory);

// ================= DOCUMENT Buyer Route =================

router.get(
  "/buyer-documents",
  auth,
  adminController.getBuyerDocuments
);


// ================= BUYER DETAILS =================
router.get("/buyer-details", auth, async (req, res) => {
  try {
    const BuyerDetails = require("../models/BuyerDetails");
    const details = await BuyerDetails.find()
      .populate("carId")
      .sort({ createdAt: -1 });
    console.log("✅ [GET /buyer-details] Found:", details.length);
    res.json(details);
  } catch (error) {
    console.error("❌ [GET /buyer-details] Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// admin get form data 

router.get("/sell-requests/:id", auth, adminController.getSellRequestById);


router.get("/approved", auth, adminController.getApprovedRequests);

// GET Rejected Car
router.get("/rejected", auth, adminController.getRejectedRequests);

// Live Cars
router.get("/live-cars", adminController.getLiveCars);

// Get card details
// Get single car details (PUBLIC)


router.get("/expense-options", adminController.getExpenseOptions);
router.get("/document-options", adminController.getDocumentOptions);

// GET DOCUMENTS LIST
router.get("/seller-documents", adminController.getSellerDocuments);
router.get("/buyer-documents", adminController.getBuyerDocuments);

// Delete documents
router.delete(
  "/seller-documents/:sellRequestId",
  auth,
  adminController.deleteSellerDocument
);

// UPDATE DOCUMENTS
router.put("/seller-documents/:sellRequestId", auth, adminController.updateSellerDocuments);
router.put("/buyer-documents/:carId", auth, adminController.updateBuyerDocuments);


router.get("/sales/:saleId/final-invoice-pdf", auth, adminController.getFinalInvoicePDF);

// FINAL INVOICE TO CLOUDINARY
router.get(
  "/sales/:saleId/final-invoice-pdf-cloudinary",
  auth,
  adminController.getFinalInvoicePDFCloudinary
);

module.exports = router;
