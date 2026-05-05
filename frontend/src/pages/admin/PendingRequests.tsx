import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  User,
  Phone,
  IndianRupee,
  Car,
} from "lucide-react";
import api from "../../api/api";
import StatusBadge from "@/components/ui/StatusBadge";
import AdminApproveSellRequest from "@/pages/admin/AdminApproveSellRequest";

interface SellRequest {
  _id: string;
  
  source: "ONLINE" | "OFFLINE";
  seller: {
    name: string;
    phone: string;
  };
  car: {
    brand: string;
    model: string;
    year: number;
  };
  sellerPrice: number;
}

const PendingRequests: React.FC = () => {
  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<SellRequest | null>(null);

  // ================= FETCH =================
  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin/sell-requests");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ================= REJECT =================
  const rejectRequest = async () => {
    if (!rejectId || !rejectReason.trim()) {
      return alert("Please enter reject reason");
    }

    try {
      await api.put(`/admin/reject/${rejectId}`, {
        reason: rejectReason,
      });

      setRejectId(null);
      setRejectReason("");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Reject failed");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Pending Sell Requests
        </h1>
        <p className="text-gray-500 mt-1">
          Review and approve seller car submissions
        </p>
      </div>

      {/* REQUEST LIST */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {requests.map((r) => (
          <div
            key={r._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition"
          >
            {/* CARD HEADER */}
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Car size={20} className="text-blue-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-lg text-gray-800">
                    {r.car.brand} {r.car.model}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Model Year: {r.car.year}
                  </p>
                </div>
              </div>

              <StatusBadge
                label={r.source}
                type={r.source === "ONLINE" ? "online" : "offline"}
              />
            </div>

            {/* DETAILS */}
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <User size={16} />
                <span>
                  {r.seller.name}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Phone size={16} />
                <span>{r.seller.phone}</span>
              </div>

              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <IndianRupee size={16} />
                <span>₹{r.sellerPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="p-5 pt-0 flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  setSelectedRequest(r);
                  setShowApproveModal(true);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                <CheckCircle size={18} />
                Approve
              </button>

              <button
                onClick={() => setRejectId(r._id)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                <XCircle size={18} />
                Reject
              </button>
            </div>

            {/* REJECT BOX */}
            {rejectId === r._id && (
              <div className="p-5 border-t bg-gray-50 space-y-3">
                <input
                  type="text"
                  placeholder="Enter rejection reason"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />

                <div className="flex gap-3">
                  <button
                    onClick={rejectRequest}
                    className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg"
                  >
                    Confirm Reject
                  </button>

                  <button
                    onClick={() => {
                      setRejectId(null);
                      setRejectReason("");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No pending requests available
          </div>
        )}
      </div>

      {/* ================= APPROVE MODAL ================= */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <AdminApproveSellRequest
              requestId={selectedRequest._id}
              onClose={() => {
                setShowApproveModal(false);
                setSelectedRequest(null);
                fetchRequests();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
