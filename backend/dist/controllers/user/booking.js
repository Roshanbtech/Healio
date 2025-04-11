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
            res.status(httpStatusCode_1.default.OK).json({ status: true, coupons });
        }
        catch (error) {
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async delCoupons(req, res) {
        try {
            const { id } = req.params;
            const coupon = await this.bookingService.delCoupons(id);
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Coupon deleted successfully",
            });
        }
        catch (error) {
            console.error("Error in delCoupons:", error);
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async bookAppointment(req, res) {
        try {
            const { patientId, doctorId, date, time, fees, isApplied, couponCode, couponDiscount, paymentMethod, } = req.body;
            if (!patientId || !doctorId || !date || !time || fees === undefined) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "All required fields must be provided.",
                });
                return;
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
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Appointment booked successfully.",
                appointment,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    status: false,
                    message: "Something went wrong, please try again later.",
                });
            }
        }
    }
    async verifyBooking(req, res) {
        try {
            const { bookingId, response } = req.body;
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "All required fields must be provided.",
                });
                return;
            }
            const data = {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                bookingId
            };
            const appointment = await this.bookingService.verifyBooking(data);
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Appointment verified successfully.",
                appointment,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    status: false,
                    message: "Something went wrong, please try again later.",
                });
            }
        }
    }
    async retryPayment(req, res) {
        try {
            const { bookingId } = req.params;
            if (!bookingId) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Booking ID is required.",
                });
                return;
            }
            const appointment = await this.bookingService.retryPayment(bookingId);
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Payment retried successfully.",
                appointment,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    status: false,
                    message: "Something went wrong, please try again later.",
                });
            }
        }
    }
    async getPatientAppointments(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Patient ID is required.",
                });
                return;
            }
            const appointments = await this.bookingService.getPatientAppointments(id);
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                appointments,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    status: false,
                    message: "Something went wrong, please try again later.",
                });
            }
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
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Appointment booked successfully.",
                appointment,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(httpStatusCode_1.default.InternalServerError).json({
                    status: false,
                    message: "Something went wrong, please try again later.",
                });
            }
        }
    }
    async getDoctorAppointments(req, res) {
        try {
            const { id } = req.params;
            const docAppointment = await this.bookingService.getDoctorAppointments(id);
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                docAppointment,
            });
        }
        catch (error) {
            res.status(httpStatusCode_1.default.InternalServerError).json({
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
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "All required fields must be provided.",
                });
                return;
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
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Medical record added successfully",
                medicalRecord,
            });
        }
        catch (error) {
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
    async cancelAppointment(req, res) {
        try {
            const appointmentId = req.params.id;
            if (!appointmentId) {
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "Appointment ID is required.",
                });
                return;
            }
            const appointment = await this.bookingService.cancelAppointment(appointmentId);
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Appointment cancelled successfully",
                appointment,
            });
        }
        catch (error) {
            res.status(httpStatusCode_1.default.InternalServerError).json({
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
                res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    message: "All required fields must be provided.",
                });
                return;
            }
            const reviewForDoctor = await this.bookingService.addReviewForDoctor(id, rating, description);
            res.status(httpStatusCode_1.default.OK).json({
                status: true,
                message: "Review added successfully",
                reviewForDoctor,
            });
        }
        catch (error) {
            res.status(httpStatusCode_1.default.InternalServerError).json({
                status: false,
                message: "Something went wrong, please try again later.",
            });
        }
    }
}
exports.BookingController = BookingController;
