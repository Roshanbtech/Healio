import doctorModel from "../../model/doctorModel";
import serviceModel from "../../model/serviceModel";
import slotModel from "../../model/slotModel";
import { IDoctorRepository } from "../../interface/doctor/Auth.repository.interface";
import { Service, Schedule, UserProfile } from "../../interface/doctorInterface/Interface";
import bcrypt from "bcrypt";
import userModel from "../../model/userModel";
import ChatModel from "../../model/chatModel";

export class DoctorRepository implements IDoctorRepository {
  async getServices(): Promise<Service[]> {
    try {
      const services = await serviceModel.find({ isActive: true }).lean();
      return services;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addQualification(data: any, doctorId: string): Promise<any> {
    try {
      const updatedDoctor = await doctorModel.findByIdAndUpdate(
        doctorId,
        { $set: data },
        { new: true }
      );
      return updatedDoctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getQualifications(id: string): Promise<any> {
    try {
      const doctor = await doctorModel
        .findOne({ _id: id, docStatus: "approved" })
        .populate({ path: "speciality", model: "Service", select: "name" })
        .lean();
      if (!doctor) return null;
      return doctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getDoctorProfile(id: string): Promise<any> {
    try {
      const doctor = await doctorModel
        .findById(id)
        .populate({ path: "speciality", model: "Service", select: "name" })
        .lean();
      return doctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async editDoctorProfile(id: string, data: any): Promise<any> {
    try {
      const updatedDoctor = await doctorModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
      return updatedDoctor;
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
      const doctor = await doctorModel.findById(id);
      if (!doctor) throw new Error("Doctor not found");

      const isMatch = await bcrypt.compare(oldPassword, doctor.password);
      if (!isMatch) {
        return { status: false, message: "Old password is incorrect" };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await doctorModel.findByIdAndUpdate(id, {
        $set: { password: hashedPassword },
      });
      return { status: true, message: "Password changed successfully" };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addSchedule(scheduleData: Schedule): Promise<any> {
    try {
      const schedule = await slotModel.create(scheduleData);
      return {
        status: true,
        message: "Schedule added successfully",
        data: schedule,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getSchedule(id: string): Promise<any> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) {
        return { status: false, message: "Doctor not found" };
      }
      const schedule = await slotModel
        .find({ doctor: id })
        .populate({ path: "doctor", select: "name" })
        .lean();
      return schedule;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getUsers(): Promise<any> {
    try {
      const users = await userModel.find({}).lean();
      return users;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async uploadChatImage(chatId: string, file: Express.Multer.File): Promise<any> {
    try {
      const chat = await ChatModel.findById(chatId);
      
      if (!chat) {
        throw new Error('Chat not found');
      }

      const newMessage = {
        sender: 'doctor',
        message: '',
        type: 'img',
        deleted: false,
        read: false
      };

      return {
        chatId: chat._id,
        doctorId: chat.doctorId,
        userId: chat.userId,
        newMessage
      };
    } catch (error) {
      console.error('Error in chatImageUploads repository:', error);
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
        throw new Error('Failed to save chat message');
      }

      return updatedChat.messages[updatedChat.messages.length - 1];
    } catch (error) {
      console.error('Error saving chat image message:', error);
      throw error;
    }
  }
}
