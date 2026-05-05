const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema(
    {
        sellRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SellRequest",
            required: true,
        },

        source: {
            type: String,
            enum: ["ONLINE", "OFFLINE"],
        },

        /* ================= SELLER ================= */
        seller: {
            type: {
                type: String,
                enum: ["individual", "dealer", "platform"],
            },
            name: String,
            phone: String,
            altPhone: String,
            email: String,
            city: String,
            area: String,
        },

        /* ================= ADMIN EXPENSES ================= */
        adminExpenses: [
            {
                label: String,
                amount: Number,
            },
        ],

        /* ================= SELLER DOCUMENTS ================= */
        sellerDocuments: [
            {
                label: String,
                fileUrls: [String],
            },
        ],

        /* ================= CAR DETAILS ================= */
        car: {
            brand: String,
            model: String,
            year: Number,
            registrationNumber: String,
            variant: String,
            fuelType: String,
            transmission: String,
            kmDriven: Number,
            condition: String,
            images: [String],
            videos: [String],

            /* 🔥 FEATURES */
            features: {
                entertainment: [{
                    type: String,
                    enum: ["bluetooth", "radio", "speakersFront"]
                }],
                safety: [{
                    type: String,
                    enum: ["centralLocking", "abs", "driverAirbag", "antiTheftDevice", "keylessEntry", "childSafetyLocks"]
                }],
                comfort: [{
                    type: String,
                    enum: ["airConditioner", "powerSteering", "powerWindowsFront", "powerWindowsRear", "lowFuelWarning"]
                }],
                interiorExterior: [{
                    type: String,
                    enum: ["heater", "steeringAdjustment", "frontFogLights", "rearDefogger", "alloyWheels"]
                }],

                // 🔥 NEW FIELD (CUSTOM FEATURES)
                custom: [{
                    type: String
                }]
            }

        },

        /* ================= PRICING ================= */
        sellerPrice: Number,
        adminSellingPrice: Number,

        /* ================= RC DETAILS ================= */
        rcDetails: {
            rcOwner: String,
            rcOwnerName: String,
            rcImage: String,
        },

        status: {
            type: String,
            enum: ["LIVE", "SOLD"],
            default: "LIVE",
        },

        /* ================= BUYER ================= */
        buyer: {
            name: String,
            phone: String,
            email: String,
            city: String,
        },

        buyerPrice: Number,
        soldAt: Date,

        /* ================= BUYER DOCUMENTS ================= */
        buyerKyc: {
            aadhaar: [String],
            pan: [String],
            photo: [String],
        },

        buyerRto: {
            form29: [String],
            form30: [String],
            form28: [String],
            form35: [String],
        },

        /* ================= SALE FINANCIALS ================= */
        sale: {
            totalAmount: Number,      // sold price
            paidAmount: Number,       // total paid till now (cash + loan disbursed)
            remainingAmount: Number,  // remaining balance
        },

        /* ================= PAYMENT SNAPSHOT ================= */
        payment: {
            type: {
                type: String,
                enum: ["CASH", "UPI", "BANK", "LOAN"],
                default: "CASH",
            },

            cashPaid: {
                type: Number,
                default: 0,
            },

            cashPaymentMode: {
                type: String,
                enum: ["CASH", "UPI", "BANK"],
            },

            loanTotal: {
                type: Number,
                default: 0,
            },

            loanPaidNow: {
                type: Number,
                default: 0,
            },

            financeCompany: {
                type: String,
                default: "",
            },
        },


        /* ================= EXTRA ADMIN EXPENSES ================= */
        extraAdminExpenses: [
            {
                label: String,
                amount: Number,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Car", CarSchema);
