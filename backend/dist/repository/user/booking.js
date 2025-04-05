"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
const GenericRepository_1 = require("../GenericRepository");
const couponModel_1 = __importDefault(require("../../model/couponModel"));
const appointmentModel_1 = __importDefault(require("../../model/appointmentModel"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const getUrl_1 = require("../../helper/getUrl");
const emailSend_1 = require("../../helper/emailSend");
class BookingRepository {
    constructor() {
        this.couponRepo = new GenericRepository_1.GenericRepository(couponModel_1.default);
        this.appointmentRepo = new GenericRepository_1.GenericRepository(appointmentModel_1.default);
        this.userRepo = new GenericRepository_1.GenericRepository(userModel_1.default);
    }
    async getCoupons() {
        return this.couponRepo.findAll({ isActive: true });
    }
    async delCoupons(id) {
        try {
            const coupon = await this.couponRepo.findById(id);
            if (!coupon) {
                throw new Error("Coupon not found");
            }
            const couponUsedCount = await this.appointmentRepo.countDocuments({ couponCode: coupon.code });
            if (couponUsedCount < 50) {
                throw new Error("Coupon cannot be deleted as it has been used in appointments");
            }
            const result = await this.couponRepo.delete(id);
            if (!result) {
                throw new Error("Failed to delete coupon");
            }
            return true;
        }
        catch (error) {
            console.error("Error in delCoupons:", error);
            throw error;
        }
    }
    async findConflictingAppointments(doctorId, date, time) {
        return this.appointmentRepo.findAll({
            doctorId,
            date: new Date(date),
            time,
            status: { $nin: ["cancelled", "cancelled by Dr"] },
        });
    }
    async bookAppointment(data) {
        return this.appointmentRepo.create(data);
    }
    async bookAppointmentUsingWallet(data) {
        try {
            const patient = await this.userRepo.findById(data.patientId);
            if (!patient) {
                throw new Error("Patient not found");
            }
            if (patient.wallet?.balance === undefined || data.fees === undefined) {
                throw new Error("Invalid data");
            }
            if (patient.wallet.balance < data.fees) {
                throw new Error("Insufficient balance");
            }
            const newBalance = patient.wallet.balance - data.fees;
            const newTransaction = {
                amount: data.fees,
                transactionType: "debit",
                description: "Deducted for appointment booking using wallet",
                date: new Date(),
            };
            const updatedTransactions = [...(patient.wallet.transactions || []), newTransaction];
            await this.userRepo.update(String(patient._id), {
                wallet: { balance: newBalance, transactions: updatedTransactions },
            });
            const newAppointment = await this.appointmentRepo.create(data);
            const populatedAppointment = await this.appointmentRepo.findOneWithPopulate({ appointmentId: newAppointment.appointmentId }, ["patientId", "doctorId"]);
            if (populatedAppointment) {
                await (0, emailSend_1.emailSend)(populatedAppointment);
            }
            return newAppointment;
        }
        catch (error) {
            console.error("Error in bookAppointmentUsingWallet:", error);
            throw error;
        }
    }
    async findAppointmentByPatientId(appointmentId) {
        return this.appointmentRepo.findOne(appointmentId);
    }
    async findAppointmentById(appointmentId) {
        return this.appointmentRepo.findById(appointmentId);
    }
    async updateByAppointmentId(appointmentId, data) {
        return this.appointmentRepo.updateOne(appointmentId, data);
    }
    // async getPatientAppointments(id: string): Promise<IAppointment[]> {
    //   return (
    //     this.appointmentRepo
    //       .findAllQuery({ patientId: id })
    //       .populate("patientId", "name email phone age gender")
    //       .populate({
    //         path: "doctorId",
    //         select: "name image speciality",
    //         populate: {
    //           path: "speciality",
    //           model: "Service",
    //           select: "name",
    //         },
    //       })
    //       .populate("prescription", "_id diagnosis medicines labTests advice followUpDate doctorNotes signature createdAt updatedAt")
    //       .exec()
    //   );
    // }
    async getPatientAppointments(id) {
        const appointments = await this.appointmentRepo
            .findAllQuery({ patientId: id })
            .populate("patientId", "name email phone age gender")
            .populate({
            path: "doctorId",
            select: "name image speciality",
            populate: {
                path: "speciality",
                model: "Service",
                select: "name",
            },
        })
            .populate("prescription", "_id diagnosis medicines labTests advice followUpDate doctorNotes signature createdAt updatedAt")
            .exec();
        await Promise.all(appointments.map(async (appointment) => {
            const doctor = appointment.doctorId;
            if (doctor && doctor.image) {
                appointment.doctorId.image = await (0, getUrl_1.getUrl)(doctor.image);
            }
            if (appointment.prescription && appointment.prescription.signature) {
                appointment.prescription.signature = await (0, getUrl_1.getUrl)(appointment.prescription.signature);
            }
        }));
        return appointments;
    }
    async addMedicalRecord(appointmentId, newMedicalRecord) {
        return this.appointmentRepo.updateWithOperators(appointmentId, {
            $push: { medicalRecords: newMedicalRecord },
        });
    }
    async cancelAppointment(appointmentId) {
        return this.appointmentRepo.update(appointmentId, { status: "cancelled" });
    }
    async getDoctorAppointments(id) {
        return this.appointmentRepo.findAll({
            doctorId: id,
            status: { $in: ["pending", "accepted", "completed"] },
        });
    }
    async addReviewForDoctor(id, rating, description) {
        const updatedAppointment = await this.appointmentRepo.updateWithOperators(id, {
            $set: { review: { rating, description } },
        });
        if (updatedAppointment) {
            await updatedAppointment.populate("patientId", "name email");
            await updatedAppointment.populate("doctorId", "name specialty email");
        }
        return updatedAppointment;
    }
}
exports.BookingRepository = BookingRepository;
