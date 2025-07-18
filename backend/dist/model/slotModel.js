"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const scheduleSchema = new mongoose_1.Schema({
    doctor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
    recurrenceRule: {
        type: String,
        default: null,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    defaultSlotDuration: {
        type: Number,
        required: true,
    },
    breaks: [
        {
            startTime: { type: Date, required: true },
            endTime: { type: Date, required: true },
        },
    ],
    exceptions: [
        {
            date: { type: Date, required: true },
            isOff: { type: Boolean, default: false },
            overrideSlotDuration: { type: Number },
        },
    ],
}, { timestamps: true });
const scheduleModel = (0, mongoose_1.model)("Schedule", scheduleSchema);
exports.default = scheduleModel;
