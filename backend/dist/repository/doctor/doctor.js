"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorRepository = void 0;
const doctorModel_1 = __importDefault(require("../../model/doctorModel"));
const serviceModel_1 = __importDefault(require("../../model/serviceModel"));
const slotModel_1 = __importDefault(require("../../model/slotModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const chatModel_1 = __importDefault(require("../../model/chatModel"));
const appointmentModel_1 = __importDefault(require("../../model/appointmentModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const schedule_1 = require("../../helper/schedule");
const date_1 = require("../../helper/date");
const startOfYesterday_1 = require("date-fns/startOfYesterday");
const endOfYesterday_1 = require("date-fns/endOfYesterday");
// import { getUrl } from "../../helper/getUrl";
class DoctorRepository {
    async getServices() {
        try {
            const services = await serviceModel_1.default.find({ isActive: true }).lean();
            return services;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error in repository";
            throw new Error(errorMessage);
        }
    }
    async addQualification(data, doctorId) {
        try {
            const updatedDoctor = await doctorModel_1.default
                .findByIdAndUpdate(doctorId, { $set: data }, { new: true })
                .select("-password -wallet -__v -averageRating -reviewCount");
            return updatedDoctor;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error while updating doctor";
            throw new Error(errorMessage);
        }
    }
    async getQualifications(id) {
        try {
            const doctor = await doctorModel_1.default
                .findOne({ _id: id, docStatus: "approved" })
                .populate({ path: "speciality", model: "Service", select: "name" })
                .select("-password -wallet -__v -averageRating -reviewCount")
                .lean();
            if (!doctor)
                return null;
            return doctor;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error in getQualifications";
            throw new Error(errorMessage);
        }
    }
    async getDoctorProfile(id) {
        try {
            const doctor = await doctorModel_1.default
                .findById(id)
                .select("-password -__v")
                .populate({ path: "speciality", model: "Service", select: "name" })
                .lean();
            return doctor;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error in repository";
            throw new Error(message);
        }
    }
    async editDoctorProfile(id, data) {
        try {
            const updatedDoctor = await doctorModel_1.default.findByIdAndUpdate(id, { $set: data }, { new: true })
                .select("-password -wallet -__v ")
                .lean();
            return updatedDoctor;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error in repository";
            throw new Error(message);
        }
    }
    async changePassword(id, oldPassword, newPassword) {
        try {
            const doctor = await doctorModel_1.default.findById(id);
            if (!doctor)
                throw new Error("Doctor not found");
            const isMatch = await bcrypt_1.default.compare(oldPassword, doctor.password);
            if (!isMatch) {
                return { status: false, message: "Old password is incorrect" };
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            await doctorModel_1.default.findByIdAndUpdate(id, {
                $set: { password: hashedPassword },
            });
            return { status: true, message: "Password changed successfully" };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error in repository";
            throw new Error(message);
        }
    }
    async addSchedule(scheduleData) {
        try {
            const scheduleDoc = await slotModel_1.default.create(scheduleData);
            return scheduleDoc;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create schedule";
            throw new Error(message);
        }
    }
    async findRecurringScheduleByDoctor(doctorId) {
        try {
            const recurring = await slotModel_1.default.findOne({
                doctor: doctorId,
                isRecurring: true,
            });
            return recurring;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to check existing recurring schedule";
            throw new Error(message);
        }
    }
    async getSchedule(id) {
        try {
            const doctor = await doctorModel_1.default.findById(id);
            if (!doctor) {
                throw new Error("Doctor not found");
            }
            const schedules = await slotModel_1.default
                .find({ doctor: id })
                .populate({ path: "doctor", select: "name" })
                .lean();
            const activeSchedules = schedules.filter((schedule) => !(0, schedule_1.isScheduleExpired)(schedule));
            return activeSchedules;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Repository error in getSchedule";
            throw new Error(errorMessage);
        }
    }
    async getUsers() {
        try {
            const users = await userModel_1.default.find({}).lean();
            return users;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAppointmentUsers(id) {
        try {
            const appointments = await appointmentModel_1.default.find({
                doctorId: id,
                status: "accepted",
            });
            if (!appointments || appointments.length === 0)
                return [];
            const userIds = [];
            for (let i = 0; i < appointments.length; i++) {
                const userId = appointments[i].patientId.toString();
                if (!userIds.includes(userId)) {
                    userIds.push(userId);
                }
            }
            const userDetails = await userModel_1.default
                .find({ _id: { $in: userIds } })
                .select("-wallet -password");
            // await Promise.all(
            //   userDetails.map(async (user) => {
            //     // if (user.image) {
            //     //   user.image = await getUrl(user.image);
            //     // }
            //   })
            // );
            return userDetails;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async uploadChatImage(chatId, file) {
        try {
            const chat = await chatModel_1.default.findById(chatId);
            if (!chat) {
                throw new Error("Chat not found");
            }
            const newMessage = {
                sender: "doctor",
                message: "",
                type: "img",
                deleted: false,
                read: false,
            };
            return {
                chatId: chat._id,
                doctorId: chat.doctorId,
                userId: chat.userId,
                newMessage,
            };
        }
        catch (error) {
            console.error("Error in chatImageUploads repository:", error);
            throw error;
        }
    }
    async saveChatImageMessage(chatId, messageData) {
        try {
            const updatedChat = await chatModel_1.default.findByIdAndUpdate(chatId, { $push: { messages: messageData } }, { new: true });
            if (!updatedChat) {
                throw new Error("Failed to save chat message");
            }
            return updatedChat.messages[updatedChat.messages.length - 1];
        }
        catch (error) {
            console.error("Error saving chat image message:", error);
            throw error;
        }
    }
    async getAppointments(id) {
        try {
            const appointments = await appointmentModel_1.default.find({ doctorId: id })
                .populate("patientId", "name email phone age gender")
                .populate({
                path: "doctorId",
                select: "name speciality",
                populate: {
                    path: "speciality",
                    model: "Service",
                    select: "name",
                },
            })
                .populate("prescription", "_id diagnosis medicines labTests advice followUpDate doctorNotes signature createdAt updatedAt")
                .sort({ date: -1 })
                .exec();
            // await Promise.all(
            //   appointments.map(async (appointment) => {
            //     if (
            //       appointment.prescription &&
            //       (appointment.prescription as any).signature
            //     ) {
            //       (appointment.prescription as any).signature = await getUrl(
            //         (appointment.prescription as any).signature
            //       );
            //     }
            //   })
            // );
            return appointments;
        }
        catch (error) {
            console.error("Error in getAppointments:", error);
            throw error;
        }
    }
    async acceptAppointment(id) {
        try {
            const accepted = await appointmentModel_1.default.findByIdAndUpdate(id, { $set: { status: "accepted" } }, { new: true }).exec();
            return accepted;
        }
        catch (error) {
            console.error("Error in acceptAppointment:", error);
            throw error;
        }
    }
    async completeAppointment(id) {
        try {
            const completed = await appointmentModel_1.default.findByIdAndUpdate(id, { $set: { status: "completed" } }, { new: true }).exec();
            return completed;
        }
        catch (error) {
            console.error("Error in completeAppointment:", error);
            throw error;
        }
    }
    // adding wallet balance to doctor after users successfull online payment........ so this is from booking service we make use of this
    async updateWalletTransaction(doctorId, fee, appointmentId) {
        try {
            const updatedDoctor = await doctorModel_1.default.findByIdAndUpdate(doctorId, {
                $inc: { "wallet.balance": fee },
                $push: {
                    "wallet.transactions": {
                        amount: fee,
                        transactionType: "credit",
                        description: `Payment received for appointment ${appointmentId}`,
                        date: new Date(),
                    },
                },
            }, { new: true });
            return updatedDoctor;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async deductFromDoctorWallet(doctorId, refundAmount) {
        try {
            console.log("deductFromDoctorWallet: Starting deduction for doctorId:", doctorId, "with refundAmount:", refundAmount);
            const doctor = await doctorModel_1.default.findById(doctorId);
            console.log("deductFromDoctorWallet: Retrieved doctor:", doctor);
            if (!doctor)
                throw new Error("Doctor not found for refund deduction");
            if (!doctor.wallet) {
                doctor.wallet = { balance: 0, transactions: [] };
            }
            doctor.wallet.balance -= refundAmount;
            console.log("deductFromDoctorWallet: Updated doctor wallet balance =", doctor.wallet.balance);
            doctor.wallet.transactions.push({
                amount: refundAmount,
                transactionType: "debit",
                description: "Refund issued due to appointment cancellation",
                date: new Date(),
            });
            console.log("deductFromDoctorWallet: Pushed transaction:", doctor.wallet.transactions[doctor.wallet.transactions.length - 1]);
            const savedDoctor = await doctor.save();
            console.log("deductFromDoctorWallet: Doctor saved successfully:", savedDoctor);
            return savedDoctor;
        }
        catch (error) {
            console.error("deductFromDoctorWallet: Error:", error);
            throw new Error(error.message);
        }
    }
    async updateDoctorAggregatedReview(doctorId) {
        try {
            const aggregatedReview = await appointmentModel_1.default.aggregate([
                {
                    $match: {
                        doctorId: new mongoose_1.default.Types.ObjectId(doctorId),
                        status: "completed",
                        "review.rating": { $gt: 0 },
                    },
                },
                {
                    $group: {
                        _id: "$doctorId",
                        averageRating: { $avg: "$review.rating" },
                        reviewCount: { $sum: 1 },
                    },
                },
            ]);
            let updatedDoctor;
            if (aggregatedReview.length > 0) {
                const { averageRating, reviewCount } = aggregatedReview[0];
                updatedDoctor = await doctorModel_1.default.findOneAndUpdate({ _id: doctorId }, { averageRating, reviewCount }, { new: true });
            }
            else {
                updatedDoctor = await doctorModel_1.default.findOneAndUpdate({ _id: doctorId }, { averageRating: 0, reviewCount: 0 }, { new: true });
            }
            return updatedDoctor;
        }
        catch (error) {
            console.error("Error in updateDoctorAggregatedReview:", error);
            throw new Error(error.message);
        }
    }
    async rescheduleAppointment(id, date, time, reason) {
        try {
            const rescheduled = await appointmentModel_1.default.findByIdAndUpdate(id, { $set: { date, time, reason } }, { new: true }).populate("patientId", "email");
            return rescheduled;
        }
        catch (error) {
            console.error("Error in rescheduleAppointment:", error);
            throw error;
        }
    }
    //for rescheduling ive to get the available slots of the doctor.................
    async getDoctorAvailableSlots(id) {
        try {
            const schedules = await slotModel_1.default.find({ doctor: id }).lean();
            return schedules;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDashboardStats(doctorId) {
        try {
            const doctorObjectId = new mongoose_1.default.Types.ObjectId(doctorId);
            // Get Doctor Profile including Image and other necessary fields
            const doctorData = await doctorModel_1.default
                .findById(doctorObjectId)
                .select("name speciality image monthlyTarget")
                .populate("speciality", "name");
            if (!doctorData) {
                throw new Error("Doctor not found");
            }
            // let imageUrl = "";
            // if (doctorData.image) {
            //   imageUrl = await getUrl(doctorData.image);
            // }
            // Convert Mongoose document to DoctorProfile interface
            const doctorProfile = {
                _id: doctorData._id.toString(), // Convert _id to a string
                name: doctorData.name,
                speciality: typeof doctorData.speciality === "object"
                    ? doctorData.speciality.name
                    : doctorData.speciality,
                image: doctorData.image || "",
            };
            const monthlyTarget = doctorData?.monthlyTarget || 50; // Default Target
            // Calculate Visits Today
            const visitsToday = await appointmentModel_1.default.countDocuments({
                doctorId: doctorObjectId,
                status: "accepted",
                date: { $gte: (0, date_1.startOfToday)(), $lt: (0, date_1.endOfToday)() },
            });
            // Visits Yesterday for Growth Percentage Calculation
            const visitsYesterday = await appointmentModel_1.default.countDocuments({
                doctorId: doctorObjectId,
                status: "accepted",
                date: { $gte: (0, startOfYesterday_1.startOfYesterday)(), $lt: (0, endOfYesterday_1.endOfYesterday)() },
            });
            const growthPercentage = visitsYesterday === 0
                ? visitsToday > 0
                    ? 100
                    : 0
                : ((visitsToday - visitsYesterday) / visitsYesterday) * 100;
            const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const nextMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
            const monthlyAchieved = await appointmentModel_1.default.countDocuments({
                doctorId: doctorObjectId,
                status: "completed",
                date: { $gte: currentMonthStart, $lt: nextMonthStart },
            });
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const newPatientsAgg = await appointmentModel_1.default.aggregate([
                { $match: { doctorId: doctorObjectId, status: "accepted" } },
                { $group: { _id: "$patientId", firstAppointment: { $min: "$date" } } },
                { $match: { firstAppointment: { $gte: oneWeekAgo } } },
                { $count: "newPatients" },
            ]);
            const newPatients = newPatientsAgg?.[0]?.newPatients ?? 0;
            // Count Old Patients
            const oldPatientsAgg = await appointmentModel_1.default.aggregate([
                { $match: { doctorId: doctorObjectId, status: "accepted" } },
                { $group: { _id: "$patientId", firstAppointment: { $min: "$date" } } },
                { $match: { firstAppointment: { $lt: oneWeekAgo } } },
                { $count: "oldPatients" },
            ]);
            const oldPatients = oldPatientsAgg?.[0]?.oldPatients ?? 0;
            // Total Appointments (accepted or completed)
            const totalAppointments = await appointmentModel_1.default.countDocuments({
                doctorId: doctorObjectId,
                status: { $in: ["accepted", "completed"] },
            });
            // Build the dashboard stats object
            const dashboardStats = {
                visitsToday,
                growthPercentage: Math.round(growthPercentage),
                monthlyTarget,
                monthlyAchieved,
                statCards: [
                    { label: "New Patients", value: newPatients, percentage: 0 },
                    { label: "Old Patients", value: oldPatients, percentage: 0 },
                    { label: "Appointments", value: totalAppointments, percentage: 0 },
                ],
            };
            return { stats: dashboardStats, doctorProfile };
        }
        catch (error) {
            console.error("Error in getDashboardStats:", error);
            throw new Error("Failed to fetch dashboard stats");
        }
    }
    async getGrowthData(doctorId, timeRange, dateParam) {
        try {
            const doctorObjectId = new mongoose_1.default.Types.ObjectId(doctorId);
            const currentDate = new Date();
            let startDate;
            let endDate;
            // Set up filtering based on time range
            if (timeRange === "daily") {
                if (!dateParam) {
                    throw new Error("Date is required for daily time range");
                }
                const selectedDate = new Date(dateParam);
                startDate = new Date(selectedDate.setHours(0, 0, 0, 0));
                endDate = new Date(selectedDate.setHours(23, 59, 59, 999));
            }
            else if (timeRange === "weekly") {
                startDate = new Date();
                startDate.setDate(currentDate.getDate() - 7);
                endDate = currentDate;
            }
            else if (timeRange === "monthly") {
                startDate = new Date();
                // Using a 30-day window; you could also use setMonth(currentDate.getMonth() - 1)
                startDate.setDate(currentDate.getDate() - 30);
                endDate = currentDate;
            }
            else if (timeRange === "yearly") {
                startDate = new Date();
                startDate.setFullYear(currentDate.getFullYear() - 1);
                endDate = currentDate;
            }
            else {
                // Fallback to all data if an invalid time range is provided
                startDate = new Date(0);
                endDate = currentDate;
            }
            // Build the match stage to filter by doctorId and the date range
            const matchStage = {
                doctorId: doctorObjectId,
                date: { $gte: startDate, $lte: endDate },
            };
            // Define grouping and projection based on the timeRange
            let groupId;
            let projectStage;
            if (timeRange === "daily") {
                // Group by hour for a single day
                groupId = { hour: { $hour: "$date" } };
                projectStage = {
                    $project: {
                        timeLabel: { $concat: [{ $toString: "$_id.hour" }, ":00"] },
                        newPatients: 1,
                        returningPatients: {
                            $subtract: ["$totalAppointments", "$newPatients"],
                        },
                        total: "$totalAppointments",
                        _id: 0,
                    },
                };
            }
            else if (timeRange === "weekly" || timeRange === "monthly") {
                // Group by day, month, and year
                groupId = {
                    day: { $dayOfMonth: "$date" },
                    month: { $month: "$date" },
                    year: { $year: "$date" },
                };
                projectStage = {
                    $project: {
                        timeLabel: {
                            $concat: [
                                { $toString: "$_id.day" },
                                "/",
                                { $toString: "$_id.month" },
                                "/",
                                { $toString: "$_id.year" },
                            ],
                        },
                        newPatients: 1,
                        returningPatients: {
                            $subtract: ["$totalAppointments", "$newPatients"],
                        },
                        total: "$totalAppointments",
                        _id: 0,
                    },
                };
            }
            else if (timeRange === "yearly") {
                // Group by month and year
                groupId = {
                    month: { $month: "$date" },
                    year: { $year: "$date" },
                };
                projectStage = {
                    $project: {
                        timeLabel: {
                            $concat: [
                                { $toString: "$_id.month" },
                                "/",
                                { $toString: "$_id.year" },
                            ],
                        },
                        newPatients: 1,
                        returningPatients: {
                            $subtract: ["$totalAppointments", "$newPatients"],
                        },
                        total: "$totalAppointments",
                        _id: 0,
                    },
                };
            }
            // Build and run the aggregation pipeline
            const growthAgg = await appointmentModel_1.default.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: groupId,
                        totalAppointments: { $sum: 1 },
                        newPatients: { $sum: { $cond: ["$isNewPatient", 1, 0] } },
                    },
                },
                { $sort: { _id: 1 } },
                projectStage,
            ]);
            return growthAgg;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDashboardHome(doctorId) {
        try {
            const doctorObjectId = new mongoose_1.default.Types.ObjectId(doctorId);
            const doctorProfile = await doctorModel_1.default
                .findById(doctorObjectId)
                .populate("speciality", "name")
                .lean();
            // if (doctorProfile && doctorProfile.image) {
            //   doctorProfile.image = await getUrl(doctorProfile.image);
            // }
            const visitsToday = await appointmentModel_1.default.countDocuments({
                doctorId: doctorObjectId,
                date: { $gte: (0, date_1.startOfToday)(), $lt: (0, date_1.endOfToday)() },
            });
            const monthlyAchieved = await appointmentModel_1.default.countDocuments({
                doctorId: doctorObjectId,
                status: "completed",
                date: { $gte: (0, date_1.startOfMonth)(), $lt: (0, date_1.endOfMonth)() },
            });
            const monthlyTarget = doctorProfile?.monthlyTarget || 50;
            const newPatientsAgg = await appointmentModel_1.default.aggregate([
                { $match: { doctorId: doctorObjectId } },
                {
                    $group: {
                        _id: "$patientId",
                        firstAppointment: { $min: "$date" },
                    },
                },
                {
                    $match: {
                        firstAppointment: { $gte: (0, date_1.startOfMonth)(), $lt: (0, date_1.endOfMonth)() },
                    },
                },
                { $count: "newPatients" },
            ]);
            const newPatients = newPatientsAgg[0]?.newPatients || 0;
            const oldPatientsAgg = await appointmentModel_1.default.aggregate([
                {
                    $match: {
                        doctorId: doctorObjectId,
                        date: { $gte: (0, date_1.startOfMonth)(), $lt: (0, date_1.endOfMonth)() },
                    },
                },
                {
                    $group: {
                        _id: "$patientId",
                        firstAppointment: { $min: "$date" },
                    },
                },
                {
                    $match: {
                        firstAppointment: { $lt: (0, date_1.startOfMonth)() },
                    },
                },
                { $count: "oldPatients" },
            ]);
            const oldPatients = oldPatientsAgg[0]?.oldPatients || 0;
            const totalAppointments = await appointmentModel_1.default.countDocuments({
                doctorId: doctorObjectId,
            });
            const avgVisitTimeAgg = await appointmentModel_1.default.aggregate([
                { $match: { doctorId: doctorObjectId, duration: { $exists: true } } },
                {
                    $group: {
                        _id: null,
                        avgDuration: { $avg: "$duration" },
                    },
                },
            ]);
            const avgVisitTime = Math.round(avgVisitTimeAgg[0]?.avgDuration || 0);
            const dashboardStats = {
                visitsToday,
                growthPercentage: 0,
                monthlyTarget,
                monthlyAchieved,
                statCards: [
                    { label: "New Patients", value: newPatients, percentage: 0 },
                    { label: "Old Patients", value: oldPatients, percentage: 0 },
                    { label: "Appointments", value: totalAppointments, percentage: 0 },
                    { label: "Avg. Visit Time", value: avgVisitTime },
                ],
            };
            const todaysAppointments = await appointmentModel_1.default.find({
                doctorId: doctorObjectId,
                status: "accepted",
                date: { $gte: (0, date_1.startOfToday)(), $lt: (0, date_1.endOfToday)() },
            })
                .populate("patientId", "name email gender age")
                .sort({ date: 1, time: 1 })
                .lean();
            const monthlyPatientIds = await appointmentModel_1.default.find({
                doctorId: doctorObjectId,
                date: { $gte: (0, date_1.startOfMonth)(), $lt: (0, date_1.endOfMonth)() },
            }).distinct("patientId");
            const patients = await userModel_1.default
                .find({ _id: { $in: monthlyPatientIds } })
                .lean();
            const demographics = patients.reduce((acc, patient) => {
                if (patient.gender === "male")
                    acc.male += 1;
                else if (patient.gender === "female")
                    acc.female += 1;
                if (patient.age !== undefined &&
                    patient.age >= 18 &&
                    patient.age <= 35)
                    acc.age18to35 += 1;
                return acc;
            }, { male: 0, female: 0, age18to35: 0 });
            return {
                image: doctorProfile?.image || null,
                doctorProfile,
                dashboardStats,
                todaysAppointments,
                demographics,
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.DoctorRepository = DoctorRepository;
