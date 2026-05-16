import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  Fuel,
  Calendar,
  Gauge,
  CheckCircle,
  Settings,
} from "lucide-react";

import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import FeatureBlock from "./FeatureBlock";
import Car360Viewer from "./Car360UploadApp";
import ShowVideo from "./ShowVideo";

const PLACEHOLDER = "https://via.placeholder.com/900x600?text=No+Image";

const phoneNumbers = [
  "+911234567890",
  "+911234567890",
];

/* ================= NORMALIZER ================= */

const normalizeCar = (data: any) => {
  console.log("[CarDetails] Raw car payload from API:", data);

  // already flat
  if (data.brand) {
    const normalizedFlat = {
      ...data,
      model: data.model ?? data.car?.model,
      images: Array.isArray(data.images) ? data.images : data.car?.images || [],
      videos: Array.isArray(data.videos) ? data.videos : data.car?.videos || [],
      features: data.features || data.car?.features || {},
    };
    // console.log("[CarDetails] Normalized flat car data:", normalizedFlat);
    return normalizedFlat;
  }

  // nested structure
  if (data.car) {
    const normalizedNested = {
      _id: data._id,
      ...data.car,

      features: data.car?.features || {}, // 🔥 ADD THIS
      videos: Array.isArray(data.videos) ? data.videos : data.car?.videos || [],

      seller: data.seller,
      sellerPrice: data.sellerPrice,
      adminSellingPrice: data.adminSellingPrice,
      status: data.status,
      source: data.source,
      rcDetails: data.rcDetails,
    };
    // console.log("[CarDetails] Normalized nested car data:", normalizedNested);
    return normalizedNested;
  }
  // console.log("[CarDetails] Fallback normalized car data:", data);
  return data;
};

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [similarCars, setSimilarCars] = useState<any[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  console.log("VIDEOS STATE 👉", videos);
  useEffect(() => {
    if (id) {
      fetchCar();
      fetchSimilarCars();
    }
  }, [id]);

  /* ================= FETCH MAIN CAR ================= */

  const fetchCar = async () => {
    try {
      setLoading(true);
      setError("");
      console.log(`[CarDetails] Fetching main car for id: ${id}`);
      const res = await api.get(`/cars/${id}`);
      // console.log("[CarDetails] /cars/:id API response:", res.data);
      const normalized = normalizeCar(res.data);
      // console.log("[CarDetails] Features from /cars/:id:", normalized?.features);

      // Fallback for old API responses that may miss features on /cars/:id
      if (!normalized?.features || Object.keys(normalized.features).length === 0) {
        // console.log("[CarDetails] Features missing in /cars/:id, trying fallback /admin/live-cars");
        const listRes = await api.get("/admin/live-cars");
        // console.log("[CarDetails] /admin/live-cars response length:", listRes?.data?.length);
        const matched = (listRes.data || []).find((item: any) => item._id === id);
        if (matched) {
          const fallback = normalizeCar(matched);
          // console.log("[CarDetails] Matched fallback car features:", fallback?.features);
          setCar({
            ...normalized,
            features: fallback.features || {},
            videos: fallback.videos || normalized.videos || [],
          });
          setLoading(false);
          return;
        }
      }

      setCar(normalized);
      // console.log("[CarDetails] Final car data set in state:", normalized);
    } catch (error) {
      // console.error("Failed to fetch car details", error);
      setCar(null);
      setError("Failed to load car details");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH SIMILAR ================= */
  const fetchSimilarCars = async () => {
    const res = await api.get("/admin/live-cars");
    // console.log("[CarDetails] Similar cars raw response:", res.data);

    const normalized = (res.data || [])
      .map(normalizeCar)
      .filter((c: any) => c._id !== id)
      .slice(0, 3);

    // console.log("[CarDetails] Similar cars after normalize/filter:", normalized);
    setSimilarCars(normalized);
  };

  if (loading) return <div className="pt-32 text-center">Loading...</div>;
  if (error || !car) return <div className="pt-32 text-center">{error || "Car not found"}</div>;

  const price = car.adminSellingPrice || car.sellerPrice;
  const isSold = car.status === "SOLD";
  const images = car.images?.length ? car.images : [PLACEHOLDER];
  console.log("[CarDetails] Car data in render:", car);
  console.log("[CarDetails] Videos available:", car?.videos);
  // console.log("[CarDetails] Rendering with features:", car?.features);



  // ✅ CALL HANDLER (RETURN SE UPAR)
  const handleCall = () => {
    const randomNumber =
      phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];

    window.location.href = `tel:${randomNumber}`;
  };


  const next = () => setActiveIndex((p) => (p + 1) % images.length);
  const prev = () =>
    setActiveIndex((p) => (p === 0 ? images.length - 1 : p - 1));

  const shareCar = () => {
    const url = window.location.href;
    const text = `Check out this car: ${car.brand} ${car.variant ?? ""} for ₹${price?.toLocaleString()}`;

    if (navigator.share) {
      navigator.share({ title: car.brand, text, url });
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
        "_blank"
      );
    }
  };


  return (
    <>
      <Helmet>
        <title>
          {`${car.brand ?? "Car"} ${car.variant ?? ""
            } | Buy Used Car`}
        </title>

        <meta
          name="description"
          content={`${car.brand} ${car.variant ?? ""
            } available for sale`}
        />
      </Helmet>

      <Navbar />

      {/* ================= HERO ================= */}
      <section className="pt-28 pb-16 bg-gray-50">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12">

          {/* 360° IMAGE GALLERY */}
          <div>
            <Car360Viewer images={images} />
          </div>

          {/* DETAILS */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold">
                {car.brand} {car.variant}
              </h1>
              <p className="text-gray-500 mt-1">
                {car.year || "N/A"} • {car.kmDriven || "N/A"} km •{" "}
                {car.fuelType || "N/A"}
              </p>
            </div>

            {/* PRICE */}
            <div className="bg-white border rounded-2xl p-6 shadow">
              <p className="text-sm text-gray-500">Price</p>
              <p
                className={`text-4xl font-bold ${isSold ? "text-red-600" : "text-red-600"
                  }`}
              >
                {isSold ? "SOLD" : `₹${price?.toLocaleString() || "N/A"}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-16">

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                Verified Car
              </span>

              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                Single Owner
              </span>

              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
                Insurance Active
              </span>

              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                RC Available
              </span>

            </div>


            {/* SPECS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Spec label="Year" value={car.year} icon={<Calendar />} />
              <Spec label="KM Driven" value={car.kmDriven} icon={<Gauge />} />
              <Spec label="Fuel" value={car.fuelType} icon={<Fuel />} />
              <Spec
                label="Transmission"
                value={car.transmission || "N/A"}
                icon={<Settings />}
              />
              <Spec
                label="Status"
                value={isSold ? "SOLD" : "Available"}
                icon={<CheckCircle />}
              />
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-4">

              {/* CALL (RANDOM) */}
              <Button disabled={isSold} onClick={handleCall}>
                <Phone className="mr-2" /> Call
              </Button>

              {/* WHATSAPP (FIXED / CAN ALSO BE RANDOM IF YOU WANT) */}
              <a
                href="https://wa.me/911234567890"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="whatsapp" disabled={isSold}>
                  <MessageCircle className="mr-2" /> WhatsApp
                </Button>
              </a>

              {/* SHARE */}
              <Button variant="outline" onClick={shareCar}>
                Share
              </Button>

            </div>


          </div>
        </div>
      </section>

      {/* ================= VIDEOS SECTION ================= */}
      {car?.videos?.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6">Car Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {car.videos.map((video, index) => (
                <video
                  key={index}
                  src={video}
                  controls
                  className="w-full h-64 rounded-lg object-cover border border-gray-200 shadow"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= CAR in 260 View ================= */}
      <section className="py-10 bg-white border-t border-gray-100">
  <div className="container mx-auto px-6 max-w-6xl">
    {/* Section Header */}
    <div className="mb-6">
      <h2 className="text-3xl font-bold text-gray-900">About This Car</h2>
      <p className="text-sm text-gray-500 mt-2 max-w-3xl leading-6">
        Get a quick overview of this vehicle’s overall condition, maintenance
        status, and any important notes provided by the seller. This helps you
        understand the car better before making a decision.
      </p>
    </div>

    {/* Content Card */}
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
      <p className="text-gray-700 leading-8 text-base whitespace-pre-line">
        {car.condition?.trim()
          ? car.condition
          : "This vehicle has been carefully inspected and maintained. It is in good overall condition with all essential features functioning properly. Contact us for more details or to schedule a test drive."}
      </p>
    </div>
  </div>
</section>

      {/* ================= FEATURES ================= */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="bg-white border rounded-2xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Features</h2>

            {/* Entertainment */}
            {car.features?.entertainment?.length > 0 && (
              <FeatureBlock title="Entertainment" items={car.features.entertainment} />
            )}

            {/* Safety */}
            {car.features?.safety?.length > 0 && (
              <FeatureBlock title="Safety" items={car.features.safety} />
            )}

            {/* Comfort */}
            {car.features?.comfort?.length > 0 && (
              <FeatureBlock title="Comfort" items={car.features.comfort} />
            )}

            {/* Interior / Exterior */}
            {car.features?.interiorExterior?.length > 0 && (
              <FeatureBlock
                title="Interior & Exterior"
                items={car.features.interiorExterior}
              />
            )}

            {/* Custom */}
            {car.features?.custom?.length > 0 && (
              <FeatureBlock title="Other" items={car.features.custom} />
            )}

            {/* No features message */}
            {(!car.features ||
              (!car.features.entertainment?.length &&
                !car.features.safety?.length &&
                !car.features.comfort?.length &&
                !car.features.interiorExterior?.length &&
                !car.features.custom?.length)) && (
                <p className="text-gray-500">No features available</p>
              )}
          </div>

          <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-2xl p-5">

            <p className="text-sm text-gray-300">
              Estimated EMI
            </p>
            <div
              className="
    bg-gradient-to-r
    from-black
    to-gray-900
    text-white
    rounded-3xl
    p-6
    shadow-xl
    border border-white/10
  "
            >

              {/* TOP */}
              <div
                className="
      flex
      items-start
      justify-between
      gap-4
    "
              >

                <div>
                  <p
                    className="
          text-sm
          text-gray-300
          uppercase
          tracking-wide
        "
                  >
                    Estimated EMI
                  </p>

                  <h3
                    className="
          text-4xl
          font-bold
          mt-2
          leading-none
        "
                  >
                    ₹
                    {Math.round(
                      price / 60
                    ).toLocaleString()}

                    <span
                      className="
            text-lg
            font-normal
            text-gray-300
            ml-1
          "
                    >
                      /month
                    </span>
                  </h3>
                </div>

                {/* BADGE */}
                <div
                  className="
        px-3 py-1.5
        rounded-full
        bg-green-500/20
        text-green-300
        text-xs
        font-semibold
        border border-green-500/30
      "
                >
                  Easy Finance
                </div>
              </div>

              {/* INFO */}
              <div
                className="
      mt-5
      grid
      grid-cols-2
      gap-4
    "
              >

                {/* DOWNPAYMENT */}
                <div
                  className="
        rounded-2xl
        bg-white/5
        border border-white/10
        p-4
      "
                >
                  <p
                    className="
          text-xs
          text-gray-400
          uppercase
        "
                  >
                    Down Payment
                  </p>

                  <h4
                    className="
          text-xl
          font-bold
          mt-1
        "
                  >
                    ₹
                    {Math.round(
                      price * 0.2
                    ).toLocaleString()}
                  </h4>

                  <p
                    className="
          text-xs
          text-gray-500
          mt-1
        "
                  >
                    Approx 20% upfront
                  </p>
                </div>

                {/* TENURE */}
                <div
                  className="
        rounded-2xl
        bg-white/5
        border border-white/10
        p-4
      "
                >
                  <p
                    className="
          text-xs
          text-gray-400
          uppercase
        "
                  >
                    Loan Tenure
                  </p>

                  <h4
                    className="
          text-xl
          font-bold
          mt-1
        "
                  >
                    5 Years
                  </h4>

                  <p
                    className="
          text-xs
          text-gray-500
          mt-1
        "
                  >
                    Flexible EMI plans
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <p
                className="
      text-xs
      text-gray-500
      mt-5
      leading-5
    "
              >
                EMI is indicative and may vary
                based on bank approval,
                interest rate, and eligibility.
              </p>
            </div>
            <h3 className="text-3xl font-bold mt-1">
              ₹{Math.round(price / 60).toLocaleString()}
              <span className="text-base font-normal text-gray-300">
                /month
              </span>
            </h3>

            <p className="text-sm text-gray-400 mt-2">
              Approx for 5 years loan tenure
            </p>

          </div>


        </div>

      </section>

      {/* ================= SIMILAR ================= */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Similar Cars</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {similarCars.map((c) => (
              <Link
                key={c._id}
                to={`/car/${c._id}`}
                className="rounded-2xl overflow-hidden border bg-white hover:shadow-xl transition"
              >
                <img
                  src={c.images?.[0] || PLACEHOLDER}
                  className="w-full h-56 object-cover"
                />

                <div className="p-5 space-y-2">
                  <h3 className="font-semibold text-lg">
                    {c.brand} {c.variant}
                  </h3>

                  <p className="font-bold text-red-500">
                    ₹{(c.adminSellingPrice || c.sellerPrice)?.toLocaleString()}
                  </p>

                  <p className="text-sm text-gray-500">
                    {c.year} • {c.kmDriven} km • {c.fuelType}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

/* ================= SPEC COMPONENT ================= */

const Spec = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div className="flex gap-3 items-center border bg-white rounded-xl p-4 shadow-sm">
    <div className="text-red-600">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value ?? "N/A"}</p>
    </div>
  </div>
);

export default CarDetails;
