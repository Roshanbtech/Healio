import doctorModel, { IDoctor } from "../../model/doctorModel";
import serviceModel from "../../model/serviceModel";
import slotModel from "../../model/slotModel";
import { IDoctorRepository } from "../../interface/doctor/Auth.repository.interface";
import {
  Service,
  Schedule,
  UserProfile,
} from "../../interface/doctorInterface/Interface";
import bcrypt from "bcrypt";
import userModel from "../../model/userModel";
import ChatModel from "../../model/chatModel";
import AppointmentModel, { IAppointment } from "../../model/appointmentModel";
import { Iuser } from "../../model/userModel";
import mongoose from "mongoose";

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

  async getAppointmentUsers(id: string): Promise<Iuser[]>{
    try{
     const appointments = await AppointmentModel.find({doctorId: id, status: "accepted"});
     if(!appointments || appointments.length === 0) return [];
      const userIds: string[] = [];
      for (let i = 0; i < appointments.length; i++) {
        const userId = appointments[i].patientId.toString();
        if (!userIds.includes(userId)) {
          userIds.push(userId);
        }
      }
      const userDetails = await userModel
        .find({ _id: { $in: userIds } })
        .select("-wallet -password");
      return userDetails;
    }catch(error: any){
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

  async getAppointments(id: string): Promise<any> {
    try {
      const appointments = await AppointmentModel.find({ doctorId: id })
        .populate('patientId', 'name email phone')  
        .populate('doctorId', 'name specialty')  
        .exec();
      return appointments;
    } catch (error: any) {
      console.error("Error in getAppointments:", error);
      throw error;
    }
  }

  async acceptAppointment(id: string): Promise<IAppointment | null>{
    try{
     const accepted = await AppointmentModel.findByIdAndUpdate(
      id,
      {$set: {status: "accepted"}},
      {new: true}
     ).exec();
     return accepted;
    }catch(error:any){
      console.error("Error in acceptAppointment:", error);
      throw error;
    }
  }

  async completeAppointment(id:string): Promise<IAppointment | null> {
    try{
      const completed = await AppointmentModel.findByIdAndUpdate(
        id,
        {$set: {status: "completed"}},
        {new: true}
      ).exec();
      return completed;
    }catch(error: any){
      console.error("Error in completeAppointment:", error);
      throw error;
    }
  }
  

  // adding wallet balance to doctor after users successfull online payment........ so this is from booking service we make use of this 
  async updateWalletTransaction(
    doctorId: string,
    fee: number,
    appointmentId: string
  ): Promise<any> {
    try {
      const updatedDoctor = await doctorModel.findByIdAndUpdate(
        doctorId,
        {
          $inc: { "wallet.balance": fee },
          $push: {
            "wallet.transactions": {
              amount: fee,
              transactionType: "credit",
              description: `Payment received for appointment ${appointmentId}`,
              date: new Date(),
            },
          },
        },
        { new: true }
      );
      return updatedDoctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async deductFromDoctorWallet(doctorId: string, refundAmount: number): Promise<IDoctor | null> {
    try {
      console.log("deductFromDoctorWallet: Starting deduction for doctorId:", doctorId, "with refundAmount:", refundAmount);
      const doctor = await doctorModel.findById(doctorId);
      console.log("deductFromDoctorWallet: Retrieved doctor:", doctor);
      if (!doctor) throw new Error("Doctor not found for refund deduction");
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
    } catch (error: any) {
      console.error("deductFromDoctorWallet: Error:", error);
      throw new Error(error.message);
    }
  }

  async updateDoctorAggregatedReview(doctorId: string): Promise<IDoctor | null> {
    try {
      const aggregatedReview = await AppointmentModel.aggregate([
        {
          $match: {
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: "completed",
            "review.rating": { $gt: 0 }
          }
        },
        {
          $group: {
            _id: "$doctorId",
            averageRating: { $avg: "$review.rating" },
            reviewCount: { $sum: 1 }
          }
        }
      ]);
  
      let updatedDoctor: IDoctor | null;
  
      if (aggregatedReview.length > 0) {
        const { averageRating, reviewCount } = aggregatedReview[0];
        updatedDoctor = await doctorModel.findOneAndUpdate(
          { _id: doctorId },
          { averageRating, reviewCount },
          { new: true }
        );
      } else {
        updatedDoctor = await doctorModel.findOneAndUpdate(
          { _id: doctorId },
          { averageRating: 0, reviewCount: 0 },
          { new: true }
        );
      }
      
      return updatedDoctor;
    } catch (error: any) {
      console.error("Error in updateDoctorAggregatedReview:", error);
      throw new Error(error.message);
    }
  }  

  async rescheduleAppointment(id: string, date: string, time: string, reason: string): Promise<IAppointment | null>{
    try{
      const rescheduled = await AppointmentModel.findByIdAndUpdate(
        id,
        {$set: {date, time, reason}},
        {new: true}
      ).populate("patientId", "email");
      return rescheduled;
    }catch(error:any){
      console.error("Error in rescheduleAppointment:", error);
      throw error;
    }
  }

  //for rescheduling ive to get the available slots of the doctor.................
   async getDoctorAvailableSlots(id: string): Promise<any> {
      try {
        const schedules = await slotModel.find({ doctor: id }).lean();
        return schedules;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
    
}
