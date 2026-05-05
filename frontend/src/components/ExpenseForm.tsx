import React, { useState } from "react";
import { Expense } from "../types";

interface Props {
  onAdd: (expense: Expense) => void;
}

const ExpenseForm: React.FC<Props> = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"PLUS" | "MINUS">("PLUS");
  const [category, setCategory] = useState("");

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const numericAmount = Math.abs(Number(amount));

    onAdd({
      title,
      amount: type === "MINUS" ? -numericAmount : numericAmount,
      category,
    });

    setTitle("");
    setAmount("");
    setCategory("");
    setType("MINUS");
  };

  return (
    <form
      onSubmit={submitHandler}
      className="space-y-6"
      aria-label="Add expense form"
    >
      {/* ================= TITLE ================= */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Title
        </label>
        <input
          className="
            w-full rounded-xl border border-gray-300 px-4 py-3 text-sm
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition
          "
          placeholder="Petrol, Salary, Office Rent"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className="text-[11px] text-gray-400">
          Short description of this entry
        </p>
      </div>

      {/* ================= AMOUNT + TYPE ================= */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* AMOUNT */}
        <div className="md:col-span-3 space-y-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
              ₹
            </span>
            <input
              className="
                w-full rounded-xl border border-gray-300 pl-10 pr-4 py-3 text-sm
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition
              "
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {/* TYPE TOGGLE */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
            Type
          </label>

          <div
            className="
              flex h-[48px] rounded-xl overflow-hidden border border-gray-300
              shadow-sm
            "
          >
            <button
              type="button"
              onClick={() => setType("PLUS")}
              aria-pressed={type === "PLUS"}
              className={`
                flex-1 font-bold transition-all duration-200
                text-sm sm:text-base
                ${type === "PLUS"
                  ? "bg-red-600 text-white shadow-inner"
                  : "bg-white text-red-600 hover:bg-red-50"}
              `}
            >
              SPEND
            </button>

            <button
              type="button"
              onClick={() => setType("MINUS")}
              aria-pressed={type === "MINUS"}
              className={`
                flex-1 font-bold transition-all duration-200
                text-sm sm:text-base
                ${type === "MINUS"
                  ? "bg-green-600 text-white shadow-inner"
                  : "bg-white text-green-600 hover:bg-green-50"}
              `}
            >
              RETURN
            </button>
          </div>
        </div>
      </div>


      {/* ================= SUBMIT ================= */}
      <button
        type="submit"
        disabled={!title || !amount}
        className="
          w-full py-3.5 rounded-xl
          font-semibold text-sm tracking-wide
          transition-all
          bg-blue-600 text-white
          hover:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm hover:shadow-md
        "
      >
        Add Entry
      </button>
    </form>
  );
};

export default ExpenseForm;

