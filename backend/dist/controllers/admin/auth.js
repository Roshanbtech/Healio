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
    async loginAdmin(req, res) {
        try {
            console.log("Processing admin login request...");
            const { email, password } = req.body;
            // Validate request body
            if (!email || !password) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Email and password are required.",
                });
            }
            // Authenticate the admin
            const loginResponse = await this.authService.login({ email, password });
            // Check for login errors
            if ("error" in loginResponse) {
                console.warn("Admin login failed:", loginResponse.error);
                return res.status(httpStatusCode_1.default.Unauthorized).json({
                    status: false,
                    message: loginResponse.error,
                });
            }
            const { accessToken, refreshToken } = loginResponse;
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/auth/refresh",
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            });
            // Set authorization header with access token
            res.setHeader("Authorization", `Bearer ${accessToken}`);
            console.log("Admin logged in successfully.");
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Admin logged in successfully.",
                accessToken,
            });
        }
        catch (error) {
            console.error("Error in loginAdmin:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async logoutAdmin(req, res) {
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
            console.error(error);
            res
                .status(httpStatusCode_1.default.InternalServerError)
                .json({ message: "Something went wrong, please try again later" });
        }
    }
    async getUserList(req, res) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const search = req.query.search;
            const speciality = req.query.category;
            const userList = await this.authService.getUser({
                page,
                limit,
                search,
                speciality,
                searchFields: ["name", "email"],
            });
            return res.status(httpStatusCode_1.default.OK).json({ status: true, ...userList });
        }
        catch (error) {
            console.error("Error in getUserList:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async getDoctorList(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page, 10) || 1,
                limit: parseInt(req.query.limit, 10) || 10,
                search: req.query.search,
                speciality: req.query.category,
                status: req.query.status,
                searchFields: ["name", "email"],
            };
            const doctorList = await this.authService.getDoctor(options);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, doctorList });
        }
        catch (error) {
            console.error("Error in getDoctorList:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async toggleUser(req, res) {
        try {
            const { id } = req.params;
            console.log(id);
            const blockUser = await this.authService.toggleUser(id);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, blockUser });
        }
        catch (error) {
            console.error("Error in blockUser:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async toggleDoctor(req, res) {
        try {
            const { id } = req.params;
            console.log(id);
            const blockUser = await this.authService.toggleDoctor(id);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, blockUser });
        }
        catch (error) {
            console.error("Error in blockDoctor:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async getServices(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page, 10) || 1,
                limit: parseInt(req.query.limit, 10) || 10,
                search: req.query.search,
                speciality: req.query.category
            };
            const serviceList = await this.authService.getService(options);
            if (!serviceList || serviceList.length === 0) {
                return res.status(httpStatusCode_1.default.NotFound).json({
                    status: false,
                    message: "No services found.",
                });
            }
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                data: { serviceList },
                message: null,
            });
        }
        catch (error) {
            console.error("Error in serviceList:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async addService(req, res) {
        try {
            const { name } = req.body;
            const service = await this.authService.addService(name, true);
            return res.status(200).json({ status: true, service });
        }
        catch (error) {
            console.error("Error in AuthController.addService:", error);
            return res.status(500).json({
                status: false,
                message: error.message || "Something went wrong, please try again later.",
            });
        }
    }
    async editService(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            // Input validation
            if (!id || !name) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Service ID and name are required.",
                });
            }
            const service = await this.authService.editService(id, name, true);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Service updated successfully.",
                service,
            });
        }
        catch (error) {
            console.error("Error in editService:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async toggleService(req, res) {
        try {
            const { id } = req.params;
            const service = await this.authService.toggleService(id);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, service });
        }
        catch (error) {
            console.error("Error in toggleService:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async getCertificates(req, res) {
        try {
            const { id } = req.params;
            const certificates = await this.authService.getCertificates(id);
            return res
                .status(httpStatusCode_1.default.OK)
                .json({ status: true, certificates });
        }
        catch (error) {
            console.error("Error in getCertificates:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async approveDoctor(req, res) {
        try {
            const { id } = req.params;
            const doctor = await this.authService.approveDoctor(id);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, doctor });
        }
        catch (error) {
            console.error("Error in approveDoctor:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async rejectDoctor(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const doctor = await this.authService.rejectDoctor(id, reason);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, doctor });
        }
        catch (error) {
            console.error("Error in rejectDoctor:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async createCoupon(req, res) {
        try {
            const { name, code, discount, expirationDate } = req.body;
            const expireDate = new Date(expirationDate);
            const couponData = {
                name,
                code,
                discount,
                startDate: new Date(),
                expirationDate: expireDate,
                isActive: true,
            };
            const result = await this.authService.createCoupon(couponData);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, result });
        }
        catch (error) {
            console.error("Error in createCoupon:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async getCoupons(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                search: req.query.search,
                speciality: req.query.speciality,
                searchFields: ["name", "code"]
            };
            const coupons = await this.authService.getCoupons(options);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, coupons });
        }
        catch (error) {
            console.error("Error in getCoupons:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async toggleCoupon(req, res) {
        try {
            const { id } = req.params;
            const coupon = await this.authService.toggleCoupon(id);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, coupon });
        }
        catch (error) {
            console.error("Error in blockingCoupon:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async editCoupon(req, res) {
        try {
            const { id } = req.params;
            const { name, code, discount, expirationDate } = req.body;
            const expireDate = new Date(expirationDate);
            const couponData = {
                name,
                code,
                discount,
                startDate: new Date(),
                expirationDate: expireDate,
                isActive: true,
            };
            const result = await this.authService.editCoupon(id, couponData);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, result });
        }
        catch (error) {
            console.error("Error in editCoupon:", error);
        }
    }
    async getDashboardStats(req, res) {
        try {
            const stats = await this.authService.getDashboardStats();
            return res.status(httpStatusCode_1.default.OK).json({ status: true, data: stats });
        }
        catch (error) {
            return res.status(httpStatusCode_1.default.InternalServerError).json({ status: false, message: error.message });
        }
    }
    async getTopDoctors(req, res) {
        try {
            const topDoctors = await this.authService.getTopDoctors();
            return res.status(httpStatusCode_1.default.OK).json({ status: true, data: topDoctors });
        }
        catch (error) {
            return res.status(httpStatusCode_1.default.InternalServerError).json({ status: false, message: error.message });
        }
    }
    async getTopUsers(req, res) {
        try {
            const topUsers = await this.authService.getTopUsers();
            return res.status(httpStatusCode_1.default.OK).json({ status: true, data: topUsers });
        }
        catch (error) {
            return res.status(httpStatusCode_1.default.InternalServerError).json({ status: false, message: error.message });
        }
    }
    async getAppointmentAnalytics(req, res) {
        try {
            const timeFrame = req.query.timeFrame;
            const analytics = await this.authService.getAppointmentAnalytics(timeFrame);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, data: analytics });
        }
        catch (error) {
            return res.status(httpStatusCode_1.default.InternalServerError).json({ status: false, message: error.message });
        }
    }
    async getReports(req, res) {
        try {
            const { startDate, endDate, page, limit, search, status } = req.query;
            const pageLimit = parseInt(limit, 10) || 10;
            const pageNumber = parseInt(page, 10) || 1;
            const searchQuery = search;
            const statusQuery = status;
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Invalid date format provided.",
                });
            }
            if (start > end) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Start date cannot be greater than end date.",
                });
            }
            const reports = await this.authService.getReports(start, end, statusQuery, {
                page: pageNumber,
                limit: pageLimit,
                search: searchQuery,
            });
            return res.status(httpStatusCode_1.default.OK).json({ status: true, data: reports });
        }
        catch (error) {
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: error.message,
            });
        }
    }
}
exports.AuthController = AuthController;
