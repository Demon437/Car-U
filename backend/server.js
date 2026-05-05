const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
require("dotenv").config();
const userRoutes = require("./src/routes/userRoutes");

/* ================= APP INIT ================= */
const app = express();

/* ================= DB ================= */
connectDB();

/* ================= MIDDLEWARE ================= */

// ✅ SIMPLE & WORKING CORS (NO BUGS)
app.use(cors({
  origin: [
    "http://localhost:8081",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://car-management-demo.netlify.app",
    "https://car.webixinfotech.in"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));


// ✅ Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ================= ROUTES ================= */
const sellRoutes = require("./src/routes/sellRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const carRoutes = require("./src/routes/carRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");

app.use("/api/sell", sellRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/users", userRoutes);

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// 🔥 Timeout fix
server.setTimeout(5 * 60 * 1000);