import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import motarsBanner from "@/assets/motars-banner.png";
import mobileBanner from "@/assets/mobilebanner.png";
import { useEffect, useState } from "react";
import api from "@/api/api";

type CarType = {
  brand?: string;
  model?: string;
  variant?: string;
};

export const Hero = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [cars, setCars] = useState<CarType[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get("/cars/featured");

        // 🔥 HANDLE API STRUCTURE
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        console.log("🚗 Featured Cars:", data);

        // 🔥 YEAR FILTER (LATEST 2 YEARS)
        const currentYear = new Date().getFullYear();
        const minYear = currentYear - 2;

        const filtered = data.filter((item: any) => {
          const year =
            Number(item?.year) ||
            Number(item?.car?.year) ||
            new Date(item?.createdAt).getFullYear(); // fallback

          console.log("🚗 HERO YEAR 👉", year);

          return year >= minYear;
        });

        // 🔥 NORMALIZE AFTER FILTER
        const normalized: CarType[] = filtered.map((item: any) => ({
          // ✅ HANDLE BOTH API STRUCTURES
          brand: item?.brand || item?.car?.brand || "",
          model: item?.model || item?.car?.model || "",
          variant: item?.variant || item?.car?.variant || "",
        }));

        console.log("✅ NORMALIZED:", normalized);

        // 🔥 SAVE CARS
        setCars(normalized);

        // 🔥 UNIQUE BRANDS
        const uniqueBrands = [
          ...new Set(
            normalized
              .map((car) => car.brand?.trim())
              .filter((b): b is string => Boolean(b))
          ),
        ];

        console.log("✅ UNIQUE BRANDS:", uniqueBrands);

        // 🔥 SAVE BRANDS
        setBrands(uniqueBrands);
      } catch (err) {
        console.error("❌ Error fetching cars:", err);
      }
    };

    fetchCars();
  }, []);

  const handleSearch = () => {
    navigate(`/buy?search=${search}&brand=${brand}`);
  };

  return (
    <section className="relative min-h-[60vh] flex items-end mt-12 pb-20 overflow-hidden bg-black text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        {/* Desktop Banner */}
        <img
          src={motarsBanner}
          alt="United Motors Banner"
          className="hidden md:block w-full h-full object-contain "
        />

        {/* Mobile Banner */}
        <img
          src={mobileBanner}
          alt="United Motors Mobile Banner"
          className="block md:hidden w-full h-full object-cover object-top"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-black/20 md:from-black/20 md:via-black/10 md:to-black/20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left w-full"
          >
            {/* ================= SEARCH CARD ================= */}
            <div
              className="
      mt-6 sm:mt-8 md:mt-28 lg:mt-36
      w-full max-w-2xl
      rounded-3xl
      border border-white/15
      bg-slate-900/75
      backdrop-blur-2xl
      shadow-[0_20px_60px_rgba(0,0,0,0.45)]
      ring-1 ring-white/10
      p-4 sm:p-5
    "
            >
              {/* Search Input */}
              <div
                className="
        flex items-center gap-3
        px-4 py-3.5
        rounded-2xl
        bg-white/8
        border border-white/10
        focus-within:border-red-400/60
        focus-within:ring-2
        focus-within:ring-red-500/20
        transition-all
      "
              >
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search brand, model, variant..."
                  className="
          w-full bg-transparent outline-none
          text-sm sm:text-base text-white
          placeholder:text-gray-400
        "
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Brand Dropdown */}
              <select
                className="
        mt-3 w-full
        px-4 py-3.5
        rounded-2xl
        bg-gradient-to-r from-red-600 to-red-700
        hover:from-red-700 hover:to-red-800
        border border-white/10
        text-sm sm:text-base text-white
        outline-none
        focus:border-red-400/60
        focus:ring-2
        focus:ring-red-500/20
        transition-all
      "
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.length > 0 ? (
                  brands.map((b, i) => (
                    <option key={i} value={b} className="text-black">
                      {b}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading...</option>
                )}
              </select>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="
        mt-4 w-full
        bg-gradient-to-r from-red-600 to-red-700
        hover:from-red-700 hover:to-red-800
        text-white font-semibold
        py-3.5 rounded-2xl
        flex items-center justify-center gap-2
        shadow-lg shadow-red-900/30
        transition-all duration-300
        hover:scale-[1.01]
        active:scale-[0.99]
      "
              >
                <Search className="w-4 h-4" />
                Search Cars
              </button>
            </div>

            {/* ================= ACTION BUTTONS ================= */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mt-4">
              <Button
                variant="hero"
                className="
        w-full sm:w-auto
        bg-red-600 hover:bg-red-700
        text-white shadow-lg
        h-12 sm:h-14
        px-6 sm:px-8
        text-sm sm:text-lg
      "
                asChild
              >
                <Link to="/buy">Explore Collection</Link>
              </Button>

              <Button
                variant="outline"
                className="
        w-full sm:w-auto
        border-white/20
        bg-black/40
        text-white
        hover:bg-white/10
        h-12 sm:h-14
        px-6 sm:px-8
        text-sm sm:text-lg
      "
                asChild
              >
                <Link to="/sell">Sell Your Car</Link>
              </Button>
            </div>
          </motion.div>

          {/* RIGHT EMPTY */}
          <div className="hidden lg:block" />

        </div>
      </div>
    </section>
  );
};