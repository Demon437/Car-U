require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../src/models/Admin");

mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("super123", 10);

  await Admin.create({
    name: "Admin",
    email: "superadmin@cars.com",
    password: hashedPassword,
    role: "admin",
  });

  console.log("✅ Admin reset successfully");
  console.log("Email: superadmin@cars.com");
  console.log("Password: super123");

  process.exit();
}

createAdmin();
