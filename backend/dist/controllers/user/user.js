"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const httpStatusCode_1 = __importDefault(require("../../enums/httpStatusCode"));
class UserController {
    constructor(userServiceInstance) {
        this.userService = userServiceInstance;
    }
    async getDoctors(req, res) {
        try {
            const page = parseInt(req.query.page, 9) || 1;
            const limit = parseInt(req.query.limit, 9) || 10;
            const search = req.query.search;
            const speciality = req.query.speciality;
            const doctors = await this.userService.getDoctors({
                page,
                limit,
                search,
                speciality,
            });
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                data: { doctors },
                message: "Doctors fetched successfully",
            });
        }
        catch (error) {
            console.error("Error in getDoctors:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async getDoctorDetails(req, res) {
        try {
            const { id } = req.params;
            const doctor = await this.userService.getDoctorDetails(id);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, doctor });
        }
        catch (error) {
            console.error("Error in getDoctorDetails:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async getServices(req, res) {
        try {
            const services = await this.userService.getServices();
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                data: { services },
                message: "Services fetched successfully",
            });
        }
        catch (error) {
            console.error("Error in getServices:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async getUserProfile(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserProfile(id);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, user });
        }
        catch (error) {
            console.error("Error in getProfile:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async editUserProfile(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const file = req.file;
            console.log("Controller - Data:", data, "ID:", id);
            if (data.isBlocked !== undefined) {
                data.isBlocked = data.isBlocked === "true" || data.isBlocked === true;
            }
            const result = await this.userService.editUserProfile(id, data, file);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                data: { result },
                message: "Profile updated successfully",
            });
        }
        catch (error) {
            console.error("Error in editUserProfile:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async changePassword(req, res) {
        try {
            const { id } = req.params;
            const { oldPassword, newPassword } = req.body;
            const result = await this.userService.changePassword(id, oldPassword, newPassword);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                data: { result },
                message: "Password updated successfully",
            });
        }
        catch (error) {
            console.error("Error in changePassword:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async getAvailableSlots(req, res) {
        try {
            const { id } = req.params;
            const slots = await this.userService.getAvailableSlots(id);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, slots });
        }
        catch (error) {
            console.error("Error in getAvailableSlots:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async getAppointmentDoctors(req, res) {
        try {
            const { id } = req.params;
            const getAcceptedDoctors = await this.userService.getAppointmentDoctors(id);
            return res.status(httpStatusCode_1.default.OK).json({ status: true, getAcceptedDoctors });
        }
        catch (error) {
            console.error("Error in getAppointmentDoctors:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async chatImageUploads(req, res) {
        try {
            const { id } = req.params;
            const file = req.file;
            if (!id || !file) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Chat ID and image file are required",
                });
            }
            const result = await this.userService.chatImageUploads(id, file);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                result,
            });
        }
        catch (error) {
            console.log("error in uploading chat image", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
}
exports.UserController = UserController;
