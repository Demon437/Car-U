import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import motarsBanner from "@/assets/motars-banner.png";
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
        const res = await api.get("/admin/live-cars");
        const data = res.data.data || [];

        const normalized: CarType[] = data.map((item: any) => ({
          brand: item.car?.brand,
          model: item.car?.model,
          variant: item.car?.variant,
        }));

        setCars(normalized);

        const uniqueBrands = [
          ...new Set(
            normalized
              .map((car) => car.brand)
              .filter((b): b is string => Boolean(b))
          ),
        ];

        setBrands(uniqueBrands);
      } catch (err) {
        console.error("Error fetching cars", err);
      }
    };

    fetchCars();
  }, []);

  const handleSearch = () => {
    navigate(`/buy?search=${search}&brand=${brand}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-end pb-20 overflow-hidden bg-black text-white">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src={motarsBanner}
          alt="United Motors Banner"
          className="w-full h-full object-cover object-left"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/20" />
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

            {/* SEARCH BAR */}
            <div className="
              mt-20 md:mt-28 lg:mt-36
              w-full max-w-2xl
              bg-white/5 backdrop-blur-xl border border-white/10
              p-3 rounded-2xl flex flex-wrap gap-3 items-center
              shadow-[0_10px_40px_rgba(0,0,0,0.4)]
            ">

              {/* INPUT */}
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search brand, model, variant..."
                  className="bg-transparent outline-none text-sm text-white placeholder-gray-400 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* DROPDOWN */}
              <select
                className="bg-white/10 border border-white/20 px-3 py-2 rounded-lg text-sm text-white"
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

              {/* BUTTON */}
              <button
                onClick={handleSearch}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-row items-center justify-center lg:justify-start gap-3 w-full mt-6">
              <Button
                variant="hero"
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg flex-1 sm:flex-none h-11 sm:h-14 px-4 sm:px-8 text-sm sm:text-lg"
                asChild
              >
                <Link to="/buy">Explore Collection</Link>
              </Button>

              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 flex-1 sm:flex-none h-11 sm:h-14 px-4 sm:px-8 text-sm sm:text-lg"
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