import React from "react";
import { Expense } from "../types";

interface Props {
  expenses: Expense[];
  activePerson: string;
  users: any[];
}

const ExpenseList: React.FC<Props> = ({
  expenses,
  activePerson,
  users,
}) => {
  /* ================= EMPTY STATE ================= */
  if (expenses.length === 0) {
    return (
      <div className="bg-white border rounded-2xl py-16 text-center">
        <p className="text-sm font-medium text-gray-700">
          No expense records yet
        </p>

        <p className="text-xs text-gray-500 mt-1">
          Add your first expense to see it here
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ================= MOBILE VIEW ================= */}
      <div className="space-y-3 sm:hidden">
        {expenses.map((e) => (
          <div
            key={e._id}
            className="bg-white border rounded-xl p-4 flex justify-between items-start"
          >
            <div className="space-y-1">
              {/* TITLE */}
              <p className="font-semibold text-gray-900 text-sm">
                {e.title}
              </p>

              {/* DATE */}
              <p className="text-xs text-gray-500">
                {e.createdAt
                  ? new Date(e.createdAt).toLocaleDateString(
                      "en-IN"
                    )
                  : "-"}
              </p>

              {/* PAYMENT MODE */}
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                {e.paymentMode || "CASH"}
              </span>

              {/* CATEGORY */}
              {e.category && (
                <p className="text-[11px] text-gray-500">
                  Category: {e.category}
                </p>
              )}

              {/* NOTES */}
              {e.notes && (
                <p className="text-[11px] text-gray-400">
                  {e.notes}
                </p>
              )}
            </div>

            {/* AMOUNT */}
            <div
              className={`text-right font-bold text-base ${
                e.amount < 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹{Math.abs(e.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full">
          {/* HEADER */}
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Date</th>

              <th className="px-6 py-4">Title</th>

              <th className="px-6 py-4">Person</th>

              <th className="px-6 py-4">Payment</th>

              <th className="px-6 py-4">Notes</th>

              <th className="px-6 py-4 text-right">
                Amount (₹)
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y">
            {expenses.map((e) => (
              <tr
                key={e._id}
                className="hover:bg-gray-50 transition"
              >
                {/* DATE */}
                <td className="px-6 py-5 text-gray-500 text-sm whitespace-nowrap">
                  {e.createdAt
                    ? new Date(e.createdAt).toLocaleDateString(
                        "en-IN"
                      )
                    : "-"}
                </td>

                {/* TITLE */}
                <td className="px-6 py-5">
                  <div className="font-semibold text-gray-900">
                    {e.title}
                  </div>

                  {/* CATEGORY */}
                  {e.category && (
                    <div className="text-xs text-gray-400 mt-1">
                      {e.category}
                    </div>
                  )}
                </td>

                {/* PERSON */}
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {(() => {
                      if (!users || users.length === 0)
                        return "Loading...";

                      const personId =
                        typeof e.person === "string"
                          ? e.person
                          : e.person?._id;

                      const user = users.find(
                        (u) =>
                          String(u._id) === String(personId)
                      );

                      return (
                        user?.name ||
                        personId ||
                        "Unknown"
                      );
                    })()}
                  </span>
                </td>

                {/* PAYMENT MODE */}
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {e.paymentMode || "CASH"}
                  </span>
                </td>

                {/* NOTES */}
                <td className="px-6 py-5 text-sm text-gray-500 max-w-[220px]">
                  <div className="truncate">
                    {e.notes || "-"}
                  </div>
                </td>

                {/* AMOUNT */}
                <td
                  className={`px-6 py-5 text-right font-bold text-lg ${
                    e.amount < 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₹{Math.abs(e.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ExpenseList;