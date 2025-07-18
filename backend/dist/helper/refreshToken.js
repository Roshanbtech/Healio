"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const httpStatusCode_1 = __importDefault(require("../enums/httpStatusCode"));
const refresh = (req, res) => {
    console.log("Incoming Cookies Object:", req.cookies);
    const refreshToken = req.cookies.refreshToken;
    console.log("Extracted Refresh Token:", refreshToken);
    if (!refreshToken) {
        console.log("No refresh token received!");
        return res.status(httpStatusCode_1.default.Unauthorized).json({
            status: false,
            message: "Unauthorized. No refresh token found.",
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("Decoded Refresh Token:", decoded);
        const accessToken = jsonwebtoken_1.default.sign({ email: decoded.email, role: decoded.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        console.log("New Access Token Generated:", accessToken);
        res.setHeader("Authorization", `Bearer ${accessToken}`);
        return res.status(httpStatusCode_1.default.OK).json({
            status: true,
            accessToken,
        });
    }
    catch (error) {
        console.error("Error in refresh token verification:", error);
        return res.status(httpStatusCode_1.default.Forbidden).json({
            status: false,
            message: "Invalid or expired refresh token. Please login again.",
        });
    }
};
exports.default = refresh;
