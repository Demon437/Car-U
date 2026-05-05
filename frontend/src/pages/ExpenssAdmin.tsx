import React, { useEffect, useState } from "react";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import ExpenseChart from "../components/ExpenseChart";
import { Expense } from "../types";
import api from "@/api/api";
import { Button } from "@mui/material";

const ExpensesAdmin = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // const [activePerson, setActivePerson] =
  //   useState<"RAHUL MUKATI" | "NILESH PRAJAPATI">("RAHUL MUKATI");

  const [activePerson, setActivePerson] = useState<string>("");

  const [loading, setLoading] = useState(true);


  // 🔥 DEFAULT = TODAY
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [users, setUsers] = useState<any[]>([]);
  const [openModel, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState("");

  

  useEffect(() => {
    fetchExpenses();
    fetchUsers();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses");
      setExpenses(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users?role=admin");
      const usersData = res.data || [];

      setUsers(usersData);

      // ✅ DEFAULT SELECT FIRST USER
      if (usersData.length > 0) {
        setActivePerson(usersData[0]._id);
      }
    } catch (err) {
      console.error("❌ Failed to fetch users", err);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.trim()) return;

    try {
      const res = await api.post("/users/add", { name: newUser, role: "admin" });
      console.log("Handle Add User: ", res);
      setUsers((prev) => [res.data.user, ...prev]);

      setActivePerson(res.data.user._id);
      setNewUser("");
      setOpenModal(false);
    } catch (err) {
      console.error("User not added", err);
    }
  }

  const addExpense = async (expense: Expense) => {
    try {
      // Validation: Check if activePerson is selected
      if (!activePerson) {
        alert("Please select a user first");
        return;
      }

      const payload = {
        person: activePerson,
        title: expense.title,
        amount: Number(expense.amount),
        category: expense.category,
      };

      console.log("Sending expense payload:", payload);
      const res = await api.post("/expenses", payload);
      setExpenses((prev) => [res.data.expense, ...prev]);
    } catch (error) {
      console.error("Expense add error:", error);
      alert("Expense not saved");
    }
  };




  const deleteExpense = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete expense", err);
    }
  };

  /* ================= FILTER ================= */
  const filtered = expenses.filter((e) => {
    // Handle both string and object person types
    const personId = typeof e.person === 'string' ? e.person : e.person?._id;
    if (personId !== activePerson) return false;

    const expenseDate = new Date(e.createdAt || "").setHours(0, 0, 0, 0);

    if (fromDate) {
      const from = new Date(fromDate).setHours(0, 0, 0, 0);
      if (expenseDate < from) return false;
    }

    if (toDate) {
      const to = new Date(toDate).setHours(0, 0, 0, 0);
      if (expenseDate > to) return false;
    }

    return true;
  });

  /* ================= CALCULATIONS ================= */
  const totalIncome = filtered
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = Math.abs(
    filtered
      .filter((e) => e.amount < 0)
      .reduce((sum, e) => sum + e.amount, 0)
  );

  const netBalance = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading expenses…
      </div>
    );

    
  }

  
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-6 sm:py-8">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Admin Expense Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Manage admin expenses and users
          </p>
        </div>

        <Button variant="contained" onClick={() => setOpenModal(true)}>Add Admin User</Button>



{/* 
        <div className="flex bg-white rounded-full p-1 shadow-sm border w-full sm:w-auto overflow-x-auto">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => setActivePerson(user._id)}
              className={`px-4 py-2 rounded-full text-sm ${activePerson === user._id
                ? "bg-blue-600 text-white"
                : "text-gray-600"
                }`}
            >
              {user.name}
            </button>
          ))}
        </div> */}

        <select
          value={activePerson}
          onChange={(e) => setActivePerson(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm"
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}

        </select>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">

        {/* LEFT */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border focus:ring-2 focus:ring-blue-500">
            <h3 className="text-lg sm:text-xl font-semibold mb-1">
              Today Overview
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Expense distribution
            </p>
            <ExpenseChart expenses={filtered} activePerson={activePerson} users={users} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Add Entry
            </h3>
            <ExpenseForm onAdd={addExpense}   />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border">

            {/* HEADER + FILTER */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-semibold">
                   {users.find((user) => user._id === activePerson)?.name} 
                </h3>
                <span className="text-sm text-gray-500">
                  Total: {filtered.length}
                </span>
              </div>

              {/* DATE FILTER */}
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {(fromDate || toDate) && (
                  <button
                    onClick={() => {
                      setFromDate("");
                      setToDate("");
                    }}
                    className="text-sm text-blue-600 hover:underline self-end"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <ExpenseList expenses={filtered} activePerson={activePerson} users={users} />
          </div>
        </div>
      </div>
      
      

      {/* ================= ADD USER MODAL ================= */}
      {openModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Admin User</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin User Name
                </label>
                <input
                  type="text"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  placeholder="Enter admin user name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setOpenModal(false);
                  setNewUser("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={!newUser.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Add Admin User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesAdmin;
