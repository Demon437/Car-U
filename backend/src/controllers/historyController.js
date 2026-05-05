const Car = require("../models/Car");
const Sale = require("../models/Sale");
const Payment = require("../models/Payment");

// ===================================
// GET /api/admin/history
// ===================================
exports.getAllHistory = async (req, res) => {
  try {
    const { source, fromDate, toDate } = req.query;

    console.log("📍 [getAllHistory] Query:", { source, fromDate, toDate });

    // -------------------------------
    // FETCH SALES WITH CARS
    // -------------------------------
    const sales = await Sale.find({})
      .populate("carId")
      .sort({ createdAt: -1 })
      .lean();

    const saleIds = sales.map(s => s._id);

    // -------------------------------
    // FETCH ALL PAYMENTS (🔥 FIX N+1)
    // -------------------------------
    const allPayments = await Payment.find({
      saleId: { $in: saleIds },
    })
      .sort({ invoiceDate: 1 })
      .lean();

    // Group payments by saleId
    const paymentMap = {};
    for (const p of allPayments) {
      const key = p.saleId.toString();
      if (!paymentMap[key]) paymentMap[key] = [];
      paymentMap[key].push(p);
    }

    const history = [];

    for (const sale of sales) {
      const car = sale.carId;
      if (!car || car.status !== "SOLD") continue;

      // SOURCE FILTER
      if (source && car.source !== source.toUpperCase()) continue;

      // DATE FILTER
      if (fromDate && car.soldAt && new Date(car.soldAt) < new Date(fromDate)) continue;
      if (toDate && car.soldAt && new Date(car.soldAt) > new Date(toDate)) continue;

      const payments = paymentMap[sale._id.toString()] || [];

      // -------------------------------
      // ADMIN EXPENSES
      // -------------------------------
      const adminExpenses = car.adminExpenses || [];
      const totalAdminExpense = adminExpenses.reduce(
        (sum, e) => sum + Number(e.amount || 0),
        0
      );

      const sellerPrice = Number(car.sellerPrice || 0);
      const buyerPrice = Number(car.buyerPrice || 0);

      const profitBeforeExpense = buyerPrice - sellerPrice;
      const netProfit = profitBeforeExpense - totalAdminExpense;

      history.push({
        _id: car._id,

        // CAR SNAPSHOT
        car: {
          brand: car.car?.brand,
          model: car.car?.model,
          year: car.car?.year,
          fuelType: car.car?.fuelType,
          transmission: car.car?.transmission,
          kmDriven: car.car?.kmDriven,
          condition: car.car?.condition,
          images: car.car?.images || [],
          features: car.car?.features || {},
        },


        source: car.source,
        soldAt: car.soldAt,
        rcDetails: car.rcDetails,

        // PEOPLE
        seller: car.seller,
        buyer: car.buyer,

        // PRICES
        sellerPrice,
        adminSellingPrice: car.adminSellingPrice,
        buyerPrice,

        // SALE + PAYMENT
        saleId: sale._id,
        paymentSummary: sale.paymentSummary,
        payments,

        // EXPENSES
        adminExpenses,
        totalAdminExpense,

        // PROFIT
        profitBeforeExpense,
        netProfit,
      });
    }

    console.log("📊 [getAllHistory] Final count:", history.length);
    return res.json(history);

  } catch (error) {
    console.error("❌ [getAllHistory] Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
