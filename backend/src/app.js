const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const carRoutes = require("./routes/car.routes");


const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
const sellRoutes = require("./routes/sell.routes");
const uploadRoutes = require("./routes/upload.routes");
app.use("/api", carRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Car Website Backend API Running 🚗");
});

// ROUTES
app.use("/api/auth", authRoutes);    // Admin login
app.use("/api/admin", adminRoutes);  // Admin protected
app.use("/api/cars", carRoutes);     // Public cars

// Sell routes
app.use("/api/sell", sellRoutes); // PUBLIC

// Upload routes
app.use("/api/upload", uploadRoutes);



module.exports = app;
