"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const httpStatusCode_1 = __importDefault(require("../enums/httpStatusCode"));
const userModel_1 = __importDefault(require("../model/userModel"));
const doctorModel_1 = __importDefault(require("../model/doctorModel"));
const verifyToken = (allowedRoles) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization ||
            req.headers.Authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(httpStatusCode_1.default.Unauthorized).json({
                status: false,
                message: "Access token missing or malformed.",
            });
        }
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log("Access token decoded:", decoded);
            let user = null;
            if (decoded.role === "admin") {
                if (!process.env.ADMIN_EMAIL ||
                    decoded.email !== process.env.ADMIN_EMAIL) {
                    return res.status(httpStatusCode_1.default.Forbidden).json({
                        status: false,
                        message: "Access denied. Unauthorized admin account.",
                    });
                }
            }
            else if (decoded.role === "user") {
                user = await userModel_1.default.findOne({ email: decoded.email });
            }
            else if (decoded.role === "doctor") {
                user = await doctorModel_1.default.findOne({ email: decoded.email });
            }
            if (!user && decoded.role !== "admin") {
                return res.status(httpStatusCode_1.default.Forbidden).json({
                    status: false,
                    message: "Access denied. User not found.",
                });
            }
            if (user && user.isBlocked) {
                return res.status(httpStatusCode_1.default.Forbidden).json({
                    status: false,
                    message: `Access denied. ${decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1)} is blocked.`,
                });
            }
            if (allowedRoles && !allowedRoles.includes(decoded.role)) {
                return res.status(httpStatusCode_1.default.Forbidden).json({
                    status: false,
                    message: "Access denied. Insufficient permissions.",
                });
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error("Access token verification error:", error);
            return res.status(httpStatusCode_1.default.Unauthorized).json({
                status: false,
                message: "Invalid or expired access token.",
            });
        }
    };
};
exports.default = verifyToken;
