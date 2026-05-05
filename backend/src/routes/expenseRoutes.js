const express = require("express");
const router = express.Router();

const {
    addExpense,
    getExpenses,
    deleteExpense,
} = require("../controllers/expenseController");

/* ================= ROUTES ================= */

// Add expense
router.post("/", addExpense);

// Get all / person wise expenses
// /api/expenses
// /api/expenses?person=person1
router.get("/", getExpenses);

// Delete expense
router.delete("/:id", deleteExpense);

module.exports = router;
