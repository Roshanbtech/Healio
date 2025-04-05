"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class AuthService {
    constructor(AuthRepository) {
        this.AuthRepository = AuthRepository;
    }
    async login(AdminData) {
        try {
            const adminEmail = process.env.ADMIN_EMAIL;
            const adminPassword = process.env.ADMIN_PASSWORD;
            const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
            const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
            console.log(adminEmail, adminPassword, "env");
            if (!adminEmail ||
                !adminPassword ||
                !accessTokenSecret ||
                !refreshTokenSecret) {
                throw new Error("Server configuration missing.");
            }
            console.log(AdminData.password, "body");
            if (AdminData.email !== adminEmail ||
                AdminData.password !== adminPassword) {
                return { error: "Invalid email or password." };
            }
            const accessToken = jsonwebtoken_1.default.sign({ email: AdminData.email, role: "admin" }, accessTokenSecret, { expiresIn: "15m" });
            const refreshToken = jsonwebtoken_1.default.sign({ email: AdminData.email, role: "admin" }, refreshTokenSecret, { expiresIn: "7d" });
            return { accessToken, refreshToken };
        }
        catch (error) {
            console.error("Error during admin login:", error);
            return { error: "Internal server error. Please try again later." };
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
    async getUser(options) {
        try {
            const users = await this.AuthRepository.getAllUsers(options);
            if (!users) {
                return null;
            }
            return users;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDoctor(options) {
        try {
            const doctors = await this.AuthRepository.getAllDoctors(options);
            if (!doctors) {
                return null;
            }
            return doctors;
        }
        catch (error) {
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            console.error("Error in AuthService.addService:", error);
            throw new Error(error.message || "An error occurred while adding the service.");
        }
    }
    async editService(id, name, isActive) {
        try {
            const service = await this.AuthRepository.editService(id, name, isActive);
            if (!service) {
                throw new Error("Service not updated");
            }
            return { status: true, message: "Service updated successfully", service };
        }
        catch (error) {
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            throw new Error(error.message);
        }
    }
    async getService(options) {
        try {
            const services = await this.AuthRepository.getAllServices(options);
            if (!services) {
                return null;
            }
            return services;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getCertificates(id) {
        try {
            const certificates = await this.AuthRepository.getCertificates(id);
            return certificates;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async approveDoctor(id) {
        try {
            const doctor = await this.AuthRepository.approveDoctor(id);
            if (!doctor) {
                throw new Error("Doctor not approved");
            }
            return { status: true, message: "Doctor approved successfully", doctor };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async rejectDoctor(id, reason) {
        try {
            const doctor = await this.AuthRepository.rejectDoctor(id, reason);
            if (!doctor) {
                throw new Error("Doctor not rejected");
            }
            return { status: true, message: "Doctor rejected successfully", doctor };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createCoupon(couponData) {
        try {
            const { code } = couponData;
            let existingCode = await this.AuthRepository.existCoupon(code);
            if (existingCode) {
                throw new Error("Coupon code already exists");
            }
            const coupon = await this.AuthRepository.createCoupon(couponData);
            if (!coupon) {
                return { status: false, message: "Coupon not created" };
            }
            return { status: true, message: "Coupon created successfully", coupon };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async editCoupon(id, couponData) {
        try {
            const coupon = await this.AuthRepository.editCoupon(id, couponData);
            if (!coupon) {
                throw new Error("Coupon not updated");
            }
            return { status: true, message: "Coupon updated successfully", coupon };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getCoupons(options) {
        try {
            const coupons = await this.AuthRepository.getAllCoupons(options);
            if (!coupons) {
                return null;
            }
            return coupons;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDashboardStats() {
        try {
            const stats = await this.AuthRepository.fetchDashboardStats();
            return stats;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getTopDoctors() {
        try {
            const topDoctors = await this.AuthRepository.fetchTopDoctors();
            return topDoctors;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getTopUsers() {
        try {
            const topUsers = await this.AuthRepository.fetchTopUsers();
            return topUsers;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAppointmentAnalytics(timeFrame) {
        try {
            const analytics = await this.AuthRepository.fetchAppointmentAnalytics(timeFrame);
            return analytics;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getReports(startDate, endDate, status, options) {
        try {
            return await this.AuthRepository.fetchReports(startDate, endDate, status, options);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.AuthService = AuthService;
