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

        /* ================= SELLER SETTLEMENT ================= */
        sellerSettlement: {
            onlinePayment: {
                paymentMode: String,
                bankName: String,
                transactionId: String,
                amount: Number,
                paymentDate: Date,
                notes: String,
            },

            cashPayment: {
                amount: Number,
                receivedBy: String,
                paymentDate: Date,
                notes: String,
            },

            totalPurchaseAmount: Number,
            totalPaidAmount: Number,
            dueAmount: Number,
        },

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
            coverImage: {
                type: String,
                default: "",
            },
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
                default: "CASH",
            },

            /* ===== TOTAL AMOUNTS ===== */
            cashAmount: {
                type: Number,
                default: 0,
            },
            upiAmount: {
                type: Number,
                default: 0,
            },
            bankAmount: {
                type: Number,
                default: 0,
            },
            loanAmount: {
                type: Number,
                default: 0,
            },
            blackAmount: {
                type: Number,
                default: 0,
            },

            /* ===== PAID AMOUNTS ===== */
            cashPaidAmount: {
                type: Number,
                default: 0,
            },
            upiPaidAmount: {
                type: Number,
                default: 0,
            },
            bankPaidAmount: {
                type: Number,
                default: 0,
            },
            loanPaidAmount: {
                type: Number,
                default: 0,
            },
            blackPaidAmount: {
                type: Number,
                default: 0,
            },

            /* ===== ADDITIONAL INFO ===== */
            financeCompany: {
                type: String,
                default: "",
            },

            upiTransactionId: {
                type: String,
                default: "",
            },

            bankTransactionId: {
                type: String,
                default: "",
            },

            notes: {
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
