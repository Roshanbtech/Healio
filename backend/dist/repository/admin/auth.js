"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const userModel_1 = __importDefault(require("../../model/userModel"));
const doctorModel_1 = __importDefault(require("../../model/doctorModel"));
const serviceModel_1 = __importDefault(require("../../model/serviceModel"));
const couponModel_1 = __importDefault(require("../../model/couponModel"));
const pagination_1 = require("../../helper/pagination");
const emailConfig_1 = __importDefault(require("../../config/emailConfig"));
const appointmentModel_1 = __importDefault(require("../../model/appointmentModel"));
const getUrl_1 = require("../../helper/getUrl");
class AuthRepository {
    async logout(refreshToken) {
        try {
            console.log(refreshToken, "refresh token");
            return await userModel_1.default.updateOne({ refreshToken }, { $set: { refreshToken: "" } });
            console.log("Logout successful");
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllUsers(options) {
        try {
            const projection = "-password -__v -wallet -userId -createdAt -updatedAt";
            const updatedOptions = { ...options, select: projection };
            const users = await (0, pagination_1.paginate)(userModel_1.default, updatedOptions, {});
            for (const user of users.data) {
                if (user.image) {
                    user.image = await (0, getUrl_1.getUrl)(user.image);
                }
            }
            return users;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllDoctors(options) {
        try {
            const paginationOptions = {
                ...options,
                select: "-password -__v -createdAt -updatedAt -wallet -averageRating -reviewCount",
                populate: { path: "speciality", model: "Service", select: "name" },
            };
            const doctors = await (0, pagination_1.paginate)(doctorModel_1.default, paginationOptions, {});
            for (const doctor of doctors.data) {
                if (doctor.image) {
                    doctor.image = await (0, getUrl_1.getUrl)(doctor.image);
                }
            }
            return doctors;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async toggleUser(id) {
        try {
            const user = await userModel_1.default.findById(id);
            if (!user)
                return null;
            user.isBlocked = !user.isBlocked;
            await user.save();
            return user;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async toggleDoctor(id) {
        try {
            const doctor = await doctorModel_1.default.findById(id);
            if (!doctor)
                return null;
            doctor.isBlocked = !doctor.isBlocked;
            await doctor.save();
            return doctor;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async addService(name, isActive) {
        const service = new serviceModel_1.default({ name, isActive });
        return await service.save();
    }
    async createCoupon(couponData) {
        try {
            const coupon = new couponModel_1.default(couponData);
            return await coupon.save();
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllCoupons(options) {
        try {
            const coupons = await (0, pagination_1.paginate)(couponModel_1.default, options, {});
            return coupons;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async existCoupon(code) {
        try {
            return await couponModel_1.default.findOne({ code });
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async editService(id, name, isActive) {
        const service = await serviceModel_1.default.findById(id);
        if (!service)
            return null;
        service.name = name;
        service.isActive = isActive;
        return await service.save();
    }
    async editCoupon(id, couponData) {
        try {
            const coupon = await couponModel_1.default.findById(id);
            if (!coupon)
                return null;
            coupon.name = couponData.name;
            coupon.code = couponData.code;
            coupon.discount = couponData.discount;
            coupon.startDate = couponData.startDate;
            coupon.expirationDate = couponData.expirationDate;
            coupon.isActive = couponData.isActive;
            return await coupon.save();
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async toggleService(id) {
        try {
            const service = await serviceModel_1.default.findById(id);
            if (!service)
                return null;
            service.isActive = !service.isActive;
            await service.save();
            return service;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async toggleCoupon(id) {
        try {
            const coupon = await couponModel_1.default.findById(id);
            if (!coupon)
                return null;
            coupon.isActive = !coupon.isActive;
            await coupon.save();
            return coupon;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAllServices(options) {
        try {
            const services = await (0, pagination_1.paginate)(serviceModel_1.default, options, {});
            return services;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async findServiceByName(name) {
        try {
            const service = await serviceModel_1.default.findOne({ name });
            return service;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getCertificates(id) {
        try {
            const doctor = await doctorModel_1.default.findById(id);
            if (!doctor)
                return null;
            return doctor.certificate;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async approveDoctor(id) {
        try {
            const doctor = await doctorModel_1.default.findById(id);
            if (!doctor)
                return null;
            const emailContent = `Hello Dr. ${doctor.name},

Congratulations! Your account has been approved as a doctor in the Healio team.

Thank you,
Team Healio`;
            await (0, emailConfig_1.default)(doctor.email, "Account Approved", emailContent);
            return await doctorModel_1.default.findByIdAndUpdate(id, { docStatus: "approved", isDoctor: true, rejectionReason: "" }, { new: true });
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async rejectDoctor(id, reason) {
        try {
            const doctor = await doctorModel_1.default.findById(id);
            if (!doctor)
                return null;
            const emailContent = `Hello Dr. ${doctor.name},
  
  We regret to inform you that your account has been rejected as a doctor in the Healio team.
  Because, ${reason}.
  
  Thank you,
  Team Healio`;
            await (0, emailConfig_1.default)(doctor.email, "Account Rejected", emailContent);
            return await doctorModel_1.default.findByIdAndUpdate(id, { docStatus: "rejected", isDoctor: false, rejectionReason: reason }, { new: true });
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async fetchDashboardStats() {
        try {
            const totalCustomers = await userModel_1.default.countDocuments({});
            const totalDoctors = await doctorModel_1.default.countDocuments({ $or: [{ isDoctor: true }, { docStatus: "approved" }] });
            const completedBookings = await appointmentModel_1.default.countDocuments({ status: "completed" });
            const revenueResult = await appointmentModel_1.default.aggregate([
                { $match: { status: "completed", fees: { $exists: true } } },
                { $group: { _id: null, totalRevenue: { $sum: "$fees" } } }
            ]);
            const totalRevenue = revenueResult[0]?.totalRevenue || 0;
            return { totalCustomers, totalDoctors, completedBookings, totalRevenue };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async fetchTopDoctors() {
        try {
            const topDoctors = await appointmentModel_1.default.aggregate([
                { $match: { status: "completed" } },
                {
                    $group: {
                        _id: "$doctorId",
                        appointmentsCount: { $sum: 1 },
                        totalEarnings: { $sum: "$fees" }
                    }
                },
                {
                    $lookup: {
                        from: "doctors",
                        localField: "_id",
                        foreignField: "_id",
                        as: "doctorDetails"
                    }
                },
                { $unwind: "$doctorDetails" },
                {
                    $addFields: {
                        "doctorDetails.averageRating": { $ifNull: ["$doctorDetails.averageRating", 0] }
                    }
                },
                {
                    $sort: {
                        appointmentsCount: -1,
                        "doctorDetails.averageRating": -1
                    }
                },
                { $limit: 5 }
            ]);
            for (const doctor of topDoctors) {
                if (doctor.doctorDetails.image) {
                    doctor.doctorDetails.image = await (0, getUrl_1.getUrl)(doctor.doctorDetails.image);
                }
            }
            return topDoctors;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async fetchTopUsers() {
        try {
            const topUsers = await appointmentModel_1.default.aggregate([
                { $group: {
                        _id: "$patientId",
                        bookingsCount: { $sum: 1 },
                        totalSpent: { $sum: "$fees" },
                        lastVisit: { $max: "$date" }
                    } },
                { $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userDetails"
                    } },
                { $unwind: "$userDetails" },
                {
                    $addFields: {
                        "userDetails.averageRating": { $ifNull: ["$userDetails.averageRating", 0] }
                    }
                },
                {
                    $sort: {
                        appointmentsCount: -1,
                        "userDetails.averageRating": -1
                    }
                },
                { $limit: 5 }
            ]);
            for (const user of topUsers) {
                if (user.userDetails.image) {
                    user.userDetails.image = await (0, getUrl_1.getUrl)(user.userDetails.image);
                }
            }
            return topUsers;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async fetchAppointmentAnalytics(timeFrame) {
        try {
            if (timeFrame === "weekly") {
                const analytics = await appointmentModel_1.default.aggregate([
                    {
                        $group: {
                            _id: { dayOfWeek: { $dayOfWeek: "$date" } },
                            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                            canceled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            dayOfWeek: "$_id.dayOfWeek",
                            completed: 1,
                            canceled: 1
                        }
                    },
                    { $sort: { dayOfWeek: 1 } }
                ]);
                const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const transformedAnalytics = analytics.map(item => ({
                    _id: weekDays[item.dayOfWeek - 1],
                    completed: item.completed,
                    canceled: item.canceled
                }));
                return transformedAnalytics;
            }
            else {
                const groupFormat = {
                    daily: "%Y-%m-%d",
                    monthly: "%Y-%m",
                    yearly: "%Y"
                }[timeFrame] || "%Y-%m-%d";
                const analytics = await appointmentModel_1.default.aggregate([
                    {
                        $group: {
                            _id: { $dateToString: { format: groupFormat, date: "$date" } },
                            completed: {
                                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                            },
                            canceled: {
                                $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                            }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]);
                return analytics;
            }
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async fetchReports(startDate, endDate, status, options) {
        try {
            const query = {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $in: ["completed", "cancelled"] }
            };
            if (status) {
                query.status = status;
            }
            // Add the select field in the options
            const paginatedResult = await (0, pagination_1.paginate)(appointmentModel_1.default, {
                ...options,
                select: 'appointmentId date time status fees paymentMethod paymentStatus couponCode couponDiscount isApplied createdAt updatedAt',
                populate: [
                    { path: "doctorId", select: "name email phone docStatus fees averageRating" },
                    { path: "patientId", select: "name email phone address" }
                ]
            }, query);
            return paginatedResult;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.AuthRepository = AuthRepository;
