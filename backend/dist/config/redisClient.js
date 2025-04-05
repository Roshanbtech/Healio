"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOtp = exports.resendOtpUtil = exports.getOtpByEmail = exports.otpSetData = exports.generateOTP = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
client.on("error", (err) => {
    console.error("Redis Client Error", err);
});
client
    .connect()
    .then(() => console.log("Connected to Redis"))
    .catch((err) => console.error("Error connecting to Redis", err));
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
exports.generateOTP = generateOTP;
const otpSetData = async (email, otp) => {
    try {
        await client.del(email);
        await client.hSet(email, { otp });
        await client.expire(email, 3000);
        console.log(`OTP stored for ${email}: ${otp}`);
    }
    catch (error) {
        console.error("Error storing OTP:", error);
    }
};
exports.otpSetData = otpSetData;
const getOtpByEmail = async (email) => {
    try {
        const userData = await client.hGetAll(email);
        console.log(`Retrieved OTP for ${email}:`, userData);
        return userData.otp || null;
    }
    catch (error) {
        console.error("Error retrieving OTP:", error);
        return null;
    }
};
exports.getOtpByEmail = getOtpByEmail;
const resendOtpUtil = async (email) => {
    try {
        const newOtp = (0, exports.generateOTP)();
        await (0, exports.otpSetData)(email, newOtp);
        return newOtp;
    }
    catch (error) {
        console.error("Error resending OTP:", error);
        return null;
    }
};
exports.resendOtpUtil = resendOtpUtil;
const resendOtp = async (email) => {
    try {
        const existingOtp = await (0, exports.getOtpByEmail)(email);
        if (existingOtp) {
            console.log(`Existing OTP for ${email} is being deleted.`);
            await client.del(email);
        }
        const newOtp = (0, exports.generateOTP)();
        await (0, exports.otpSetData)(email, newOtp);
        console.log(`New OTP generated for ${email}: ${newOtp}`);
        return newOtp;
    }
    catch (error) {
        console.error("Error resending OTP:", error);
        return null;
    }
};
exports.resendOtp = resendOtp;
