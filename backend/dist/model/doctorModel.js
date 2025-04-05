"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const transactionSchema = new mongoose_1.Schema({
    amount: { type: Number, required: true },
    transactionType: { type: String, enum: ["credit", "debit"], required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
});
const doctorSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    image: { type: String },
    googleId: { type: String },
    hospital: { type: String },
    degree: { type: String },
    speciality: { type: mongoose_1.Schema.Types.ObjectId, ref: "Service" },
    experience: { type: String },
    country: { type: String },
    achievements: { type: String },
    certificate: { type: [String] },
    fees: { type: Number },
    isDoctor: { type: Boolean, default: false },
    docStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    rejectionReason: { type: String },
    about: { type: String },
    wallet: {
        balance: { type: Number, default: 0 },
        transactions: [transactionSchema],
    },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
}, { timestamps: true });
const doctorModel = (0, mongoose_1.model)("Doctor", doctorSchema);
exports.default = doctorModel;
