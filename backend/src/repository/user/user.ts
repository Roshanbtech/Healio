import userModel, { Iuser } from "../../model/userModel";
import doctorModel, { IDoctor} from "../../model/doctorModel";
import serviceModel from "../../model/serviceModel";
import slotModel from "../../model/slotModel";
import AppointmentModel from "../../model/appointmentModel";
import { Schedule } from "../../interface/doctorInterface/Interface";
import {
  DoctorDetails,
  Service,

} from "../../interface/userInterface/interface";
import { IUserRepository } from "../../interface/user/User.repository.interface";
import { paginate, PaginationOptions } from "../../helper/pagination";
import bcrypt from "bcrypt";
import ChatModel from "../../model/chatModel";

export class UserRepository implements IUserRepository {
  async getDoctors(options: PaginationOptions): Promise<any> {
    try {
      const doctors = await paginate(
        doctorModel,
        {
          ...options,
          populate: { path: "speciality", select: "name" },
        },
        { isDoctor: true, isBlocked: false }
      );
      return doctors;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getDoctorDetails(id: string): Promise<any> {
    try {
      const doctor = await doctorModel
        .findById(id)
        .populate({ path: "speciality", select: "name" })
        .lean();
      return doctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getServices(): Promise<any> {
    try {
      const services = await serviceModel.find({ isActive: true }).lean();
      return services;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async getUserProfile(id: string): Promise<any> {
    try {
      const user = await userModel.findById(id);
      if (!user) return null;
      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async editUserProfile(id: string, data: any): Promise<any> {
    try {
      const updatedUser = await userModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<any> {
    try {
      const user = await userModel.findById(id);
      if (!user) throw new Error("Doctor not found");

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return { status: false, message: "Old password is incorrect" };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userModel.findByIdAndUpdate(id, {
        $set: { password: hashedPassword },
      });
      return { status: true, message: "Password changed successfully" };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async getScheduleForDoctor(id: string): Promise<any> {
    try {
      const schedules = await slotModel.find({ doctor: id }).lean();
      return schedules;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getAppointmentDoctors(id: string): Promise<IDoctor[]> {
    try {
      const appointments = await AppointmentModel.find({ patientId: id, status: "accepted" });
      if (!appointments || appointments.length === 0) return [];
      const doctorIds: string[] = [];
      for (let i = 0; i < appointments.length; i++) {
        const docId = appointments[i].doctorId.toString();
        if (!doctorIds.includes(docId)) {
          doctorIds.push(docId);
        }
      }
      const doctorDetails = await doctorModel
        .find({ _id: { $in: doctorIds } })
        .select("-wallet -password -certificate")
        .populate({ path: "speciality", select: "name" });
      return doctorDetails;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  

  async uploadChatImage(
    chatId: string,
    file: Express.Multer.File
  ): Promise<any> {
    try {
      const chat = await ChatModel.findById(chatId);

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
    } catch (error) {
      console.error("Error in chatImageUploads repository:", error);
      throw error;
    }
  }

  async saveChatImageMessage(chatId: string, messageData: any): Promise<any> {
    try {
      const updatedChat = await ChatModel.findByIdAndUpdate(
        chatId,
        { $push: { messages: messageData } },
        { new: true }
      );

      if (!updatedChat) {
        throw new Error("Failed to save chat message");
      }

      return updatedChat.messages[updatedChat.messages.length - 1];
    } catch (error) {
      console.error("Error saving chat image message:", error);
      throw error;
    }
  }

  async refundToUser(userId: string, refundAmount: number): Promise<Iuser> {
    try {
      console.log("refundToUser: Starting refund for userId:", userId, "with refundAmount:", refundAmount);
      const user = await userModel.findById(userId);
      console.log("refundToUser: Retrieved user:", user);
      if (!user) throw new Error("User not found for refund");
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
    } catch (error: any) {
      console.error("refundToUser: Error:", error);
      throw error;
    }
  }
  
  
}
