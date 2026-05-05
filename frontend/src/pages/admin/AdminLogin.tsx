import React, { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/admin/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/admin/dashboard");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border rounded-xl shadow-lg p-8">
        
        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to continue
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-lg
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full px-4 py-2.5 rounded-lg
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="
              w-full py-2.5 rounded-lg
              bg-blue-600 hover:bg-blue-700
              text-white font-semibold
              transition disabled:opacity-60
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Admin access only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;