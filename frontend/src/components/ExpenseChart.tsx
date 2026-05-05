import React from "react";
import { Expense } from "../types";

interface Props {
    expenses: Expense[];
    activePerson: string;
    users: any[];
}

const ExpenseChart: React.FC<Props> = ({ expenses, activePerson, users }) => {
    const p1 = expenses
        .filter((e) => e.person === activePerson)
        .reduce((sum, e) => sum + e.amount, 0);

    

    const total = p1  || 1;

    const pct = (value: number) => Math.round((value / total) * 100);

    return (
        <div className="space-y-3">
            <h4 className="text-lg font-medium">Expense Summary</h4>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white shadow rounded">
                    <div className="text-sm text-gray-500">
                        {users.find((user) => user._id === activePerson)?.name}
                    </div>
                    <div className="text-2xl font-semibold">₹{p1}</div>
                    <div className="mt-2 h-2 bg-gray-100 rounded">
                        <div
                            className="h-2 bg-blue-600 rounded"
                            style={{ width: `${pct(p1)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseChart;


