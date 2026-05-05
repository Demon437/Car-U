import { useEffect, useState } from "react";
import { IndianRupee, Calendar, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import MarkSoldModal from "./MarkSoldModal";

/* ================= TYPES ================= */

interface IndividualCar {
  _id: string;

  brand: string;
  variant?: string;
  year: number;
  fuelType?: string;
  transmission?: string;
  registrationNumber?: string;
  kmDriven?: number;
  condition?: string;
  images?: string[];

  sellerPrice?: number | null;
  adminSellingPrice?: number | null;
  status?: "LIVE" | "SOLD";

  seller?: {
    type?: string;
    name?: string;
    phone?: string;
    altPhone?: string;
    email?: string;
    city?: string;
    area?: string;
  };

  rcDetails?: any;
  sellerDocuments?: any[];
  adminExpenses?: any[];
}

/* ================= COMPONENT ================= */

const Individual = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<IndividualCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCar, setSelectedCar] = useState<IndividualCar | null>(null);

  /* ================= NORMALIZER ================= */
  const normalizeCar = (data: any): IndividualCar => {
    if (data.brand) return data; // already flat

    return {
      _id: data._id,

      ...data.car, // 🔥 brand, variant, year, images, etc.

      seller: data.seller,
      sellerPrice: data.sellerPrice,
      adminSellingPrice: data.adminSellingPrice,
      status: data.status,

      rcDetails: data.rcDetails,
      sellerDocuments: data.sellerDocuments,
      adminExpenses: data.adminExpenses,
    };
  };

  const fetchIndividualCars = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/live-cars");

      const individualCars = (res.data || [])
        .filter((car: any) => car.seller?.type === "individual")
        .map(normalizeCar); // ✅ CRITICAL FIX

      setCars(individualCars);
    } catch (err) {
      console.error(err);
      setError("Failed to load individual cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndividualCars();
  }, []);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
        <span className="ml-3 text-gray-600">
          Loading individual cars...
        </span>
      </div>
    );
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 bg-gray-100/60 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Individual Cars
            </h1>
            <p className="text-gray-500 mt-1">
              Cars added by individual sellers
            </p>
          </div>

          
        </div>

        {/* EMPTY STATE */}
        {cars.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-gray-500 text-lg">
              No individual live cars available
            </p>
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => {
            const finalPrice =
              car.adminSellingPrice ??
              car.sellerPrice ??
              null;

            const imageUrl = car.images?.[0];

            return (
              <div
                key={car._id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100 relative"
              >
                {/* SOLD OVERLAY */}
                {car.status === "SOLD" && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
                    <img
                      src="/Sold.png"
                      alt="Sold"
                      className="w-32 rotate-[-20deg]"
                    />
                  </div>
                )}

                {/* IMAGE */}
                <div className="relative h-44 bg-gray-100">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={car.brand}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    LIVE
                  </span>
                </div>

                {/* CONTENT */}
                <div className="p-5 space-y-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {car.brand}
                      {car.variant ? ` ${car.variant}` : ""}
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar size={14} /> {car.year}
                    </p>
                  </div>

                  {car.kmDriven && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Gauge size={14} />
                      {car.kmDriven.toLocaleString()} km
                    </p>
                  )}

                  {/* PRICE */}
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                    <IndianRupee size={18} />
                    {finalPrice
                      ? finalPrice.toLocaleString("en-IN")
                      : "Price not set"}
                  </div>

                  {/* ACTION */}
                  <button
                    onClick={() => setSelectedCar(car)}
                    disabled={car.status === "SOLD"}
                    className={`w-full mt-2 py-2.5 rounded-lg font-medium transition
                      ${car.status === "SOLD"
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800"
                      }`}
                  >
                    {car.status === "SOLD" ? "Car Sold" : "Mark as Sold"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SOLD MODAL */}
      {selectedCar && (
        <MarkSoldModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onSuccess={fetchIndividualCars}
        />
      )}
    </div>
  );
};

export default Individual;
