import doctorModel, { IDoctor } from "../../model/doctorModel";
import serviceModel from "../../model/serviceModel";
import slotModel, { ISchedule } from "../../model/slotModel";
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
import { isScheduleExpired } from "../../helper/schedule";
import { DashboardHomeData, DashboardStatsData, DashboardStatsResponse, DoctorProfile, GrowthChartData } from "../../interface/doctorInterface/dashboardInterface";
import { ObjectId } from "mongoose";
import { endOfToday, startOfToday, startOfMonth, endOfMonth } from  "../../helper/date";
import { startOfYesterday } from "date-fns/startOfYesterday";
import { endOfYesterday } from "date-fns/endOfYesterday";

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
      const schedules = await slotModel
        .find({ doctor: id })
        .populate({ path: "doctor", select: "name" })
        .lean();
      const activeSchedules = schedules.filter(
        (schedule: ISchedule) => !isScheduleExpired(schedule)
      );
      return activeSchedules;
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

    async getDashboardStats(doctorId: string): Promise<DashboardStatsResponse | null> {
      try {
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
    
        // Get Doctor Profile including Image and other necessary fields
        const doctorData = await doctorModel
          .findById(doctorObjectId)
          .select("name speciality image monthlyTarget")
          .populate("speciality", "name");
    
        if (!doctorData) {
          throw new Error("Doctor not found");
        }
    
        // Convert Mongoose document to DoctorProfile interface
        const doctorProfile: DoctorProfile = {
          _id: (doctorData._id as mongoose.Types.ObjectId).toString(), // Convert _id to a string
          name: doctorData.name,
          speciality:
            typeof doctorData.speciality === "object"
              ? (doctorData.speciality as any).name
              : doctorData.speciality,
          image: doctorData.image || ""
        };
    
        const monthlyTarget = (doctorData as any)?.monthlyTarget || 50; // Default Target
    
        // Calculate Visits Today
        const visitsToday = await AppointmentModel.countDocuments({
          doctorId: doctorObjectId,
          status: "accepted",
          date: { $gte: startOfToday(), $lt: endOfToday() },
        });
    
        // Visits Yesterday for Growth Percentage Calculation
        const visitsYesterday = await AppointmentModel.countDocuments({
          doctorId: doctorObjectId,
          status: "accepted",
          date: { $gte: startOfYesterday(), $lt: endOfYesterday() },
        });
    
        const growthPercentage =
          visitsYesterday === 0 ? (visitsToday > 0 ? 100 : 0)
          : ((visitsToday - visitsYesterday) / visitsYesterday) * 100;
    
        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const nextMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
        const monthlyAchieved = await AppointmentModel.countDocuments({
          doctorId: doctorObjectId,
          status: "completed",
          date: { $gte: currentMonthStart, $lt: nextMonthStart },
        });
    
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
        const newPatientsAgg = await AppointmentModel.aggregate([
          { $match: { doctorId: doctorObjectId, status: "accepted" } },
          { $group: { _id: "$patientId", firstAppointment: { $min: "$date" } } },
          { $match: { firstAppointment: { $gte: oneWeekAgo } } },
          { $count: "newPatients" },
        ]);
        const newPatients = newPatientsAgg?.[0]?.newPatients ?? 0;
    
        // Count Old Patients
        const oldPatientsAgg = await AppointmentModel.aggregate([
          { $match: { doctorId: doctorObjectId, status: "accepted" } },
          { $group: { _id: "$patientId", firstAppointment: { $min: "$date" } } },
          { $match: { firstAppointment: { $lt: oneWeekAgo } } },
          { $count: "oldPatients" },
        ]);
        const oldPatients = oldPatientsAgg?.[0]?.oldPatients ?? 0;
    
        // Total Appointments (accepted or completed)
        const totalAppointments = await AppointmentModel.countDocuments({
          doctorId: doctorObjectId,
          status: { $in: ["accepted", "completed"] },
        });
    
        // Build the dashboard stats object
        const dashboardStats: DashboardStatsData = {
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
      } catch (error: any) {
        console.error("Error in getDashboardStats:", error);
        throw new Error("Failed to fetch dashboard stats");
      }
    }
    
    
    
    async getGrowthData(doctorId: string): Promise<GrowthChartData[]> {
      try {
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
       // This is a conceptual example and might require adjustments based on your schema:
const growthAgg = await AppointmentModel.aggregate([
  { $match: { doctorId: doctorObjectId } },
  // Group by patient and month/year to get first appointment per patient
  {
    $group: {
      _id: {
        patientId: "$patientId",
        month: { $month: "$date" },
        year: { $year: "$date" }
      },
      firstAppointment: { $min: "$date" },
      appointmentsInMonth: { $sum: 1 }
    }
  },
  // Separate new and returning patients per month
  {
    $group: {
      _id: { month: "$_id.month", year: "$_id.year" },
      newPatients: {
        $sum: {
          $cond: [{ $eq: ["$firstAppointment", "$$ROOT.firstAppointment"] }, 1, 0]
        }
      },
      totalAppointments: { $sum: "$appointmentsInMonth" }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } },
  {
    $project: {
      month: {
        $concat: [{ $toString: "$_id.month" }, "/", { $toString: "$_id.year" }],
      },
      newPatients: 1,
      returningPatients: { $subtract: ["$totalAppointments", "$newPatients"] },
      total: "$totalAppointments",
      _id: 0,
    },
  },
]);

        return growthAgg;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }    
    async getDashboardHome(doctorId: string): Promise<DashboardHomeData> {
      try {
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
  
        const doctorProfile = await doctorModel
          .findById(doctorObjectId)
          .populate("speciality", "name")
          .lean();
  
        const visitsToday = await AppointmentModel.countDocuments({
          doctorId: doctorObjectId,
          date: { $gte: startOfToday(), $lt: endOfToday() },
        });
  
        const monthlyAchieved = await AppointmentModel.countDocuments({
          doctorId: doctorObjectId,
          status: "completed",
          date: { $gte: startOfMonth(), $lt: endOfMonth() },
        });
        const monthlyTarget = (doctorProfile as any)?.monthlyTarget || 50;
  
        const newPatientsAgg = await AppointmentModel.aggregate([
          { $match: { doctorId: doctorObjectId } },
          {
            $group: {
              _id: "$patientId",
              firstAppointment: { $min: "$date" },
            },
          },
          {
            $match: {
              firstAppointment: { $gte: startOfMonth(), $lt: endOfMonth() },
            },
          },
          { $count: "newPatients" },
        ]);
        const newPatients = newPatientsAgg[0]?.newPatients || 0;
  
        const oldPatientsAgg = await AppointmentModel.aggregate([
          { $match: { doctorId: doctorObjectId, date: { $gte: startOfMonth(), $lt: endOfMonth() } } },
          {
            $group: {
              _id: "$patientId",
              firstAppointment: { $min: "$date" },
            },
          },
          {
            $match: {
              firstAppointment: { $lt: startOfMonth() },
            },
          },
          { $count: "oldPatients" },
        ]);
        const oldPatients = oldPatientsAgg[0]?.oldPatients || 0;
  
        const totalAppointments = await AppointmentModel.countDocuments({ doctorId: doctorObjectId });
  
        const avgVisitTimeAgg = await AppointmentModel.aggregate([
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
  
        const todaysAppointments = await AppointmentModel.find({
          doctorId: doctorObjectId,
          status: "accepted",
          date: { $gte: startOfToday(), $lt: endOfToday() },
        })
          .populate("patientId", "name email gender age")
          .sort({ date: 1, time: 1 })
          .lean();
  
     
        const monthlyPatientIds = await AppointmentModel.find({
          doctorId: doctorObjectId,
          date: { $gte: startOfMonth(), $lt: endOfMonth() },
        }).distinct("patientId");
  
        const patients = await userModel.find({ _id: { $in: monthlyPatientIds } }).lean();
  
        const demographics = patients.reduce(
          (acc, patient) => {
            if (patient.gender === "male") acc.male += 1;
            else if (patient.gender === "female") acc.female += 1;
            if (patient.age !== undefined && patient.age >= 18 && patient.age <= 35) acc.age18to35 += 1;
            return acc;
          },
          { male: 0, female: 0, age18to35: 0 }
        );
  
        return {
          doctorProfile,
          dashboardStats,
          todaysAppointments,
          demographics,
        };
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
}
