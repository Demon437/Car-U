import React, { useEffect, useState, useMemo } from "react";
import api from "@/api/api";
import AdminViewSellRequest from "./AdminViewSellRequest";

/* ================= TYPES ================= */
interface ApprovedRequest {
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
  adminSellingPrice: number;
}

/* ================= CARD ================= */
const ApprovedCard: React.FC<{
  request: ApprovedRequest;
  onClick: () => void;
}> = ({ request, onClick }) => (
  <div
    onClick={onClick}
    className="
      bg-white rounded-2xl border shadow-sm
      p-4 cursor-pointer
      transition-all
      active:scale-[0.98]
      hover:shadow-lg
    "
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-2">
      <h2 className="text-base font-semibold text-gray-900 leading-tight">
        {request.car.brand} {request.car.model}
      </h2>

      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
        ₹{request.adminSellingPrice.toLocaleString()}
      </span>
    </div>

    {/* Meta */}
    <p className="text-xs text-gray-500 mb-3">{request.car.year}</p>

    {/* Seller */}
    <div className="flex items-center justify-between text-sm text-gray-600">
      <span>{request.seller.name}</span>
      <span className="text-blue-600 font-medium">View →</span>
    </div>
  </div>
);

/* ================= SEARCH ================= */
const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <input
    type="text"
    placeholder="Search brand, model, seller..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="
      w-full md:w-80 px-4 py-2
      border border-gray-300 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-blue-500
    "
  />
);

/* ================= FILTER ================= */
const FilterSort: React.FC<{
  sortBy: string;
  onSortChange: (value: string) => void;
  filterBrand: string;
  onFilterBrandChange: (value: string) => void;
  brands: string[];
}> = ({
  sortBy,
  onSortChange,
  filterBrand,
  onFilterBrandChange,
  brands,
}) => (
  <div className="flex flex-col gap-4">
    <select
      value={sortBy}
      onChange={(e) => onSortChange(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg"
    >
      <option value="">Sort by...</option>
      <option value="year-asc">Year (Oldest)</option>
      <option value="year-desc">Year (Newest)</option>
      <option value="price-asc">Price (Low → High)</option>
      <option value="price-desc">Price (High → Low)</option>
    </select>

    <select
      value={filterBrand}
      onChange={(e) => onFilterBrandChange(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg"
    >
      <option value="">Filter by Brand</option>
      {brands.map((brand) => (
        <option key={brand} value={brand}>
          {brand}
        </option>
      ))}
    </select>
  </div>
);

/* ================= PAGE ================= */
const ApprovedRequests: React.FC = () => {
  const [data, setData] = useState<ApprovedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  const [showFilters, setShowFilters] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await api.get("/admin/approved");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApproved();
  }, []);

  /* ================= BRANDS ================= */
  const brands = useMemo(
    () => [...new Set(data.map((r) => r.car.brand))],
    [data]
  );

  /* ================= FILTER LOGIC ================= */
  const filteredData = useMemo(() => {
    let filtered = data.filter(
      (r) =>
        r.car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterBrand) {
      filtered = filtered.filter((r) => r.car.brand === filterBrand);
    }

    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "year-asc":
            return a.car.year - b.car.year;
          case "year-desc":
            return b.car.year - a.car.year;
          case "price-asc":
            return a.adminSellingPrice - b.adminSellingPrice;
          case "price-desc":
            return b.adminSellingPrice - a.adminSellingPrice;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, sortBy, filterBrand]);

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="ml-4 text-lg text-gray-700">
          Loading approved requests...
        </p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Approved Requests
        </h1>

        {/* SEARCH + FILTER */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(true)}
            className="md:hidden w-full py-3 rounded-xl bg-blue-600 text-white font-medium"
          >
            Filters & Sort
          </button>

          {/* Desktop Filters */}
          <div className="hidden md:block">
            <FilterSort
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterBrand={filterBrand}
              onFilterBrandChange={setFilterBrand}
              brands={brands}
            />
          </div>
        </div>

        {/* GRID */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No approved requests found 🚗
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredData.map((r) => (
              <ApprovedCard
                key={r._id}
                request={r}
                onClick={() => {
                  setSelectedRequestId(r._id);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= MOBILE FILTER SHEET ================= */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:hidden">
          <div className="bg-white w-full rounded-t-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Filters & Sort</h3>

            <FilterSort
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterBrand={filterBrand}
              onFilterBrandChange={setFilterBrand}
              brands={brands}
            />

            <button
              onClick={() => setShowFilters(false)}
              className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-medium"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}
      {showModal && selectedRequestId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center">
          <div
            className="
              bg-white w-full md:max-w-5xl
              h-[92vh] md:h-auto
              rounded-t-2xl md:rounded-2xl
              overflow-y-auto shadow-2xl
            "
          >
            <AdminViewSellRequest
              requestId={selectedRequestId}
              onClose={() => {
                setShowModal(false);
                setSelectedRequestId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedRequests;
