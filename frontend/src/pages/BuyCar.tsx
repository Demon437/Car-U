import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import FilterSection from "./FilterSection";
import CustomPagination from "@/components/Pagination";

/* ================= TYPES ================= */

type CarType = {
  _id: string;
  brand?: string;
  model?: string;
  variant?: string;
  year?: number;
  fuelType?: string;
  transmission?: string;
  kmDriven?: number;
  images?: string[];
  sellerPrice?: number;
  adminSellingPrice?: number;
  status?: "LIVE" | "SOLD";

  features?: {
    entertainment?: string[];
    safety?: string[];
    comfort?: string[];
    interiorExterior?: string[];
    custom?: string[];
  };
};

/* ================= NORMALIZER ================= */

const normalizeCar = (item: any): CarType => ({
  _id: item._id,

  brand: item.car?.brand,
  model: item.car?.model, // ✅ FIX ADDED
  variant: item.car?.variant,
  year: item.car?.year,
  fuelType: item.car?.fuelType,
  transmission: item.car?.transmission,
  kmDriven: item.car?.kmDriven,
  images: item.car?.images || [],
  features: item.car?.features || {},
  sellerPrice: item.sellerPrice,
  adminSellingPrice: item.adminSellingPrice,

  status: item.status === "LIVE" ? "LIVE" : "SOLD",
});

/* ================= COMPONENT ================= */

const BuyCar = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const searchQuery = params.get("search") || "";
  const brandQuery = params.get("brand") || "";

  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredCars, setFilteredCars] = useState<CarType[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9); //fixed limit

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchCars(currentPage);
  }, [currentPage]);

  const fetchCars = async (page: number) => {
    setLoading(true);
    try {
      console.log(
        "🚗 [BuyCar] Fetching cars for page:",
        page,
        "limit:",
        itemsPerPage,
      );

      // URL mein page aur limit bhej rahe hain
      const res = await api.get(
        `/admin/live-cars?page=${page}&limit=${itemsPerPage}`,
      );

      // console.log("📦 [BuyCar] API Response:", res.data);
      // console.log("📊 [BuyCar] Response structure:", {
      //   hasData: !!res.data.data,
      //   dataLength: res.data.data?.length,
      //   totalPages: res.data.totalPages,
      //   currentPage: res.data.currentPage,
      // });

      console.log("📊 [BuyCar] Response structure:", {
        isArray: Array.isArray(res.data),
        hasData: !!res.data?.data,
        dataLength: Array.isArray(res.data)
          ? res.data.length
          : res.data?.data?.length,
        totalPages: Array.isArray(res.data) ? 1 : res.data?.totalPages,
        currentPage: Array.isArray(res.data) ? page : res.data?.currentPage,
      });

      // Check karo backend response structure (res.data.data)
      // const normalized = (res.data || []).map(normalizeCar);
      // console.log("🔧[BuyCar] Normalized cars:", normalized.length);

      // setCars(normalized);
      // setFilteredCars(normalized);
      // setTotalPages(res.data.totalPages); // Backend se total pages set karo

      const rawCars = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const normalized = rawCars.map(normalizeCar);

      setCars(normalized);
      setFilteredCars(normalized);
      setTotalPages(Array.isArray(res.data) ? 1 : res.data?.totalPages || 1);
    } catch (err) {
      console.error("❌ [BuyCar] Failed to fetch cars", err);
      console.error("❌ [BuyCar] Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH ================= */
  /*
        useEffect(() => {
          fetchCars();
        }, []);

        const fetchCars = async () => {
          try {
            const res = await api.get("/admin/live-cars");

            const normalized = (res.data || []).map(normalizeCar);

            setCars(normalized);
          } catch (err) {
            console.error("Failed to fetch cars", err);
          } finally {
            setLoading(false);
          }
        };
        */

  /* ================= FILTER ================= */
  const handleFilter = (filteredData: any[]) => {
    console.log(" handleFilter received data:", filteredData);

    // Safety check
    if (!filteredData || !Array.isArray(filteredData)) {
      console.error(" filteredData is not an array:", filteredData);
      return;
    }

    // Normalize filtered data from FilterSection
    const normalized = filteredData.map(normalizeCar);
    setFilteredCars(normalized);
  };

  const displayCars = filteredCars.filter((car) => {
    const text = `
    ${car.brand ?? ""}
    ${car.model ?? ""}
    ${car.variant ?? ""}
  `.toLowerCase();

    const matchesSearch =
      searchQuery === "" || text.includes(searchQuery.toLowerCase());

    const matchesBrand = brandQuery === "" || car.brand === brandQuery;

    return matchesSearch && matchesBrand;
  });

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading cars...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="pt-20 pb-22 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-red-700 to-gray-700" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-200/20 blur-3xl rounded-full" />

        <div className="relative container mx-auto px-4 text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white ">
            Find Your Perfect Car
          </h1>

          <p className="text-muted-foreground max-w-xl mx-auto text-white">
            Explore verified vehicles with transparent pricing and trusted
            history.
          </p>

          <div className="">
            <FilterSection onFilter={handleFilter} />
          </div>
        </div>
      </section>

      {/* ================= RESULTS ================= */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {displayCars.length}
              </span>{" "}
              available cars
            </p>
          </div>

          {/* GRID */}
          {displayCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {displayCars.map((car) => {
                const imageUrl =
                  car.images?.[0] ||
                  "https://via.placeholder.com/400x300?text=No+Image";

                const price = car.adminSellingPrice ?? car.sellerPrice ?? 0;

                return (
                  <CarCard
                    key={car._id}
                    id={car._id}
                    image={imageUrl}
                    brand={car.brand}
                    variant={car.variant}
                    year={car.year}
                    km={car.kmDriven}
                    fuel={car.fuelType}
                    price={price}
                    status={car.status}
                    features={car.features}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 space-y-6">
              <div className="text-5xl">🚗</div>

              <h3 className="text-2xl font-semibold text-gray-800">
                No Cars Found
              </h3>

              <p className="text-muted-foreground">
                Try adjusting your search.
              </p>

              <Button
                variant="outline"
                onClick={() => setSearch("")}
                className=""
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      
        {/* RESULTS SECTION KE NICHE */}
        <div>
          <CustomPagination
            totalPage={totalPages}
            currentPage={currentPage}
            onPageChnage={(page) => setCurrentPage(page)}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BuyCar;
