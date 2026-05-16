import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CarCard from "@/components/CarCard";
import { useEffect, useState } from "react";
import api from "@/api/api";

export const FeaturedCars = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const response = await api.get("/cars/featured");

        // ✅ HANDLE BOTH API TYPES
        const carsData = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        const currentYear = new Date().getFullYear();
        const minYear = currentYear - 2;

        console.log("📦 RAW API DATA 👉", carsData);

        const filteredCars = carsData
          .filter((carData: any) => {
            // ✅ SAFE YEAR (FIXED)
            const year =
              Number(carData?.year) ||
              Number(carData?.car?.year) ||
              new Date(carData?.createdAt).getFullYear();

            console.log("🚗 FEATURED YEAR 👉", year);

            return year >= minYear && carData.status === "LIVE";
          })
          .slice(0, 6)
          .map((carData: any) => {
            const year =
              carData?.year ||
              carData?.car?.year ||
              new Date(carData?.createdAt).getFullYear();
            console.log(
              "🔥 COVER IMAGE:",
              carData.car?.coverImage
            );

            return {
              id: carData._id,
              image:
                carData.car?.coverImage ||
                carData.car?.images?.[0] ||
                "",
              brand: carData.car?.brand || "Unknown",
              variant: carData.car?.variant || carData.car?.model || "",
              price: carData.adminSellingPrice || 0,
              year,
              km: carData.car?.kmDriven || 0,
              fuel: carData.car?.fuelType || "N/A",
              emi: Math.round((carData.adminSellingPrice || 0) / 100),
              status: carData.status,
              isVerified: true,
            };
          });

        console.log("✅ FILTERED CARS 👉", filteredCars);

        setCars(filteredCars);
      } catch (error) {
        console.error("❌ Failed to fetch featured cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  return (
    <section className="py-20 bg-[#f6f7f9]">
      <div className="max-w-7xl mx-auto px-6 xl:px-0">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Featured Cars
            </h2>
            <div className="w-16 h-1 bg-red-600 mt-3 rounded-full"></div>
            <p className="text-gray-500 mt-4">
              Explore our latest verified arrivals from trusted sellers.
            </p>
          </div>

          <Button
            variant="ghost"
            className="text-red-600 hover:bg-red-50 hover:text-red-700 group font-medium"
            asChild
          >
            <Link to="/buy">
              See all
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-400">Loading featured cars...</p>
            </div>
          ) : cars.length > 0 ? (
            cars.map((car) => <CarCard key={car.id} {...car} />)
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-400">
                No recent cars available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};