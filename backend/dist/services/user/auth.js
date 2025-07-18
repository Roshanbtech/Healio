"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailConfig_1 = __importDefault(require("../../config/emailConfig"));
const firebase_1 = require("../../config/firebase");
const redisClient_1 = require("../../config/redisClient");
// import { getUrl } from "../../helper/getUrl";
class AuthService {
    constructor(AuthRepository) {
        this.userData = null;
        this.AuthRepository = AuthRepository;
    }
    async signup(userData) {
        try {
            console.log(" Signup process started...");
            const { email, otp } = userData;
            const storedOtp = await (0, redisClient_1.getOtpByEmail)(email);
            console.log(`Retrieved OTP for ${email}:`, storedOtp);
            if (!storedOtp) {
                return {
                    status: false,
                    message: "OTP expired or invalid. Request a new one.",
                };
            }
            if (storedOtp !== otp) {
                return { status: false, message: "Incorrect OTP. Please try again." };
            }
            let saltRounds = 10;
            const hashedPassword = await bcrypt_1.default.hash(userData.password, saltRounds);
            const userId = (0, uuid_1.v4)();
            this.userData = {
                userId: userId,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password: hashedPassword,
                isVerified: true,
            };
            await this.AuthRepository.createUser(this.userData);
            await (0, redisClient_1.otpSetData)(email, "");
            return { status: true, message: "User created successfully" };
        }
        catch (error) {
            console.log(" Error in creating new User", error);
            return { status: false, message: "Error while creating user" };
        }
    }
    async sendOtp(email) {
        try {
            const response = await this.AuthRepository.existUser(email);
            if (response.existEmail) {
                return { status: false, message: "Email already in use" };
            }
            const otp = await (0, redisClient_1.resendOtpUtil)(email);
            console.log(`Generated OTP: ${otp}`);
            if (!otp) {
                return { status: false, message: "Failed to generate OTP. Try again." };
            }
            const subject = "OTP Verification";
            const text = `Hello,\n\nYour OTP is ${otp}. It is valid for 1 minute.\n\nThank you.`;
            await (0, emailConfig_1.default)(email, subject, text);
            return { status: true, message: "OTP sent successfully" };
        }
        catch (error) {
            console.error("Error sending OTP:", error);
            return { status: false, message: "Error while sending OTP" };
        }
    }
    async verifyOtp(email, otp) {
        try {
            const storedOtp = await (0, redisClient_1.getOtpByEmail)(email);
            console.log(` Verifying OTP for ${email}: Stored: ${storedOtp}, Entered: ${otp}`);
            if (!storedOtp) {
                return {
                    status: false,
                    message: "OTP expired. Please request a new one.",
                };
            }
            if (storedOtp !== otp) {
                return { status: false, message: "Incorrect OTP. Please try again." };
            }
            // Remove OTP after successful verification
            await (0, redisClient_1.otpSetData)(email, "");
            return { status: true, message: "OTP verified successfully" };
        }
        catch (error) {
            console.error(" Error verifying OTP:", error);
            return { status: false, message: "Error while verifying OTP" };
        }
    }
    async resendOtp(email) {
        try {
            const otp = await (0, redisClient_1.resendOtp)(email);
            if (!otp) {
                return { status: false, message: "Failed to generate OTP. Try again." };
            }
            const subject = "OTP Verification - Resend";
            const text = `Hello,\n\nYour new OTP is ${otp}. It is valid for 1 minute.\n\nThank you.`;
            await (0, emailConfig_1.default)(email, subject, text);
            return { status: true, message: "OTP resent successfully" };
        }
        catch (error) {
            console.error(" Error resending OTP:", error);
            return { status: false, message: "Error while resending OTP" };
        }
    }
    async sendForgotPasswordOtp(email) {
        const userExist = await this.AuthRepository.existUser(email);
        if (!userExist.existEmail) {
            throw new Error("Email not found");
        }
        const otp = await (0, redisClient_1.resendOtpUtil)(email);
        if (!otp) {
            throw new Error("OTP not sent");
        }
        const subject = "OTP Verification";
        const text = `Hello,\n\nYour OTP for password reset is ${otp}. It is valid for 1 minute.\n\nThank you.`;
        await (0, emailConfig_1.default)(email, subject, text);
        return { status: true, message: "OTP sent successfully" };
    }
    async verifyForgotPasswordOtp(email, otp) {
        const storedOtp = await (0, redisClient_1.getOtpByEmail)(email);
        if (!storedOtp) {
            throw new Error("OTP expired or invalid");
        }
        if (storedOtp !== otp) {
            throw new Error("Incorrect OTP");
        }
        await (0, redisClient_1.otpSetData)(email, "");
        return { status: true, message: "OTP verified successfully" };
    }
    async resetPassword(email, password) {
        const userExist = await this.AuthRepository.existUser(email);
        console.log("User exist:", userExist);
        if (!userExist.existEmail) {
            throw new Error("Email not found");
        }
        console.log("Password:", password, email);
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        console.log("Hashed password:", hashedPassword, password);
        const response = await this.AuthRepository.updatePassword(email, hashedPassword);
        console.log("Response:", response);
        if (!response || response.modifiedCount === 0) {
            throw new Error("Password not updated");
        }
        return { status: true, message: "Password updated successfully" };
    }
    async login(userData) {
        try {
            const { email, password } = userData;
            const check = await this.AuthRepository.existUser(email);
            if (!check) {
                throw new Error("User not found.");
            }
            const user = await this.AuthRepository.userCheck(email);
            if (!user) {
                throw new Error("User not found.");
            }
            if (user.isBlocked) {
                throw new Error("User is blocked. Ask admin for access.");
            }
            // if(user?.image){
            //   user.image = await getUrl(user.image);
            // }
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid password.");
            }
            const accessToken = jsonwebtoken_1.default.sign({ email, role: "user" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
            const refreshToken = jsonwebtoken_1.default.sign({ email, role: "user" }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
            console.log("Role assigned in token:", "user");
            return { accessToken, refreshToken, user };
        }
        catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }
    async handleGoogleLogin(idToken) {
        try {
            const decodedToken = await firebase_1.admin.auth().verifyIdToken(idToken);
            console.log("Decoded Token:", decodedToken);
            const { email, name, uid, picture } = decodedToken;
            const userId = (0, uuid_1.v4)();
            const userData = {
                name,
                email,
                googleId: uid,
                isVerified: true,
                userId: userId,
            };
            if (picture) {
                userData.image = picture;
            }
            const { user, isNewUser } = await this.AuthRepository.handleGoogleLogin(userData);
            const accessToken = jsonwebtoken_1.default.sign({ email, role: "user" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
            const refreshToken = jsonwebtoken_1.default.sign({ email, role: "user" }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
            return { user, isNewUser, accessToken, refreshToken };
        }
        catch (error) {
            console.error("Google login error:", error);
            throw new Error("Error handling Google login");
        }
    }
    async logout(refreshToken) {
        try {
            console.log("Logout process started...");
            return await this.AuthRepository.logout(refreshToken);
        }
        catch (error) {
            console.error("Logout error:", error);
            return { error: "Internal server error." };
        }
    }
}
exports.AuthService = AuthService;
