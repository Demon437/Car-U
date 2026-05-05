const Car = require("../models/Car");

class CarService {
  // =======================================
  // GET ALL CARS FOR BUYER
  // =======================================
  static async getAllCarsForBuyer() {
    try {
      console.log("📍 [CarService] Getting all cars for buyer");
      
const cars = await Car.find()
  .select("car.videos car.images car.brand car.model adminSellingPrice status createdAt _id")
  .sort({ createdAt: -1 });

      console.log("✅ [CarService] Total cars found:", cars.length);
      return cars;
    } catch (error) {
      console.error("❌ [CarService] Error getting all cars:", error.message);
      throw error;
    }
  }

  // =======================================
  // BUILD FILTER QUERY
  // =======================================
  static buildFilterQuery(queryParams) {
  const {
    brand,
    model,
    year,
    variant,
    transmission,
    fuelType,
    search,
  } = queryParams;

  let filter = {};
  let andConditions = [];

  console.log("🔍 Building filter with:", queryParams);

  // 🔧 Helper for strong regex (start match)
  const createRegex = (value) => {
    return new RegExp(`^${value.trim()}`, "i");
  };


  // ===============================
  // ✅ INDIVIDUAL FILTERS (AND)
  // ===============================
  if (brand && brand.trim() !== "") {
    andConditions.push({ "car.brand": createRegex(brand) });
  }

  if (model && model.trim() !== "") {
    andConditions.push({ "car.model": createRegex(model) });
  }

  if (variant && variant.trim() !== "") {
    andConditions.push({ "car.variant": createRegex(variant) });
  }

  if (transmission && transmission.trim() !== "") {
    andConditions.push({ "car.transmission": createRegex(transmission) });
  }

  if (fuelType && fuelType.trim() !== "") {
    andConditions.push({ "car.fuelType": createRegex(fuelType) });
  }

  if (year && year.toString().trim() !== "") {
    andConditions.push({ "car.year": Number(year) });
  }

  // ===============================
  // ✅ SMART SEARCH (MULTI WORD)
  // ===============================
  if (search && search.trim() !== "") {
    const words = search.trim().split(/\s+/);

    words.forEach((word) => {
      // 👉 detect year automatically
      if (!isNaN(word) && word.length === 4) {
        andConditions.push({ "car.year": Number(word) });
        return;
      }

      // 👉 detect fuel
      if (["diesel", "petrol", "electric", "cng"].includes(word.toLowerCase())) {
        andConditions.push({ "car.fuelType": createRegex(word) });
        return;
      }

      // 👉 detect transmission
      if (["automatic", "manual"].includes(word.toLowerCase())) {
        andConditions.push({ "car.transmission": createRegex(word) });
        return;
      }

      // 👉 general match (OR)
      andConditions.push({
        $or: [
          { "car.brand": createRegex(word) },
          { "car.model": createRegex(word) },
          { "car.variant": createRegex(word) },
        ],
      });
    });
  }

  // ===============================
  // ✅ FINAL COMBINE
  // ===============================

  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  console.log("🚀 Final Filter:", JSON.stringify(filter, null, 2));
  return filter;
}

  // =======================================
  // GET FILTERED CARS
  // =======================================
  static async getFilteredCars(queryParams) {
    try {
      console.log("🔍 [CarService] Getting filtered cars");

      const filter = this.buildFilterQuery(queryParams);

      const cars = await Car.find(filter)
        .populate("seller", "name email phone")
        .sort({ createdAt: -1 });

      console.log("📤 [CarService] Found", cars.length, "filtered cars");
      return { data: cars, count: cars.length };
    } catch (error) {
      console.error("❌ [CarService] Error getting filtered cars:", error.message);
      throw error;
    }
  }

  // =======================================
  // GET CAR BY ID
  // =======================================
  static async getCarById(carId) {
    try {
      console.log("🔍 [CarService] Getting car by ID:", carId);

      const car = await Car.findById(carId)
        .populate("seller", "name email phone");

      if (!car) {
        throw new Error("Car not found");
      }

      console.log("✅ [CarService] Car found successfully");
      return car;
    } catch (error) {
      console.error("❌ [CarService] Error getting car by ID:", error.message);
      throw error;
    }
  }

  // =======================================
  // SEARCH CARS (SMART SEARCH)
  // =======================================
  static async searchCars(searchTerm) {
    try {
      console.log("🔍 [CarService] Smart search for:", searchTerm);

      if (!searchTerm || searchTerm.trim() === "") {
        return this.getAllCarsForBuyer();
      }

      const searchRegex = { $regex: searchTerm, $options: "i" };
      const filter = {
        $or: [
          { "car.brand": searchRegex },
          { "car.model": searchRegex },
          { "car.variant": searchRegex },
          { "car.fuelType": searchRegex },
          { "car.transmission": searchRegex },
          { "car.year": searchRegex },
          { "car.condition": searchRegex },
          { "car.registrationNumber": searchRegex }
        ]
      };

      const cars = await Car.find(filter)
        .populate("seller", "name email phone")
        .sort({ createdAt: -1 });

      console.log("📤 [CarService] Found", cars.length, "cars with smart search");
      return { data: cars, count: cars.length };
    } catch (error) {
      console.error("❌ [CarService] Error in smart search:", error.message);
      throw error;
    }
  }
}

module.exports = CarService;
