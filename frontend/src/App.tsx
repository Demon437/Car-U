import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "./pages/Index";
import BuyCar from "./pages/BuyCar";
import SellCar from "./pages/SellCar";
import CarDetails from "./pages/CarDetails";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import EMICalculator from "./pages/EMICalculator";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import PendingRequests from "./pages/admin/PendingRequests";
import ApprovedRequests from "./pages/admin/ApprovedRequests";
import RejectedRequests from "./pages/admin/RejectedRequests";
import LiveCars from "./pages/admin/LiveCars";
import AddOfflineCar from "./pages/admin/AddOfflineCar";
import History from "./pages/admin/History";
import AdminDocuments from "./pages/admin/AdminDocuments";
import Dealer from "./pages/admin/Dealer";
import Individual from "./pages/admin/Individual";
import AllSales from "./pages/admin/AllSales";
import SaleDetails from "./pages/admin/SaleDetails";

// Expenses
import Expenses from "./pages/Expenses";
import ExpenssAdmin from "./pages/ExpenssAdmin";
import ExpenssEmployee from "./pages/ExpenssEmployee";

// Invoices (IMPORTANT: STANDALONE)
import PaymentInvoice from "./pages/admin/PaymentInvoice";
import FinalInvoice from "./pages/admin/FinalInvoice";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// UI Providers
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// import AddMoreFeature from "./pages/admin/AddMoreFeature";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        defaultTheme="light"
        storageKey="autohub-theme"
        attribute="class"
      >
        <TooltipProvider>
          <Toaster />
          {/* <AddMoreFeature /> */}
          <Sonner />
<BrowserRouter>
  <ScrollToTop />

  <Routes>
    {/* ================= PUBLIC ROUTES ================= */}
    <Route path="/" element={<Index />} />
    <Route path="/buy" element={<BuyCar />} />
    <Route path="/sell" element={<SellCar />} />
    <Route path="/emi-calculator" element={<EMICalculator />} />
    <Route path="/car/:id" element={<CarDetails />} />
    <Route path="/contact" element={<Contact />} />

    {/* ================= ADMIN LOGIN ================= */}
    <Route path="/admin/login" element={<AdminLogin />} />

    {/* ================= ADMIN PANEL ================= */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="pending" element={<PendingRequests />} />
      <Route path="approved" element={<ApprovedRequests />} />
      <Route path="rejected" element={<RejectedRequests />} />
      <Route path="live-cars" element={<LiveCars />} />
      <Route path="dealer" element={<Dealer />} />
      <Route path="individual" element={<Individual />} />
      <Route path="add-offline" element={<AddOfflineCar />} />
      <Route path="documents" element={<AdminDocuments />} />
      <Route path="history" element={<History />} />

      {/* SALES */}
      <Route path="sales" element={<AllSales />} />
      <Route path="sales/:saleId" element={<SaleDetails />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="expenses-admin" element={<ExpenssAdmin />} />
      <Route path="expenses-employee" element={<ExpenssEmployee />} />
    </Route>

    {/* ================= INVOICE (NO SIDEBAR) ================= */}
    <Route
      path="/admin/payments/:paymentId/invoice"
      element={<PaymentInvoice />}
    />
    <Route
      path="/admin/sales/:saleId/final-invoice"
      element={<FinalInvoice />}
    />

    {/* ================= 404 ================= */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
