"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const couponSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    usedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
couponSchema.path("expirationDate").validate(function (value) {
    return value > this.startDate;
}, "Expiration date must be after the start date.");
couponSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 });
const CouponModel = (0, mongoose_1.model)("Coupon", couponSchema);
exports.default = CouponModel;
