const Expense = require("../models/Expense");

/* ================= ADD EXPENSE ================= */
exports.addExpense = async (req, res) => {
  try {
    const {
      person,
      title,
      amount,
      category,
      paymentMode,
      notes,
      date,
    } = req.body;

    // ✅ VALIDATION
    if (!person || !title || !amount) {
      return res.status(400).json({
        message: "person, title and amount are required",
      });
    }

    // ✅ CREATE EXPENSE
    const expense = await Expense.create({
      person,
      title,
      amount,
      category,
      paymentMode,
      notes,
      date,
    });

    res.status(201).json({
      success: true,
      message: "✅ Expense added successfully",
      expense,
    });
  } catch (error) {
    console.error("❌ Add Expense Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ================= GET EXPENSES ================= */
exports.getExpenses = async (req, res) => {
  try {
    const { person } = req.query;

    const filter = person ? { person } : {};

    const expenses = await Expense.find(filter)
      .populate("person", "name")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      total: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("❌ Get Expenses Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ================= DELETE EXPENSE ================= */
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Expense deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Expense Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};