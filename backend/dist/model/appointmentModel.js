"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AppointmentSchema = new mongoose_1.Schema({
    appointmentId: {
        type: String,
        required: true,
    },
    patientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    doctorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: [
            "pending",
            "accepted",
            "completed",
            "cancelled",
            "failed",
        ],
        required: true,
    },
    reason: {
        type: String
    },
    fees: {
        type: Number,
    },
    paymentMethod: {
        type: String,
        enum: ["razorpay", "wallet"],
    },
    paymentStatus: {
        type: String,
        enum: [
            "payment pending",
            "payment completed",
            "payment failed",
            "anonymous",
        ],
    },
    razorpay_order_id: {
        type: String,
    },
    razorpay_payment_id: {
        type: String,
    },
    razorpay_signature: {
        type: String,
    },
    prescription: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Prescription",
        default: null,
    },
    review: {
        rating: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            default: "",
        },
    },
    medicalRecords: [
        {
            recordDate: { type: Date, default: Date.now },
            condition: { type: String, required: true },
            symptoms: { type: [String], default: [] },
            medications: { type: [String], default: [] },
            notes: { type: String, default: "" },
        },
    ],
    couponCode: {
        type: String,
        required: false,
    },
    couponDiscount: {
        type: String,
        required: false,
    },
    isApplied: {
        type: Boolean,
        default: false,
        required: false,
    },
}, { timestamps: true });
const AppointmentModel = (0, mongoose_1.model)("Appointment", AppointmentSchema);
exports.default = AppointmentModel;
