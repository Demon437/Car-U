const Expense = require("../models/Expense");




/* ================= ADD EXPENSE ================= */
exports.addExpense = async (req, res) => {
    try {
        const { person, title, amount, category, date } = req.body;

        if (!person || !title || !amount) {
            return res.status(400).json({
                message: "person, title and amount are required",
            });
        }

        const expense = await Expense.create({
            person,
            title,
            amount,
            category,
            date,
        });

        res.status(201).json({
            message: "✅ Expense added successfully",
            expense,
        });
    } catch (error) {
        console.error("❌ Add Expense Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ================= GET EXPENSES ================= */
exports.getExpenses = async (req, res) => {
    try {
        const { person } = req.query;

        const filter = person ? { person } : {};

        // const expenses = await Expense.find(filter).sort({ date: -1 });

        const expenses = await Expense.find(filter)
            .populate("person", "name") // 👈 yahi magic hai
            .sort({ date: -1 });

        res.status(200).json(expenses);
    } catch (error) {
        console.error("❌ Get Expenses Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

/* ================= DELETE EXPENSE ================= */
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findByIdAndDelete(id);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.status(200).json({ message: "✅ Expense deleted successfully" });
    } catch (error) {
        console.error("❌ Delete Expense Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
