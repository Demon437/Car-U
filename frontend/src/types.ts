export type Expense = {
  _id?: string; // ✅ MongoDB ID
  person?: "RAHUL MUKATI" | "NILESH PRAJAPATI" | { _id: string; name: string };
  title: string;
  amount: number;
  category?: string; // ✅ FIX for TS2339
  createdAt?: string; // ✅ DB date
};
