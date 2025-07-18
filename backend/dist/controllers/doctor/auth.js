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
            const data = req.body;
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
            if (error instanceof Error) {
                if (error.message === "Email already in use") {
                    res.status(httpStatusCode_1.default.Conflict).json({ message: "Email already in use" });
                }
                else if (error.message === "Phone already in use") {
                    res.status(httpStatusCode_1.default.Conflict).json({ message: "Phone number already in use" });
                }
                else if (error.message === "Otp not send") {
                    res.status(httpStatusCode_1.default.InternalServerError).json({ message: "OTP not sent" });
                }
                else {
                    res.status(httpStatusCode_1.default.InternalServerError).json({
                        message: "Something went wrong, please try again later",
                    });
                }
            }
            else {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    message: "An unexpected error occurred",
                });
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
            if (error instanceof Error) {
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
            else {
                res
                    .status(httpStatusCode_1.default.InternalServerError)
                    .json({ message: "An unexpected error occurred" });
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
            res
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
            if (!res.headersSent) {
                if (error instanceof Error) {
                    res
                        .status(httpStatusCode_1.default.InternalServerError)
                        .json({ message: error.message });
                }
                else {
                    res
                        .status(httpStatusCode_1.default.InternalServerError)
                        .json({ message: "Authentication failed" });
                }
            }
        }
    }
    async sendForgotPasswordOtp(req, res) {
        try {
            const { email } = req.body;
            const result = await this.authService.sendForgotPasswordOtp(email);
            res.status(httpStatusCode_1.default.OK).json(result);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Email not found") {
                    res.status(httpStatusCode_1.default.NotFound).json({ message: "Email not found" });
                }
                else if (error.message === "OTP not sent") {
                    res.status(httpStatusCode_1.default.InternalServerError).json({ message: "OTP not sent" });
                }
                else {
                    res.status(httpStatusCode_1.default.InternalServerError).json({
                        message: "Something went wrong, please try again later",
                    });
                }
            }
            else {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    message: "An unexpected error occurred",
                });
            }
        }
    }
    async verifyForgotPasswordOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const result = await this.authService.verifyForgotPasswordOtp(email, otp);
            res.status(httpStatusCode_1.default.OK).json(result);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Email not found") {
                    res.status(httpStatusCode_1.default.NotFound).json({ message: "Email not found" });
                }
                else if (error.message === "OTP expired or invalid" ||
                    error.message === "Incorrect OTP") {
                    res.status(httpStatusCode_1.default.BadRequest).json({ message: error.message });
                }
                else {
                    res.status(httpStatusCode_1.default.InternalServerError).json({
                        message: "Something went wrong, please try again later",
                    });
                }
            }
            else {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    message: "An unexpected error occurred",
                });
            }
        }
    }
    async resetPassword(req, res) {
        try {
            const { email, values } = req.body;
            const newPassword = values.newPassword;
            const result = await this.authService.resetPassword(email, newPassword);
            res.status(httpStatusCode_1.default.OK).json(result);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Email not found") {
                    res.status(httpStatusCode_1.default.NotFound).json({ message: "Email not found" });
                }
                else if (error.message === "Password not updated") {
                    res.status(httpStatusCode_1.default.InternalServerError).json({ message: "Password not updated" });
                }
                else {
                    res.status(httpStatusCode_1.default.InternalServerError).json({
                        message: "Something went wrong, please try again later",
                    });
                }
            }
            else {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    message: "An unexpected error occurred",
                });
            }
        }
    }
    async loginDoctor(req, res) {
        try {
            const data = req.body;
            const loginResponse = await this.authService.login(data);
            if ("error" in loginResponse) {
                res.status(httpStatusCode_1.default.Unauthorized).json({
                    status: false,
                    message: loginResponse.error,
                });
                return;
            }
            const { accessToken, refreshToken, doctorId } = loginResponse;
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                path: "/auth/refresh",
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
            const errorMessage = error instanceof Error ? error.message : "Authentication failed";
            if (!res.headersSent) {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    message: errorMessage,
                });
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
            const errorMessage = error instanceof Error ? error.message : "Something went wrong";
            if (!res.headersSent) {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    status: false,
                    message: errorMessage || "Something went wrong, please try again later.",
                });
            }
        }
    }
}
exports.AuthController = AuthController;
