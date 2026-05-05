const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const carController = require("../controllers/carContoller");

// const router = express.Router();

// BUYER – SMART SEARCH CARS  
router.get("/search", carController.searchCars);

// BUYER – FILTERED CARS  
router.get("/filter", carController.getFilteredCars);

// BUYER – ALL CARS
router.get("/", carController.getAllCarsForBuyer);

// BUYER – SINGLE CAR
router.get("/:id", adminController.getCarById);

module.exports = router;
