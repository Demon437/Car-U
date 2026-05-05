import React, { useEffect, useState } from "react";
import api from "../../api/api";

// Assuming you have react-icons installed. If not, run: npm install react-icons
import {
    FaClock,      // For Pending Requests
    FaCheckCircle, // For Approved Requests
    FaTimesCircle, // For Rejected Requests
    FaCar,        // For Live Cars
    FaShoppingCart, // For Sold Cars
    FaRupeeSign   // For Total Revenue
} from "react-icons/fa";

interface DashboardStats {
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    liveCars: number;
    soldCars: number;
    totalRevenue: number;
}



const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/dashboard-stats");
                setStats(res.data);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
                setError("Failed to load dashboard stats. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-lg">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 text-lg">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500 text-lg">No stats available</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Pending Requests"
                        value={stats.pendingRequests}
                        icon={<FaClock className="text-yellow-500" />}
                        bgColor="bg-yellow-50"
                        borderColor="border-yellow-200"
                    />
                    <StatCard
                        title="Approved Requests"
                        value={stats.approvedRequests}
                        icon={<FaCheckCircle className="text-green-500" />}
                        bgColor="bg-green-50"
                        borderColor="border-green-200"
                    />
                    <StatCard
                        title="Rejected Requests"
                        value={stats.rejectedRequests}
                        icon={<FaTimesCircle className="text-red-500" />}
                        bgColor="bg-red-50"
                        borderColor="border-red-200"
                    />
                    <StatCard
                        title="Live Cars"
                        value={stats.liveCars}
                        icon={<FaCar className="text-blue-500" />}
                        bgColor="bg-blue-50"
                        borderColor="border-blue-200"
                    />
                    <StatCard
                        title="Sold Cars"
                        value={stats.soldCars}
                        icon={<FaShoppingCart className="text-purple-500" />}
                        bgColor="bg-purple-50"
                        borderColor="border-purple-200"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={
                            <div>
                                <span className="block text-3xl font-bold text-indigo-700 break-all">
                                    ₹{stats.totalRevenue.toLocaleString("en-IN")}
                                </span>
                                <span className="text-xs text-gray-500">
                                    Received Amount
                                </span>
                            </div>
                        }
                        icon={<FaRupeeSign className="text-indigo-600" />}
                        bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
                        borderColor="border-indigo-200"
                    />


                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
}


const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor, borderColor }) => (
    <div className={`relative ${bgColor} border ${borderColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">{title}</p>
                <div className="mt-2">{value}</div>
            </div>
            <div className="text-4xl opacity-75">
                {icon}
            </div>
        </div>
        {/* Optional subtle background pattern or gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white opacity-10 rounded-xl"></div>
    </div>
);

export default Dashboard;