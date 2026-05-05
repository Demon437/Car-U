import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CarCard from "@/components/CarCard";
import { useEffect, useState } from "react";
import api from "@/api/api";

export const FeaturedCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const response = await api.get("/cars");
        const currentYear = new Date().getFullYear();
        const minYear = currentYear - 2; // Last 2 years including current year

        console.log("All cars from API:", response.data);
        console.log("Min year filter:", minYear);

        // Filter cars from last 2 years and limit to 6
        const filteredCars = response.data
          .filter((carData) => carData.car?.year >= minYear)
          .slice(0, 6)
          .map((carData) => ({
            id: carData._id,
            image: carData.car?.images?.[0] || "",

            // ✅ CORRECT SOURCE
            brand: carData.car?.brand,
            variant: carData.car?.variant, // optional

            price: carData.adminSellingPrice,
            year: carData.car?.year,
            km: carData.car?.kmDriven,
            fuel: carData.car?.fuelType,
            emi: Math.round(carData.adminSellingPrice / 100),
            status: carData.status,
            isVerified: true,
          }));


        console.log("Filtered cars:", filteredCars);
        setCars(filteredCars);
      } catch (error) {
        console.error("Failed to fetch featured cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

//   return (
//     <section className="py-24 relative overflow-hidden">
//       <div className="container mx-auto px-4">
//         <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
//           <div className="space-y-3">
//             <h2 className="text-4xl md:text-5xl font-display font-bold">The Curated Gallery</h2>
//             <p className="text-muted-foreground text-lg">Handpicked masterpieces, verified for perfection.</p>
//           </div>
//           <Button variant="ghost" className="group text-primary hover:bg-primary/5" asChild>
//             <Link to="/buy">View Full Inventory <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
//           </Button>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {loading ? (
//             <div className="col-span-full text-center py-12">
//               <p className="text-muted-foreground">Loading featured cars...</p>
//             </div>
//           ) : cars.length > 0 ? (
//             cars.map((car) => <CarCard key={car.id} {...car} />)
//           ) : (
//             <div className="col-span-full text-center py-12">
//               <p className="text-muted-foreground">No cars available from 2024 onwards.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };
return (
  <section className="py-20 bg-[#f6f7f9]">
    <div className="max-w-7xl mx-auto px-6 xl:px-0">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Featured Cars
          </h2>

          {/* subtle accent line */}
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
}