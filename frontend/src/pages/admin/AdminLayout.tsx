import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main Section */}
      <div className="flex-1 flex flex-col">

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center gap-3 bg-white p-4 shadow">
          <button onClick={() => setOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-semibold text-lg">Admin Panel</h1>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 md:ml-64">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
