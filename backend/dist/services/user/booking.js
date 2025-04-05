"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const doctor_1 = require("../../repository/doctor/doctor");
const user_1 = require("../../repository/user/user");
const razorpay_1 = require("../../config/razorpay");
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const emailConfig_1 = __importDefault(require("../../config/emailConfig"));
const emailSend_1 = require("../../helper/emailSend");
dotenv_1.default.config();
class BookingService {
    constructor(bookingRepository) {
        this.bookingRepository = bookingRepository;
        this.doctorRepository = new doctor_1.DoctorRepository();
        this.userRepository = new user_1.UserRepository();
    }
    async getCoupons() {
        try {
            return await this.bookingRepository.getCoupons();
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async delCoupons(id) {
        try {
            return await this.bookingRepository.delCoupons(id);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async bookAppointment(appointmentData) {
        try {
            // Check for conflicting appointments
            const conflictingAppointments = await this.bookingRepository.findConflictingAppointments(appointmentData.doctorId.toString(), appointmentData.date, appointmentData.time);
            if (conflictingAppointments.length > 0) {
                throw new Error("Doctor already has an appointment at this time");
            }
            // Generate unique appointment ID
            const appointmentId = `APT${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 10)}`;
            // Create Razorpay order if fees exist
            let order = null;
            if (appointmentData.fees &&
                appointmentData.paymentMethod === "razorpay") {
                const options = {
                    amount: appointmentData.fees * 100,
                    currency: "INR",
                    receipt: `receipt_appointment_${Math.floor(Math.random() * 1000)}`,
                    payment_capture: 1,
                };
                order = await razorpay_1.razorPayInstance.orders.create(options);
            }
            // Build appointment data to be saved
            const appointment = {
                appointmentId,
                patientId: appointmentData.patientId,
                doctorId: appointmentData.doctorId,
                date: appointmentData.date,
                time: appointmentData.time,
                status: "failed",
                fees: appointmentData.fees,
                paymentMethod: appointmentData.paymentMethod || "razorpay",
                paymentStatus: appointmentData.fees && appointmentData.paymentMethod === "razorpay"
                    ? "payment failed"
                    : "anonymous",
                couponCode: appointmentData.couponCode,
                couponDiscount: appointmentData.couponDiscount,
                isApplied: appointmentData.isApplied,
            };
            let result = await this.bookingRepository.bookAppointment(appointment);
            console.log(result, order, appointmentId);
            return {
                result,
                order,
                appointmentId,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async verifyBooking(data) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, } = data;
            console.log("1", bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature);
            console.log("bookingid", bookingId);
            const appointment = await this.bookingRepository.findAppointmentByPatientId(bookingId);
            console.log("2");
            if (!appointment) {
                throw new Error("Appointment not found");
            }
            console.log("3");
            const key_secret = process.env.PAYMENT_KEY_SECRET || "";
            console.log("3.1", key_secret);
            const hmac = crypto_1.default.createHmac("sha256", key_secret);
            console.log("3.2", hmac);
            hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
            console.log("3.3", hmac);
            const generated_signature = hmac.digest("hex");
            console.log("3.4", razorpay_signature, generated_signature);
            if (generated_signature !== razorpay_signature) {
                throw new Error("Payment verification failed");
            }
            console.log("4");
            const updatedAppointment = await this.bookingRepository.updateByAppointmentId(bookingId, {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                paymentStatus: "payment completed",
                status: "pending",
            });
            console.log("5");
            if (!updatedAppointment) {
                throw new Error("Failed to update appointment");
            }
            console.log("6");
            const { doctorId, fees, appointmentId } = updatedAppointment;
            await this.doctorRepository.updateWalletTransaction(doctorId._id.toString(), fees ?? 0, appointmentId);
            console.log('6.5', updatedAppointment);
            await (0, emailSend_1.emailSend)(updatedAppointment);
            return updatedAppointment;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getPatientAppointments(id) {
        try {
            return await this.bookingRepository.getPatientAppointments(id);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async retryPayment(id) {
        try {
            const appointment = await this.bookingRepository.findAppointmentByPatientId(id);
            if (!appointment) {
                throw new Error("Appointment not found");
            }
            // const conflictingAppointments =
            //   await this.bookingRepository.findConflictingAppointments(
            //     appointment.doctorId.toString(),
            //     appointment.date,
            //     appointment.time
            //   );
            // if (conflictingAppointments.length > 0) {
            //   throw new Error("Doctor already has an appointment at this time");
            // }
            if (!appointment.fees) {
                throw new Error("Fees not found for this appointment");
            }
            const options = {
                amount: appointment.fees * 100,
                currency: "INR",
                receipt: `receipt_appointment_${Math.floor(Math.random() * 1000)}`,
                payment_capture: 1,
            };
            const order = await razorpay_1.razorPayInstance.orders.create(options);
            return order;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async bookAppointmentUsingWallet(data) {
        try {
            const appointmentId = `APT${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 10)}`;
            const appointmentData = { ...data, appointmentId };
            const appointment = await this.bookingRepository.bookAppointmentUsingWallet(appointmentData);
            await this.doctorRepository.updateWalletTransaction(appointment.doctorId.toString(), appointment.fees || 0, appointmentId);
            return appointment;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("An unexpected error occurred while booking the appointment.");
        }
    }
    async addMedicalRecord(appointmentId, newMedicalRecord) {
        try {
            const updatedAppointment = await this.bookingRepository.addMedicalRecord(appointmentId, newMedicalRecord);
            return updatedAppointment;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async cancelAppointment(appointmentId) {
        try {
            console.log("cancelAppointment: Starting cancellation for appointmentId:", appointmentId);
            const appointment = await this.bookingRepository.findAppointmentById(appointmentId);
            console.log("cancelAppointment: Retrieved appointment:", appointment);
            if (!appointment) {
                throw new Error("Appointment not found");
            }
            if (appointment.status === "cancelled") {
                throw new Error("Appointment is already cancelled");
            }
            const isPending = appointment.status === "pending";
            console.log("cancelAppointment: isPending =", isPending);
            const updatedAppointment = await this.bookingRepository.cancelAppointment(appointmentId);
            console.log("cancelAppointment: Updated appointment:", updatedAppointment);
            if (!updatedAppointment) {
                throw new Error("Failed to cancel appointment");
            }
            if (isPending) {
                const refundAmount = appointment.fees || 0;
                console.log("cancelAppointment: Refund amount =", refundAmount);
                console.log("cancelAppointment: Calling refundToUser with patientId:", appointment.patientId);
                await this.userRepository.refundToUser(appointment.patientId.toString(), refundAmount);
                console.log("cancelAppointment: refundToUser completed");
                console.log("cancelAppointment: Calling deductFromDoctorWallet with doctorId:", appointment.doctorId);
                await this.doctorRepository.deductFromDoctorWallet(appointment.doctorId.toString(), refundAmount);
                console.log("cancelAppointment: deductFromDoctorWallet completed");
            }
            return updatedAppointment;
        }
        catch (error) {
            console.error("cancelAppointment: Error:", error);
            throw error;
        }
    }
    async getDoctorAppointments(id) {
        try {
            const docAppointment = await this.bookingRepository.getDoctorAppointments(id);
            return docAppointment;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async addReviewForDoctor(id, rating, description) {
        try {
            const updatedAppointment = await this.bookingRepository.addReviewForDoctor(id, rating, description);
            if (updatedAppointment) {
                const doctorId = updatedAppointment.doctorId &&
                    typeof updatedAppointment.doctorId === "object" &&
                    updatedAppointment.doctorId._id
                    ? updatedAppointment.doctorId._id.toString()
                    : updatedAppointment.doctorId.toString();
                await this.doctorRepository.updateDoctorAggregatedReview(doctorId);
                const doctor = updatedAppointment.doctorId;
                const patient = updatedAppointment.patientId;
                const emailSubject = "New Review Received from Healio Team";
                const emailBody = `Dear Dr. ${doctor.name},
  
  You have received a new review for your appointment.
  
  Rating: ${rating}/5
  Review: "${description}"
  Submitted by: ${patient.name} (${patient.email})
  
  Thank you for your commitment and care.
  Best regards,
  The Healio Team`;
                await (0, emailConfig_1.default)(doctor.email, emailSubject, emailBody);
            }
            return updatedAppointment;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.BookingService = BookingService;
