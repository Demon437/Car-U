const Car = require("../models/Car");
const CarService = require("../services/carService");

// =======================================
// GET /api/cars  (BUYER)
// =======================================
// controllers/carController.js
exports.getAllCarsForBuyer = async (req, res) => {
  try {
    console.log("📍 [Controller] getAllCarsForBuyer API called");
    const cars = await CarService.getAllCarsForBuyer();


    res.json(cars);
  } catch (err) {
    console.error("❌ [Controller] Error in getAllCarsForBuyer:", err.message);
    res.status(500).json({ message: "Failed to fetch cars" });
  }
};


// Filter from car 
exports.getFilteredCars = async (req, res) => {
  try {
    console.log("📍 [Controller] getFilteredCars API called");
    const result = await CarService.getFilteredCars(req.query);


    res.json(result);
  } catch (err) {
    console.error("❌ [Controller] Error in getFilteredCars:", err.message);
    res.status(500).json({ message: "Failed to fetch filtered cars" });
  }
};

// =======================================
// GET CAR BY ID
// =======================================
exports.getCarById = async (req, res) => {
  try {
    console.log("📍 [Controller] getCarById API called");

    const car = await CarService.getCarById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // ✅ FIX: Use correct nested structure
    const normalizedCar = {
      _id: car._id,

      // ===== CAR DATA =====
      brand: car.car?.brand,
      model: car.car?.model,
      variant: car.car?.variant,
      year: car.car?.year,
      fuelType: car.car?.fuelType,
      kmDriven: car.car?.kmDriven,
      registrationNumber: car.car?.registrationNumber || null,
      transmission: car.car?.transmission || null,
      condition: car.car?.condition || null,

      // ✅ IMPORTANT FIX
      images: car.car?.images || [],
      videos: car.car?.videos || [],

      features: car.car?.features || {},

      // ===== PRICE =====
      sellerPrice: car.sellerPrice,
      adminSellingPrice: car.adminSellingPrice,

      // ===== STATUS =====
      status: car.status,
      source: car.source,
      createdAt: car.createdAt,

      // ===== EXTRA =====
      seller: car.seller || {},
      rcDetails: car.rcDetails || {},
    };



    res.status(200).json(normalizedCar);
  } catch (err) {
    console.error("❌ [Controller] Error in getCarById:", err.message);

    res.status(500).json({
      message: err.message || "Failed to fetch car",
    });
  }
};

// =======================================
// SMART SEARCH CARS
// =======================================
exports.searchCars = async (req, res) => {
  try {
    console.log("� [Controller] searchCars API called");
    const { search } = req.query;
    const result = await CarService.searchCars(search);


    res.json(result);
  } catch (err) {
    console.error("❌ [Controller] Error in searchCars:", err.message);
    res.status(500).json({ message: "Failed to search cars" });
  }
};


// Pagination implement 
// Controller logic
exports.getLiveCars = async (req, res) => {
  try {
    // 1. Query Params se page aur limit lo
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9; // Ek page pe 9 cars
    const skip = (page - 1) * limit;

    // 2. Total cars count karo (Frontend ko total pages batane ke liye)
    const totalCars = await Car.countDocuments({ status: "LIVE" });

    // 3. Cars fetch karo skip aur limit ke sath
    const cars = await Car.find({ status: "LIVE" })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Nayi cars pehle

    res.json({
      data: cars,
      currentPage: page,
      totalPages: Math.ceil(totalCars / limit),
      totalCars
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================================
// FEATURED CARS
// =======================================
// =======================================
// FEATURED CARS
// =======================================
exports.getFeaturedCars = async (req, res) => {
  try {

    // ✅ FETCH ONLY LIVE CARS
    const cars = await Car.find({
      status: "LIVE",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // ✅ NORMALIZE OLD CARS
    const normalizedCars = cars.map((car) => {

      // If no cover image exists
      if (
        !car.car?.coverImage &&
        car.car?.images?.length > 0
      ) {
        car.car.coverImage =
          car.car.images[0];
      }

      return car;
    });

    console.log(
      "🔥 FEATURED COVER IMAGE:",
      normalizedCars[0]?.car?.coverImage
    );

    res.status(200).json(normalizedCars);

  } catch (err) {

    console.error(
      "❌ Featured Cars Error:",
      err
    );

    res.status(500).json({
      message: "Failed to fetch featured cars",
    });
  }
};