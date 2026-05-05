const mongoose = require("mongoose");
require("dotenv").config();

const Car = require("../src/models/Car");

const fixHistoryData = async () => {
    try {
        console.log("🔧 Starting data fix for SOLD cars...");

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Find all SOLD cars without source field
        const carsToFix = await Car.find({
            status: "SOLD",
            $or: [
                { source: null },
                { source: undefined }
            ]
        });

        console.log(`📊 Found ${carsToFix.length} cars without source field`);

        // Update each car
        for (let car of carsToFix) {
            car.source = "ONLINE"; // Default to ONLINE for old records
            await car.save();
            console.log(`✅ Fixed car ${car._id}`);
        }

        console.log("🎉 All cars fixed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

fixHistoryData();
