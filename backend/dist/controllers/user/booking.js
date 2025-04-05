"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const httpStatusCode_1 = __importDefault(require("../../enums/httpStatusCode"));
class BookingController {
    constructor(bookingServiceInstance) {
        this.bookingService = bookingServiceInstance;
    }
    async getCoupons(req, res) {
        try {
            const coupons = await this.bookingService.getCoupons();
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
    async delCoupons(req, res) {
        try {
            const { id } = req.params;
            const coupon = await this.bookingService.delCoupons(id);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Coupon deleted successfully",
            });
        }
        catch (error) {
            console.error("Error in delCoupons:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async bookAppointment(req, res) {
        try {
            const { patientId, doctorId, date, time, fees, isApplied, couponCode, couponDiscount, paymentMethod, } = req.body;
            // Validate required fields
            if (!patientId || !doctorId || !date || !time || fees === undefined) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "All required fields must be provided.",
                });
            }
            const data = {
                patientId,
                doctorId,
                date,
                time,
                fees,
                isApplied,
                couponCode,
                couponDiscount,
                paymentMethod,
            };
            const appointment = await this.bookingService.bookAppointment(data);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Appointment booked successfully.",
                appointment,
            });
        }
        catch (error) {
            console.error("Error in bookAppointment:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async verifyBooking(req, res) {
        try {
            const { bookingId, response } = req.body;
            console.log("1");
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
            console.log("1.1", response);
            console.log("1.2", razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId);
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "All required fields must be provided.",
                });
            }
            console.log("2");
            const data = {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                bookingId
            };
            console.log("3", data);
            const appointment = await this.bookingService.verifyBooking(data);
            console.log("4");
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Appointment verified successfully.",
                appointment,
            });
        }
        catch (error) {
            console.log("Error in verifyBooking:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async retryPayment(req, res) {
        try {
            const { bookingId } = req.params;
            if (!bookingId) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Booking ID is required.",
                });
            }
            const appointment = await this.bookingService.retryPayment(bookingId);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Payment retried successfully.",
                appointment,
            });
        }
        catch (error) {
            console.log("Error in retryPayment:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async getPatientAppointments(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Patient ID is required.",
                });
            }
            const appointments = await this.bookingService.getPatientAppointments(id);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                appointments,
            });
        }
        catch (error) {
            console.error("Error in getPatientAppointments:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async bookAppointmentUsingWallet(req, res) {
        try {
            const { patientId, doctorId, date, time, fees, isApplied, couponCode, couponDiscount, paymentMethod } = req.body;
            const data = {
                patientId,
                doctorId,
                date,
                time,
                fees,
                isApplied,
                couponCode,
                couponDiscount,
                paymentMethod,
                status: "pending",
                paymentStatus: "payment completed",
            };
            const appointment = await this.bookingService.bookAppointmentUsingWallet(data);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Appointment booked successfully.",
                appointment,
            });
        }
        catch (error) {
            console.error("Error in bookAppointmentUsingWallet:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: error.message || "Something went wrong, please try again later.",
            });
        }
    }
    async getDoctorAppointments(req, res) {
        try {
            const { id } = req.params;
            const docAppointment = await this.bookingService.getDoctorAppointments(id);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                docAppointment,
            });
        }
        catch (error) {
            console.error("Error in getPatientAppointments:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async addMedicalRecord(req, res) {
        try {
            const appointmentId = req.params.id;
            const { recordDate, condition, symptoms, medications, notes } = req.body;
            if (!recordDate || !condition || !symptoms || !medications || !notes) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "All required fields must be provided.",
                });
            }
            const newMedicalRecord = {
                recordDate: recordDate ? new Date(recordDate) : new Date(),
                condition,
                symptoms: typeof symptoms === "string"
                    ? symptoms.split(",").map((symptom) => symptom.trim())
                    : symptoms,
                medications: typeof medications === "string"
                    ? medications.split(",").map((medication) => medication.trim())
                    : medications,
                notes,
            };
            const medicalRecord = await this.bookingService.addMedicalRecord(appointmentId, newMedicalRecord);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Medical record added successfully",
                medicalRecord,
            });
        }
        catch (error) {
            console.error("Error in addMedicalRecord:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async cancelAppointment(req, res) {
        try {
            const appointmentId = req.params.id;
            if (!appointmentId) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Appointment ID is required.",
                });
            }
            const appointment = await this.bookingService.cancelAppointment(appointmentId);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Appointment cancelled successfully",
                appointment,
            });
        }
        catch (error) {
            console.error("Error in cancelAppointment:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async addReviewForDoctor(req, res) {
        try {
            const { id } = req.params;
            const { rating, description } = req.body;
            if (!rating || !description) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "All required fields must be provided.",
                });
            }
            const reviewForDoctor = await this.bookingService.addReviewForDoctor(id, rating, description);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Review added successfully",
                reviewForDoctor,
            });
        }
        catch (error) {
            console.error("Error in addReviewForDoctor:", error);
            return res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
}
exports.BookingController = BookingController;
