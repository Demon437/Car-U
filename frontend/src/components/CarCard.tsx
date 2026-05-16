// import { Link } from "react-router-dom";
// import { Calendar, Gauge, Fuel } from "lucide-react";

// /* ================= TYPES ================= */

// interface CarCardProps {
//   id: string;

//   image?: string;
//   brand?: string;
//   variant?: string;

//   price?: number | null;          // final display price
//   year?: number;
//   km?: number;
//   fuel?: string;

//   emi?: number;
//   status?: "LIVE" | "SOLD";
//   isVerified?: boolean;
// }

// /* ================= COMPONENT ================= */

// const CarCard = ({
//   id,
//   image,
//   brand,
//   variant,
//   price,
//   year,
//   km,
//   fuel,
//   emi,
//   status = "LIVE",
//   isVerified = false,
// }: CarCardProps) => {
//   const isSold = status === "SOLD";

//   const displayName =
//     [brand, variant].filter(Boolean).join(" ") || "Car Details";

//   const displayPrice =
//     typeof price === "number" ? price.toLocaleString("en-IN") : null;

//   const calculatedEmi =
//     !isSold && typeof price === "number"
//       ? Math.round(price / 60) // 5 years example
//       : null;

//   return (
//     <Link
//       to={`/car/${id}`}
//       className="relative block rounded-xl overflow-hidden bg-white border
//                  shadow-sm hover:shadow-lg transition hover:-translate-y-1"
//     >
//       {/* ================= IMAGE ================= */}
//       <div className="relative h-56 bg-gray-100">
//         <img
//           src={image || "https://via.placeholder.com/400x300?text=No+Image"}
//           alt={displayName}
//           className={`w-full h-full object-contain transition
//             ${isSold ? "opacity-60 grayscale" : ""}`}
//           onError={(e) => {
//             (e.target as HTMLImageElement).src =
//               "https://via.placeholder.com/400x300?text=No+Image";
//           }}
//         />

//         {/* VERIFIED BADGE */}
//         {isVerified && (
//           <span className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full z-10">
//             Verified
//           </span>
//         )}

//         {/* SOLD STAMP */}
//         {isSold && (
//           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
//             <img
//               src="/Sold.png"
//               alt="Sold"
//               className="w-40 rotate-[-20deg] opacity-90"
//             />
//           </div>
//         )}
//       </div>

//       {/* ================= CONTENT ================= */}
//       <div className="p-4 space-y-2">
//         <h3 className="font-semibold text-lg text-gray-900">
//           {displayName}
//         </h3>

//         {/* PRICE */}
//         <p
//           className={`font-bold text-xl ${isSold ? "text-red-600" : "text-primary"
//             }`}
//         >
//           {isSold
//             ? "SOLD"
//             : displayPrice
//               ? `₹${displayPrice}`
//               : "Price on request"}
//         </p>

//         {!isSold && calculatedEmi && (
//           <p className="text-sm text-muted-foreground">
//             EMI from ₹{calculatedEmi.toLocaleString("en-IN")}/month
//           </p>
//         )}

//         {/* META INFO */}
//         <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
//           {year && (
//             <span className="flex items-center gap-1">
//               <Calendar size={14} /> {year}
//             </span>
//           )}
//           {km && (
//             <span className="flex items-center gap-1">
//               <Gauge size={14} /> {km.toLocaleString("en-IN")} km
//             </span>
//           )}
//           {fuel && (
//             <span className="flex items-center gap-1">
//               <Fuel size={14} /> {fuel}
//             </span>
//           )}
//         </div>

//         {/* SOLD NOTE */}
//         {isSold && (
//           <p className="text-xs text-red-600 font-medium mt-2">
//             This car has already been sold
//           </p>
//         )}
//       </div>
//     </Link>
//   );
// };

// export default CarCard;


import { Link } from "react-router-dom";
import { Calendar, Gauge, Fuel } from "lucide-react";

/* ================= TYPES ================= */

interface CarCardProps {
  id: string;

  image?: string;
  brand?: string;
  variant?: string;

  price?: number | null;
  year?: number;
  km?: number;
  fuel?: string;

  emi?: number;
  status?: "LIVE" | "SOLD";
  isVerified?: boolean;
  features?: {
    entertainment?: string[];
    safety?: string[];
    comfort?: string[];
    interiorExterior?: string[];
    custom?: string[];
  };
}


/* ================= COMPONENT ================= */

// ADD THIS FUNCTION HERE
const formatFeatureName = (feature: string) => {
  return feature
    .replace(/([a-z])([A-Z])/g, "$1 $2") // driverAirbag -> driver Airbag
    .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize each word
};

const CarCard = ({
  id,
  image,
  brand,
  variant,
  price,
  year,
  km,
  fuel,
  emi,
  status = "LIVE",
  isVerified = false,
  features,
}: CarCardProps) => {
  const isSold = status === "SOLD";

  const displayName =
    [brand, variant].filter(Boolean).join(" ") || "Car Details";

  const displayPrice =
    typeof price === "number" ? price.toLocaleString("en-IN") : null;

  const calculatedEmi =
    !isSold && typeof price === "number"
      ? Math.round(price / 60)
      : null;

  return (
    <Link
      to={`/car/${id}`}
      className="group block overflow-hidden rounded-3xl
  bg-white
  border border-gray-200/80
  ring-1 ring-gray-100
  shadow-lg shadow-gray-200/60
  hover:shadow-2xl hover:shadow-gray-300/40
  hover:border-red-200
  hover:ring-red-100
  hover:-translate-y-2
  transition-all duration-500 ease-out"
    >
      {/* ================= IMAGE SECTION ================= */}
      <div className="relative bg-gray-50 h-56 flex items-center justify-center">
        <img
          src={image || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={displayName}
          className={`max-h-full object-contain transition duration-300
            group-hover:scale-105 ${isSold ? "grayscale" : ""}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/400x300?text=No+Image";
          }}
        />

        {/* VERIFIED BADGE */}
        {isVerified && (
          <span className="absolute top-3 left-0 bg-green-600 text-white text-xs px-4 py-1 rounded-r-full shadow">
            Verified
          </span>
        )}

        {/* SOLD OVERLAY */}
        {isSold && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <img
              src="/Sold.png"
              alt="Sold"
              className="w-36 rotate-[-15deg] opacity-90"
            />
          </div>
        )}
      </div>

      {/* ================= CONTENT SECTION ================= */}
      <div className="p-5 space-y-3">

        {/* TITLE */}
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
          {displayName}
        </h3>

        {/* PRICE + EMI ROW */}
        <div className="flex items-end justify-between">
          <div>
            <p
              className={`text-2xl font-bold ${isSold ? "text-red-600" : "text-primary"
                }`}
            >
              {displayPrice ? `₹${displayPrice}` : "Price on request"}
            </p>

            {/* Sold Badge */}
            {isSold && (
              <p className="text-xs text-red-600 font-bold uppercase mt-1">
                Sold
              </p>
            )}

            {!isSold && calculatedEmi && (
              <p className="text-xs text-muted-foreground">
                EMI from ₹{calculatedEmi.toLocaleString("en-IN")}/month
              </p>
            )}
          </div>
        </div>

        {/* SPECIFICATIONS */}
        <div className="flex flex-wrap gap-2 pt-2">
          {year && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full">
              <Calendar size={14} /> {year}
            </span>
          )}

          {km && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full">
              <Gauge size={14} /> {km.toLocaleString("en-IN")} km
            </span>
          )}

          {fuel && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full">
              <Fuel size={14} /> {fuel}
            </span>
          )}
        </div>

        {/* KEY FEATURES */}
        {features && (
          <div className="flex flex-wrap gap-1 pt-1">
            {features.safety?.slice(0, 2).map((feature, i) => (
              <span key={`safety-${i}`} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {formatFeatureName(feature)}
              </span>
            ))}
            {features.comfort?.slice(0, 1).map((feature, i) => (
              <span key={`comfort-${i}`} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                {formatFeatureName(feature)}
              </span>
            ))}
            {features.entertainment?.slice(0, 1).map((feature, i) => (
              <span key={`entertainment-${i}`} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {formatFeatureName(feature)}
              </span>
            ))}
            {features.custom?.slice(0, 1).map((feature, i) => (
              <span key={`custom-${i}`} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                {formatFeatureName(feature)}
              </span>
            ))}
          </div>
        )}

        {/* SOLD NOTE */}
        {isSold && (
          <p className="text-xs text-red-600 font-bold uppercase text-center">
            This car has already been sold
          </p>
        )}
      </div>
    </Link>
  );
};

export default CarCard;
