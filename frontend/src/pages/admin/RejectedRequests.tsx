import { useEffect, useState } from "react";
import { XCircle, User, Phone, Car } from "lucide-react";
import api from "@/api/api";

interface RejectedRequest {
  _id: string;
  car: {
    brand: string;
    model: string;
    year: number;
  };
  seller: {
    name: string;
    phone: string;
  };
  rejectReason: string;
}

const RejectedRequests = () => {
  const [data, setData] = useState<RejectedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRejected = async () => {
    try {
      const res = await api.get("/admin/rejected");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejected();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-gray-600">
          Loading rejected requests...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100/60 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Rejected Requests
          </h1>
          <p className="text-gray-500 mt-1">
            Requests that were declined with reasons
          </p>
        </div>

        {/* EMPTY STATE */}
        {data.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-gray-500 text-lg">
              No rejected requests found
            </p>
          </div>
        )}

        {/* LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-red-100 shadow-sm hover:shadow-lg transition-all"
            >
              {/* TOP BAR */}
              <div className="flex items-center gap-3 px-5 py-4 border-b">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="text-red-600" size={22} />
                </div>

                <div>
                  <h2 className="font-semibold text-lg text-gray-900">
                    {r.car.brand} {r.car.model}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Model Year · {r.car.year}
                  </p>
                </div>
              </div>

              {/* BODY */}
              <div className="p-5 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <User size={14} />
                  <span className="font-medium">{r.seller.name}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={14} />
                  <span>{r.seller.phone}</span>
                </div>

                <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3 text-red-700">
                  <p className="text-xs font-semibold uppercase mb-1">
                    Rejection Reason
                  </p>
                  <p className="text-sm">
                    {r.rejectReason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RejectedRequests;
