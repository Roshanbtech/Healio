"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
const emailConfig_1 = __importDefault(require("../../config/emailConfig"));
(0, dotenv_1.config)();
class AuthService {
    constructor(AuthRepository) {
        this.AuthRepository = AuthRepository;
    }
    async login(adminData) {
        try {
            const adminEmail = process.env.ADMIN_EMAIL;
            const adminPassword = process.env.ADMIN_PASSWORD;
            const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
            const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
            if (!adminEmail ||
                !adminPassword ||
                !accessTokenSecret ||
                !refreshTokenSecret) {
                throw new Error("Server configuration missing.");
            }
            if (adminData.email !== adminEmail ||
                adminData.password !== adminPassword) {
                return { error: "Invalid email or password." };
            }
            const accessToken = jsonwebtoken_1.default.sign({ email: adminData.email, role: "admin" }, accessTokenSecret, { expiresIn: "1d" });
            const refreshToken = jsonwebtoken_1.default.sign({ email: adminData.email, role: "admin" }, refreshTokenSecret, { expiresIn: "7d" });
            return { accessToken, refreshToken };
        }
        catch (error) {
            return {
                error: error instanceof Error
                    ? error.message
                    : "Internal server error. Please try again later.",
            };
        }
    }
    async logout(refreshToken) {
        try {
            return {
                status: true,
                message: "Logout successful.",
            };
        }
        catch (error) {
            return {
                error: error instanceof Error ? error.message : "Something went wrong.",
            };
        }
    }
    async getUser(options) {
        try {
            const users = await this.AuthRepository.getAllUsers(options);
            return users ?? null;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while fetching users");
        }
    }
    async getDoctor(options) {
        try {
            const doctors = await this.AuthRepository.getAllDoctors(options);
            return doctors ?? null;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while fetching doctors");
        }
    }
    async toggleUser(id) {
        try {
            const user = await this.AuthRepository.toggleUser(id);
            if (!user) {
                return null;
            }
            const message = user.isBlocked
                ? "User blocked successfully"
                : "User unblocked successfully";
            return { status: true, message };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while toggling user");
        }
    }
    async toggleDoctor(id) {
        try {
            const doctor = await this.AuthRepository.toggleDoctor(id);
            if (!doctor) {
                return null;
            }
            const message = doctor.isBlocked
                ? "Doctor blocked successfully"
                : "Doctor unblocked successfully";
            return { status: true, message };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while toggling doctor");
        }
    }
    async addService(name, isActive) {
        try {
            if (!name || name.trim() === "") {
                throw new Error("Service name cannot be empty.");
            }
            if (name.length > 20) {
                throw new Error("Service name cannot exceed 20 characters.");
            }
            const existingService = await this.AuthRepository.findServiceByName(name);
            if (existingService) {
                throw new Error("Service name already exists.");
            }
            const service = await this.AuthRepository.addService(name, isActive);
            if (!service) {
                throw new Error("Service not added.");
            }
            return { status: true, message: "Service added successfully", service };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while adding service");
        }
    }
    async editService(id, name, isActive) {
        try {
            if (!name || name.trim() === "") {
                throw new Error("Service name cannot be empty.");
            }
            if (name.length > 20) {
                throw new Error("Service name cannot exceed 20 characters.");
            }
            const existingService = await this.AuthRepository.findServiceByName(name);
            if (existingService) {
                throw new Error("Service name already exists.");
            }
            const service = await this.AuthRepository.editService(id, name, isActive);
            if (!service) {
                throw new Error("Service not updated");
            }
            return { status: true, message: "Service updated successfully", service };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while updating service");
        }
    }
    async toggleService(id) {
        try {
            const service = await this.AuthRepository.toggleService(id);
            if (!service) {
                throw new Error("Service not updated");
            }
            const message = service.isActive
                ? "Service enabled successfully"
                : "Service disabled successfully";
            return { status: true, message };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while toggling service");
        }
    }
    async toggleCoupon(id) {
        try {
            const coupon = await this.AuthRepository.toggleCoupon(id);
            if (!coupon) {
                throw new Error("Coupon not updated");
            }
            const message = coupon.isActive
                ? "Coupon enabled successfully"
                : "Coupon disabled successfully";
            return { status: true, message };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while toggling coupon");
        }
    }
    async getService(options) {
        try {
            const services = await this.AuthRepository.getAllServices(options);
            return services ?? null;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while fetching services");
        }
    }
    async getCertificates(id) {
        try {
            const certificates = await this.AuthRepository.getCertificates(id);
            return certificates ?? [];
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            return [];
        }
    }
    async approveDoctor(id) {
        try {
            const doctor = await this.AuthRepository.approveDoctor(id);
            if (!doctor)
                throw new Error("Doctor not found for approval.");
            const emailContent = `Hello Dr. ${doctor.name},

Congratulations! Your account has been approved as a doctor in the Healio team.

Thank you,
Team Healio`;
            await (0, emailConfig_1.default)(doctor.email, "Account Approved", emailContent);
            return { status: true, message: "Doctor approved successfully", doctor };
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Unexpected error during approval.";
            throw new Error(errMsg);
        }
    }
    async rejectDoctor(id, reason) {
        try {
            const doctor = await this.AuthRepository.rejectDoctor(id, reason);
            if (!doctor)
                throw new Error("Doctor not found for rejection.");
            const emailContent = `Hello Dr. ${doctor.name},

We regret to inform you that your account has been rejected as a doctor in the Healio team.
Because, ${reason}.

Thank you,
Team Healio`;
            await (0, emailConfig_1.default)(doctor.email, "Account Rejected", emailContent);
            return { status: true, message: "Doctor rejected successfully", doctor };
        }
        catch (error) {
            const errMsg = error instanceof Error
                ? error.message
                : "Unexpected error during rejection.";
            throw new Error(errMsg);
        }
    }
    async createCoupon(couponData) {
        try {
            const { code } = couponData;
            const existingCode = await this.AuthRepository.existCoupon(code);
            if (existingCode) {
                throw new Error("Coupon code already exists.");
            }
            const coupon = await this.AuthRepository.createCoupon(couponData);
            if (!coupon) {
                throw new Error("Coupon not created.");
            }
            return {
                status: true,
                message: "Coupon created successfully",
                coupon,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while creating coupon.");
        }
    }
    async editCoupon(id, couponData) {
        try {
            const existingCoupon = await this.AuthRepository.existCoupon(couponData.code);
            if (existingCoupon) {
                throw new Error("Coupon code already exists.");
            }
            const coupon = await this.AuthRepository.editCoupon(id, couponData);
            if (!coupon) {
                throw new Error("Coupon not updated.");
            }
            return {
                status: true,
                message: "Coupon updated successfully",
                coupon,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while updating coupon.");
        }
    }
    async getCoupons(options) {
        try {
            const coupons = await this.AuthRepository.getAllCoupons(options);
            return coupons ?? null;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while fetching coupons");
        }
    }
    async getDashboardStats() {
        try {
            const stats = await this.AuthRepository.fetchDashboardStats();
            return stats;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while fetching dashboard stats");
        }
    }
    async getTopDoctors() {
        try {
            const topDoctors = await this.AuthRepository.fetchTopDoctors();
            return topDoctors;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while fetching top doctors");
        }
    }
    async getTopUsers() {
        try {
            const topUsers = await this.AuthRepository.fetchTopUsers();
            return topUsers;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while fetching top users");
        }
    }
    async getAppointmentAnalytics(timeFrame) {
        try {
            const analytics = await this.AuthRepository.fetchAppointmentAnalytics(timeFrame);
            return analytics;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while fetching appointment analytics");
        }
    }
    async getReports(startDate, endDate, status, options) {
        try {
            return await this.AuthRepository.fetchReports(startDate, endDate, status, options);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Unknown error occurred while fetching reports");
        }
    }
}
exports.AuthService = AuthService;
