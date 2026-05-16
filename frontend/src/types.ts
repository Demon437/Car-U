export interface Expense {
  _id?: string;

  title: string;
  amount: number;

  category?: string;

  // ✅ NEW
  paymentMode?: string;
  notes?: string;

  createdAt?: string;

  person?: any;
}