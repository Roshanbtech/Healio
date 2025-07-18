"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const userModel_1 = __importDefault(require("../../model/userModel"));
const doctorModel_1 = __importDefault(require("../../model/doctorModel"));
const serviceModel_1 = __importDefault(require("../../model/serviceModel"));
const slotModel_1 = __importDefault(require("../../model/slotModel"));
const appointmentModel_1 = __importDefault(require("../../model/appointmentModel"));
const pagination_1 = require("../../helper/pagination");
const bcrypt_1 = __importDefault(require("bcrypt"));
const chatModel_1 = __importDefault(require("../../model/chatModel"));
// import { getUrl } from "../../helper/getUrl";
class UserRepository {
    async getDoctors(options) {
        try {
            const doctors = await (0, pagination_1.paginate)(doctorModel_1.default, {
                ...options,
                populate: { path: "speciality", select: "name" },
            }, { isDoctor: true, isBlocked: false });
            // for (const doctor of doctors.data) {
            //   if (doctor.image) {
            //     doctor.image = await getUrl(doctor.image);
            //   }
            // }
            return doctors;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getDoctorDetails(id) {
        try {
            const doctor = await doctorModel_1.default
                .findById(id)
                .populate({ path: "speciality", select: "name" })
                .lean();
            // if(doctor && doctor.image){
            //   doctor.image = await getUrl(doctor.image);
            // }
            return doctor;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getServices() {
        try {
            const services = await serviceModel_1.default.find({ isActive: true }).lean();
            return services;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getUserProfile(id) {
        try {
            const user = await userModel_1.default.findById(id);
            if (!user)
                return null;
            // if(user.image){
            //   user.image = await getUrl(user.image);
            // }
            return user;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async editUserProfile(id, data) {
        try {
            const updatedUser = await userModel_1.default.findByIdAndUpdate(id, { $set: data }, { new: true });
            return updatedUser;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async changePassword(id, oldPassword, newPassword) {
        try {
            const user = await userModel_1.default.findById(id);
            if (!user)
                throw new Error("Doctor not found");
            const isMatch = await bcrypt_1.default.compare(oldPassword, user.password);
            if (!isMatch) {
                return { status: false, message: "Old password is incorrect" };
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            await userModel_1.default.findByIdAndUpdate(id, {
                $set: { password: hashedPassword },
            });
            return { status: true, message: "Password changed successfully" };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getScheduleForDoctor(id) {
        try {
            const schedules = await slotModel_1.default.find({ doctor: id }).lean();
            return schedules;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getAppointmentDoctors(id) {
        try {
            const appointments = await appointmentModel_1.default.find({
                patientId: id,
                status: "accepted",
            });
            if (!appointments || appointments.length === 0)
                return [];
            const doctorIds = [];
            for (let i = 0; i < appointments.length; i++) {
                const docId = appointments[i].doctorId.toString();
                if (!doctorIds.includes(docId)) {
                    doctorIds.push(docId);
                }
            }
            const doctorDetails = await doctorModel_1.default
                .find({ _id: { $in: doctorIds } })
                .select("-wallet -password -certificate")
                .populate({ path: "speciality", select: "name" });
            // for(const doctor of doctorDetails){
            //   if(doctor.image){
            //     doctor.image = await getUrl(doctor.image);
            //   }
            // }
            return doctorDetails;
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
                sender: "user",
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
    async refundToUser(userId, refundAmount) {
        try {
            console.log("refundToUser: Starting refund for userId:", userId, "with refundAmount:", refundAmount);
            const user = await userModel_1.default.findById(userId);
            console.log("refundToUser: Retrieved user:", user);
            if (!user)
                throw new Error("User not found for refund");
            // Ensure __v is a number
            if (user.__v == null) {
                user.__v = 0;
            }
            if (!user.wallet) {
                user.wallet = { balance: 0, transactions: [] };
            }
            user.wallet.balance += refundAmount;
            console.log("refundToUser: Updated wallet balance =", user?.wallet.balance);
            user.wallet.transactions.push({
                amount: refundAmount,
                transactionType: "credit",
                description: `Refund for cancelled appointment from ${user.name}`,
                date: new Date(),
            });
            console.log("refundToUser: Pushed transaction:", user.wallet.transactions[user.wallet.transactions.length - 1]);
            await user.save();
            console.log("refundToUser: User saved successfully");
            return user;
        }
        catch (error) {
            console.error("refundToUser: Error:", error);
            throw error;
        }
    }
}
exports.UserRepository = UserRepository;
