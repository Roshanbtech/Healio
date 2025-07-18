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
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Email and password are required.",
                });
                return;
            }
            const loginResponse = await this.authService.login({ email, password });
            if ("error" in loginResponse) {
                res.status(httpStatusCode_1.default.Unauthorized).json({
                    status: false,
                    message: loginResponse.error,
                });
                return;
            }
            const { accessToken, refreshToken } = loginResponse;
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/auth/refresh",
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            });
            res.setHeader("Authorization", `Bearer ${accessToken}`);
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Admin logged in successfully.",
                accessToken,
            });
        }
        catch (error) {
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong, please try again later.",
            });
        }
    }
    async logoutAdmin(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            const result = await this.authService.logout(refreshToken);
            if ("error" in result) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: result.error,
                });
                return;
            }
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            });
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: result.message,
            });
        }
        catch (error) {
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong, please try again later.",
            });
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
            res.status(httpStatusCode_1.default.OK).json({ status: true, ...userList });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
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
            res.status(httpStatusCode_1.default.OK).json({ status: true, doctorList });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async toggleUser(req, res) {
        try {
            const { id } = req.params;
            const blockUser = await this.authService.toggleUser(id);
            if (!blockUser) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "User not found.",
                });
                return;
            }
            res.status(httpStatusCode_1.default.OK).json({ blockUser });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async toggleDoctor(req, res) {
        try {
            const { id } = req.params;
            const blockDoctor = await this.authService.toggleDoctor(id);
            if (!blockDoctor)
                res
                    .status(httpStatusCode_1.default.BadRequest)
                    .json({ status: false, message: "Doctor not found." });
            res.status(httpStatusCode_1.default.OK).json({ blockDoctor });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    // async doctorProfileUpdate(req:Request,res:Response): Promise<void>{
    //   try{
    //    const { id } = req.params;
    //    const doctorProfile = await this.authService.doctorProfile(id)
    //    res.status(HTTP_statusCode.OK).json({ status: true, doctorProfile });
    //   }catch(error:unknown){
    //     throw new Error(error instanceof Error ? error.message : "Something went wrong, please try again later.");
    //   }
    // }
    async getServices(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page, 10) || 1,
                limit: parseInt(req.query.limit, 10) || 10,
                search: req.query.search,
                speciality: req.query.category,
            };
            const serviceList = await this.authService.getService(options);
            if (!serviceList || !serviceList.data || serviceList.data.length === 0) {
                res.status(httpStatusCode_1.default.NotFound).json({
                    status: false,
                    message: "No services found.",
                });
            }
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                data: { serviceList },
                message: null,
            });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async addService(req, res) {
        try {
            const { name } = req.body;
            const service = await this.authService.addService(name, true);
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Service added successfully",
                service,
            });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async editService(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const service = await this.authService.editService(id, name, true);
            res.status(httpStatusCode_1.default.OK).json(service);
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async toggleService(req, res) {
        try {
            const { id } = req.params;
            const service = await this.authService.toggleService(id);
            if (!service) {
                res
                    .status(httpStatusCode_1.default.BadRequest)
                    .json({ status: false, message: "Service not found." });
            }
            res.status(httpStatusCode_1.default.OK).json({ service });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async getCertificates(req, res) {
        try {
            const { id } = req.params;
            const certificates = await this.authService.getCertificates(id);
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                certificates,
                message: "Certificates fetched successfully",
            });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                certificates: [],
                message: errMsg,
            });
        }
    }
    async approveDoctor(req, res) {
        try {
            const { id } = req.params;
            const doctor = await this.authService.approveDoctor(id);
            res.status(httpStatusCode_1.default.OK).json({ status: true, doctor });
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : "Error approving doctor.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async rejectDoctor(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const doctor = await this.authService.rejectDoctor(id, reason);
            res.status(httpStatusCode_1.default.OK).json({ status: true, doctor });
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : "Error rejecting doctor.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async createCoupon(req, res) {
        try {
            const { name, code, discount, expirationDate } = req.body;
            const couponData = {
                name,
                code,
                discount,
                startDate: new Date(),
                expirationDate: new Date(expirationDate),
                isActive: true,
            };
            const result = await this.authService.createCoupon(couponData);
            res.status(httpStatusCode_1.default.OK).json(result);
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
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
                searchFields: ["name", "code"],
            };
            const coupons = await this.authService.getCoupons(options);
            res.status(httpStatusCode_1.default.OK).json({ status: true, coupons });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async toggleCoupon(req, res) {
        try {
            const { id } = req.params;
            const coupon = await this.authService.toggleCoupon(id);
            if (!coupon) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Coupon not found.",
                });
            }
            res.status(httpStatusCode_1.default.OK).json({ coupon });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async editCoupon(req, res) {
        try {
            const { id } = req.params;
            const { name, code, discount, expirationDate } = req.body;
            if (!id || !name || !code) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Service ID, name and code are required.",
                });
                return;
            }
            const couponData = {
                name,
                code,
                discount,
                startDate: new Date(),
                expirationDate: new Date(expirationDate),
                isActive: true,
            };
            const result = await this.authService.editCoupon(id, couponData);
            res.status(httpStatusCode_1.default.OK).json(result);
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async getDashboardStats(req, res) {
        try {
            const stats = await this.authService.getDashboardStats();
            res.status(httpStatusCode_1.default.OK).json({ status: true, data: stats });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async getTopDoctors(req, res) {
        try {
            const topDoctors = await this.authService.getTopDoctors();
            res.status(httpStatusCode_1.default.OK).json({ status: true, data: topDoctors });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async getTopUsers(req, res) {
        try {
            const topUsers = await this.authService.getTopUsers();
            res.status(httpStatusCode_1.default.OK).json({ status: true, data: topUsers });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
    async getAppointmentAnalytics(req, res) {
        try {
            const timeFrame = req.query.timeFrame;
            const analytics = await this.authService.getAppointmentAnalytics(timeFrame);
            res.status(httpStatusCode_1.default.OK).json({ status: true, data: analytics });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
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
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Invalid date format provided.",
                });
            }
            if (start > end) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Start date cannot be greater than end date.",
                });
            }
            const reports = await this.authService.getReports(start, end, statusQuery, {
                page: pageNumber,
                limit: pageLimit,
                search: searchQuery,
            });
            res.status(httpStatusCode_1.default.OK).json({ status: true, data: reports });
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Something went wrong, please try again later.";
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: errMsg,
            });
        }
    }
}
exports.AuthController = AuthController;
