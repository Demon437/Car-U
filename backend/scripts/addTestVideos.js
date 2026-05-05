const mongoose = require("mongoose");
const Car = require("../src/models/Car");

// ✅ TEST VIDEO URLs (using placeholder or real video CDN)
const TEST_VIDEOS = [
    "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4",
];

async function addTestVideos() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/car-dealership");
        console.log("✅ Connected to MongoDB");

        // Find all LIVE cars
        const cars = await Car.find({ status: "LIVE" });
        console.log(`📍 Found ${cars.length} LIVE cars`);

        if (cars.length === 0) {
            console.log("❌ No LIVE cars found");
            process.exit(1);
        }

        // Add test videos to all cars
        let updated = 0;
        for (const car of cars) {
            // Add videos to the car
            car.car.videos = TEST_VIDEOS;
            await car.save();
            updated++;
            console.log(`✅ Updated car ${car._id} - ${car.car?.brand} ${car.car?.variant}`);
        }

        console.log(`\n✅ Successfully updated ${updated} cars with test videos`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

addTestVideos();
