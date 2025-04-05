"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const transactionSchema = new mongoose_1.Schema({
    amount: { type: Number, required: true },
    transactionType: { type: String, enum: ["credit", "debit"], required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
});
const userSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    },
    lastLogin: {
        type: Date,
    },
    DOB: {
        type: Date,
        default: null,
    },
    age: {
        type: Number,
        default: null,
    },
    address: {
        type: String,
        default: null,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: null,
    },
    image: {
        type: String,
        required: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    googleId: {
        type: String,
    },
    wallet: {
        balance: { type: Number, default: 0 },
        transactions: [transactionSchema],
    },
}, { timestamps: true });
const userModel = (0, mongoose_1.model)("User", userSchema);
exports.default = userModel;
