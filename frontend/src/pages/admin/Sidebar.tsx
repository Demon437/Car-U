import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  CheckCircle,
  XCircle,
  Car,
  History,
  PlusCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  FileText,
  Wallet,
  X,
  Warehouse,
  Users,
  User,
} from "lucide-react";

import { useState, useEffect } from "react";

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openRequests, setOpenRequests] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);
  const [openExpenses, setOpenExpenses] = useState(false);

  // =========================
  // AUTO OPEN DROPDOWNS
  // =========================

  useEffect(() => {
    if (
      location.pathname.includes("/admin/pending") ||
      location.pathname.includes("/admin/approved") ||
      location.pathname.includes("/admin/rejected")
    ) {
      setOpenRequests(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (
      location.pathname.includes("/admin/live-cars") ||
      location.pathname.includes("/admin/parking-inventory") ||
      location.pathname.includes("/admin/dealer") ||
      location.pathname.includes("/admin/individual")
    ) {
      setOpenInventory(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (
      location.pathname.includes("/admin/expenses-admin") ||
      location.pathname.includes("/admin/expenses-employee")
    ) {
      setOpenExpenses(true);
    }
  }, [location.pathname]);

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  // =========================
  // NAV LINK STYLE
  // =========================

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-gray-700 hover:bg-gray-100"
    }`;

  // =========================
  // DROPDOWN BUTTON STYLE
  // =========================

  const dropdownClass = (isOpen) =>
    `w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isOpen
      ? "bg-blue-50 text-blue-700"
      : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-sm
          flex flex-col z-40
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              Car Admin
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Management Panel
            </p>
          </div>

          {/* MOBILE CLOSE */}
          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

          {/* DASHBOARD */}
          <NavLink
            to="/admin/dashboard"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          {/* ========================= */}
          {/* REQUESTS */}
          {/* ========================= */}

          <button
            onClick={() => setOpenRequests(!openRequests)}
            className={dropdownClass(openRequests)}
          >
            <div className="flex items-center gap-3">
              <Clock size={18} />
              Requests
            </div>

            {openRequests ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {openRequests && (
            <div className="ml-5 mt-2 space-y-1 border-l pl-4">

              <NavLink
                to="/admin/pending"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <Clock size={16} />
                Pending
              </NavLink>

              <NavLink
                to="/admin/approved"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <CheckCircle size={16} />
                Approved
              </NavLink>

              <NavLink
                to="/admin/rejected"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <XCircle size={16} />
                Rejected
              </NavLink>

            </div>
          )}

          {/* ========================= */}
          {/* INVENTORY */}
          {/* ========================= */}

          <button
            onClick={() => setOpenInventory(!openInventory)}
            className={dropdownClass(openInventory)}
          >
            <div className="flex items-center gap-3">
              <Warehouse size={18} />
              Inventory
            </div>

            {openInventory ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {openInventory && (
            <div className="ml-5 mt-2 space-y-1 border-l pl-4">

              <NavLink
                to="/admin/live-cars"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <Car size={16} />
                Platform Cars
              </NavLink>

              {/*<NavLink
                to="/admin/parking-inventory"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <Warehouse size={16} />
                Parking Inventory
              </NavLink>*/}

              <NavLink
                to="/admin/dealer"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <Users size={16} />
                Dealer Cars
              </NavLink>

              <NavLink
                to="/admin/individual"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <User size={16} />
                Individual Cars
              </NavLink>

            </div>
          )}

          {/* SALES */}
          <NavLink
            to="/admin/sales"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            <Wallet size={18} />
            Sales
          </NavLink>

          {/* PURCHASES */}
          <NavLink
            to="/admin/purchases"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            <Car size={18} />
            Purchases
          </NavLink>

          {/* DOCUMENTS */}
          <NavLink
            to="/admin/documents"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            <FileText size={18} />
            Documents
          </NavLink>

          {/* ========================= */}
          {/* EXPENSES */}
          {/* ========================= */}

          <button
            onClick={() => setOpenExpenses(!openExpenses)}
            className={dropdownClass(openExpenses)}
          >
            <div className="flex items-center gap-3">
              <Wallet size={18} />
              Expenses
            </div>

            {openExpenses ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {openExpenses && (
            <div className="ml-5 mt-2 space-y-1 border-l pl-4">

              <NavLink
                to="/admin/expenses-admin"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <Wallet size={16} />
                Admin Expenses
              </NavLink>

              <NavLink
                to="/admin/expenses-employee"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <Wallet size={16} />
                Employee Expenses
              </NavLink>

            </div>
          )}

          {/* ADD OFFLINE CAR */}
          <NavLink
            to="/admin/add-offline"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            <PlusCircle size={18} />
            Add Offline Car
          </NavLink>

          {/* HISTORY */}
          <NavLink
            to="/admin/history"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            <History size={18} />
            History
          </NavLink>

        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t bg-gray-50">

          <button
            onClick={logout}
            className="
              flex items-center gap-3 w-full
              px-4 py-3 rounded-xl
              text-red-600 hover:bg-red-50
              transition-all duration-200
              font-medium text-sm
            "
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;