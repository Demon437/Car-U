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
} from "lucide-react";
import { useState, useEffect } from "react";

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openRequests, setOpenRequests] = useState(false);
  const [openExpenses, setOpenExpenses] = useState(false);

  // Auto open dropdown if inside requests pages
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
      location.pathname.includes("/admin/expenses-admin") ||
      location.pathname.includes("/admin/expenses-employee")
    ) {
      setOpenExpenses(true);
    }
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
      ? "bg-blue-600 text-white"
      : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <>
      {/* OVERLAY (mobile only) */}
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
            <h1 className="text-xl font-bold text-blue-600">Car Admin</h1>
            <p className="text-xs text-gray-500">Management Panel</p>
          </div>

          {/* Close button (mobile) */}
          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink to="/admin/dashboard" className={linkClass} onClick={() => setOpen(false)}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          {/* REQUESTS */}
          <button
            onClick={() => setOpenRequests(!openRequests)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${openRequests
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <div className="flex items-center gap-3">
              <Clock size={18} />
              Requests
            </div>
            {openRequests ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openRequests && (
            <div className="ml-6 mt-2 space-y-1">
              <NavLink to="/admin/pending" className={linkClass} onClick={() => setOpen(false)}>
                <Clock size={16} />
                Pending
              </NavLink>

              <NavLink to="/admin/approved" className={linkClass} onClick={() => setOpen(false)}>
                <CheckCircle size={16} />
                Approved
              </NavLink>

              <NavLink to="/admin/rejected" className={linkClass} onClick={() => setOpen(false)}>
                <XCircle size={16} />
                Rejected
              </NavLink>
            </div>
          )}

          <NavLink to="/admin/live-cars" className={linkClass} onClick={() => setOpen(false)}>
            <Car size={18} />
            Platform Cars
          </NavLink>

          <NavLink to="/admin/sales" className={linkClass} onClick={() => setOpen(false)}>
            <Wallet size={18} />
            Sales
          </NavLink>

          <NavLink to="/admin/documents" className={linkClass} onClick={() => setOpen(false)}>
            <FileText size={18} />
            Documents
          </NavLink>

          {/* <NavLink to="/admin/expenses" className={linkClass} onClick={() => setOpen(false)}>
            <Wallet size={18} />
            Expenses
          </NavLink> */}

          {/* EXPENSES DROPDOWN */}
          <button
            onClick={() => setOpenExpenses(!openExpenses)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${openExpenses
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
              }`}
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
            <div className="ml-6 mt-2 space-y-1">
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

          <NavLink to="/admin/add-offline" className={linkClass} onClick={() => setOpen(false)}>
            <PlusCircle size={18} />
            Add Offline Car
          </NavLink>

          <NavLink to="/admin/history" className={linkClass} onClick={() => setOpen(false)}>
            <History size={18} />
            History
          </NavLink>

          <NavLink to="/admin/dealer" className={linkClass} onClick={() => setOpen(false)}>
            <Car size={18} />
            Dealer
          </NavLink>

          <NavLink to="/admin/individual" className={linkClass} onClick={() => setOpen(false)}>
            <Car size={18} />
            Individual
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
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
