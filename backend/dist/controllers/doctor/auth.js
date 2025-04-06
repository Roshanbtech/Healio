"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const httpStatusCode_1 = __importDefault(require("../../enums/httpStatusCode"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AuthController {
    constructor(authServiceInstance) {
        this.authService = authServiceInstance;
    }
    async createDoctor(req, res) {
        try {
            console.log("create doctor auth");
            const data = req.body;
            console.log(data, "docdata");
            const response = await this.authService.signup(data);
            if ("error" in response) {
                res.status(httpStatusCode_1.default.Unauthorized).json({
                    status: false,
                    message: response.error,
                });
                return;
            }
            res.status(httpStatusCode_1.default.OK).json({ status: true, response });
        }
        catch (error) {
            if (error.message === "Email already in use") {
                res
                    .status(httpStatusCode_1.default.Conflict)
                    .json({ message: "Email already in use" });
            }
            else if (error.message === "Phone already in use") {
                res
                    .status(httpStatusCode_1.default.Conflict)
                    .json({ message: "Phone number already in use" });
            }
            else if (error.message === "Otp not send") {
                res
                    .status(httpStatusCode_1.default.InternalServerError)
                    .json({ message: "OTP not sent" });
            }
            else {
                res
                    .status(httpStatusCode_1.default.InternalServerError)
                    .json({ message: "Something went wrong, please try again later" });
            }
        }
    }
    async sendOtp(req, res) {
        try {
            const { email } = req.body;
            const response = await this.authService.sendOtp(email);
            res.status(httpStatusCode_1.default.OK).json({ status: true, response });
        }
        catch (error) {
            if (error.message === "Email not found") {
                res
                    .status(httpStatusCode_1.default.NotFound)
                    .json({ message: "Email not found" });
            }
            else if (error.message === "Otp not send") {
                res
                    .status(httpStatusCode_1.default.InternalServerError)
                    .json({ message: "OTP not sent" });
            }
            else {
                res
                    .status(httpStatusCode_1.default.InternalServerError)
                    .json({ message: "Something went wrong, please try again later" });
            }
        }
    }
    async resendOtp(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res
                    .status(httpStatusCode_1.default.BadRequest)
                    .json({ message: "Email is required" });
                return;
            }
            const response = await this.authService.resendOtp(email);
            res.status(httpStatusCode_1.default.OK).json(response);
        }
        catch (error) {
            res
                .status(httpStatusCode_1.default.InternalServerError)
                .json({ message: "Something went wrong" });
        }
    }
    async handleGoogleLogin(req, res) {
        try {
            const { idToken } = req.body;
            console.log("Received ID Token:", idToken);
            const { doctor, isNewDoctor, accessToken, refreshToken } = await this.authService.handleGoogleLogin(idToken);
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                path: "/auth/refresh",
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            });
            return res
                .status(isNewDoctor ? httpStatusCode_1.default.Created : httpStatusCode_1.default.Accepted)
                .json({
                message: isNewDoctor
                    ? "Doctor created successfully"
                    : "Doctor login successful",
                accessToken,
                doctor,
            });
        }
        catch (error) {
            console.error("Google Login Error:", error);
            if (!res.headersSent) {
                return res
                    .status(httpStatusCode_1.default.InternalServerError)
                    .json({ message: "Authentication failed" });
            }
        }
    }
    async sendForgotPasswordOtp(req, res) {
        try {
            const { email } = req.body;
            const result = await this.authService.sendForgotPasswordOtp(email);
            return res.status(200).json(result);
        }
        catch (error) {
            if (error.message === "Email not found") {
                return res.status(404).json({ message: "Email not found" });
            }
            else if (error.message === "OTP not sent") {
                return res.status(500).json({ message: "OTP not sent" });
            }
            else {
                return res
                    .status(500)
                    .json({ message: "Something went wrong, please try again later" });
            }
        }
    }
    async verifyForgotPasswordOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const result = await this.authService.verifyForgotPasswordOtp(email, otp);
            return res.status(200).json(result);
        }
        catch (error) {
            if (error.message === "Email not found") {
                return res.status(404).json({ message: "Email not found" });
            }
            else if (error.message === "OTP expired or invalid" ||
                error.message === "Incorrect OTP") {
                return res.status(400).json({ message: error.message });
            }
            else {
                return res
                    .status(500)
                    .json({ message: "Something went wrong, please try again later" });
            }
        }
    }
    async resetPassword(req, res) {
        try {
            const { email, values } = req.body;
            const newPassword = values.newPassword;
            console.log(email, newPassword, "reset password");
            const result = await this.authService.resetPassword(email, newPassword);
            console.log(result, "reset password");
            return res.status(200).json(result);
        }
        catch (error) {
            if (error.message === "Email not found") {
                return res.status(404).json({ message: "Email not found" });
            }
            else if (error.message === "Password not updated") {
                return res.status(500).json({ message: "Password not updated" });
            }
            else {
                return res
                    .status(500)
                    .json({ message: "Something went wrong, please try again later" });
            }
        }
    }
    async loginDoctor(req, res) {
        try {
            const data = req.body;
            const loginResponse = await this.authService.login(data);
            if ("error" in loginResponse) {
                return res.status(httpStatusCode_1.default.Unauthorized).json({
                    status: false,
                    message: loginResponse.error,
                });
            }
            const { accessToken, refreshToken, doctorId } = loginResponse;
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true, // Set to false for local testing
                sameSite: "strict",
                path: "/auth/refresh", // Refresh token endpoint
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            });
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Doctor logged in successfully",
                accessToken,
                doctorId,
            });
        }
        catch (error) {
            console.error(error);
            if (!res.headersSent) {
                return res
                    .status(httpStatusCode_1.default.InternalServerError)
                    .json({ message: "Authentication failed" });
            }
        }
    }
    async logoutDoctor(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            await this.authService.logout(refreshToken);
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            });
            res.status(httpStatusCode_1.default.OK).json({ status: true, message: "Logout" });
        }
        catch (error) {
            console.log("error in doctor logout", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
}
exports.AuthController = AuthController;
