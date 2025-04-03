import userModel from "../../model/userModel";
import doctorModel from "../../model/doctorModel";
import serviceModel from "../../model/serviceModel";
import couponModel from "../../model/couponModel";
import { paginate, PaginationOptions } from "../../helper/pagination";
import { IAuthRepository } from "../../interface/admin/Auth.repository.interface";
import sendMail from "../../config/emailConfig";
import AppointmentModel, { IAppointment } from "../../model/appointmentModel";
import { IDashboardStats, ITopDoctor, ITopUser, IAppointmentAnalytics } from "../../interface/adminInterface/dashboard";
import { getUrl } from "../../helper/getUrl";

export class AuthRepository implements IAuthRepository {
  async logout(refreshToken: string): Promise<any> {
    try {
      console.log(refreshToken, "refresh token");
      return await userModel.updateOne(
        { refreshToken },
        { $set: { refreshToken: "" } }
      );
      console.log("Logout successful");
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  async getAllUsers(options: PaginationOptions): Promise<any> {
    try {
      const projection = "-password -__v -wallet -userId -createdAt -updatedAt";
      const updatedOptions = { ...options, select: projection };
      const users = await paginate(userModel, updatedOptions, {});
      for(const user of users.data){
        if(user.image){
          user.image = await getUrl(user.image);
        }
      }
      return users;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getAllDoctors(options: PaginationOptions): Promise<any> {
    try {
      const paginationOptions: PaginationOptions = {
        ...options,
        select: "-password -__v -createdAt -updatedAt -wallet -averageRating -reviewCount",
        populate: { path: "speciality", model: "Service", select: "name" },
      };
  
      const doctors = await paginate(doctorModel, paginationOptions, {});
      for(const doctor of doctors.data){
        if(doctor.image){
          doctor.image = await getUrl(doctor.image);
        }
      }
      return doctors;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleUser(id: string): Promise<any> {
    try {
      const user = await userModel.findById(id);
      if (!user) return null;

      user.isBlocked = !user.isBlocked;
      await user.save();

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleDoctor(id: string): Promise<any> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;

      doctor.isBlocked = !doctor.isBlocked;
      await doctor.save();

      return doctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addService(name: string, isActive: boolean): Promise<any> {
    const service = new serviceModel({ name, isActive });
    return await service.save();
  }

  async createCoupon(couponData: any): Promise<any> {
    try {
      const coupon = new couponModel(couponData);
      return await coupon.save();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getAllCoupons(options: PaginationOptions): Promise<any> {
    try {
      const coupons = await paginate(couponModel, options, {});
      return coupons;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async existCoupon(code: string): Promise<any> {
    try {
      return await couponModel.findOne({ code });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async editService(id: string, name: string, isActive: boolean): Promise<any> {
    const service = await serviceModel.findById(id);
    if (!service) return null;

    service.name = name;
    service.isActive = isActive;
    return await service.save();
  }

  async editCoupon(id: string, couponData: any): Promise<any> {
    try {
      const coupon = await couponModel.findById(id);
      if (!coupon) return null;
      coupon.name = couponData.name;
      coupon.code = couponData.code;
      coupon.discount = couponData.discount;
      coupon.startDate = couponData.startDate;
      coupon.expirationDate = couponData.expirationDate;
      coupon.isActive = couponData.isActive;
      return await coupon.save();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleService(id: string): Promise<any> {
    try {
      const service = await serviceModel.findById(id);
      if (!service) return null;

      service.isActive = !service.isActive;
      await service.save();

      return service;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleCoupon(id: string): Promise<any> {
    try {
      const coupon = await couponModel.findById(id);
      if (!coupon) return null;
      coupon.isActive = !coupon.isActive;
      await coupon.save();
      return coupon;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getAllServices(options: PaginationOptions): Promise<any> {
    try {
      const services = await paginate(serviceModel, options, {});
      return services;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async findServiceByName(name: string): Promise<any> {
    try {
      const service = await serviceModel.findOne({ name });
      return service;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCertificates(id: string): Promise<any> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;
      return doctor.certificate;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async approveDoctor(id: string): Promise<any> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;
      const emailContent = `Hello Dr. ${doctor.name},

Congratulations! Your account has been approved as a doctor in the Healio team.

Thank you,
Team Healio`;
      await sendMail(doctor.email, "Account Approved", emailContent);
      return await doctorModel.findByIdAndUpdate(
        id,
        { docStatus: "approved", isDoctor: true, rejectionReason: "" },
        { new: true }
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async rejectDoctor(id: string, reason: string): Promise<any> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;
      const emailContent = `Hello Dr. ${doctor.name},
  
  We regret to inform you that your account has been rejected as a doctor in the Healio team.
  Because, ${reason}.
  
  Thank you,
  Team Healio`;
      await sendMail(doctor.email, "Account Rejected", emailContent);
      return await doctorModel.findByIdAndUpdate(
        id,
        { docStatus: "rejected", isDoctor: false, rejectionReason: reason },
        { new: true }
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async fetchDashboardStats(): Promise<IDashboardStats> {
    try {
      const totalCustomers = await userModel.countDocuments({});
      const totalDoctors = await doctorModel.countDocuments({$or: [{ isDoctor: true }, { docStatus: "approved" }] });
      const completedBookings = await AppointmentModel.countDocuments({ status: "completed" });
      const revenueResult = await AppointmentModel.aggregate([
        { $match: { status: "completed", fees: { $exists: true } } },
        { $group: { _id: null, totalRevenue: { $sum: "$fees" } } }
      ]);
      const totalRevenue = revenueResult[0]?.totalRevenue || 0;
      return { totalCustomers, totalDoctors, completedBookings, totalRevenue };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  async fetchTopDoctors(): Promise<ITopDoctor[]> {
    try {
      const topDoctors = await AppointmentModel.aggregate([
        { $match: { status: "completed" } },
        { 
          $group: {
            _id: "$doctorId",
            appointmentsCount: { $sum: 1 },
            totalEarnings: { $sum: "$fees" }
          }
        },
        { 
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctorDetails"
          }
        },
        { $unwind: "$doctorDetails" },
        { 
          $addFields: {
            "doctorDetails.averageRating": { $ifNull: [ "$doctorDetails.averageRating", 0 ] }
          }
        },
        { 
          $sort: { 
            appointmentsCount: -1,
            "doctorDetails.averageRating": -1 
          }
        },
        { $limit: 5 }
      ]);
  
      for (const doctor of topDoctors) {
        if (doctor.doctorDetails.image) {
          doctor.doctorDetails.image = await getUrl(doctor.doctorDetails.image);
        }
      }
      return topDoctors;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  async fetchTopUsers(): Promise<ITopUser[]> {
    try {
      const topUsers = await AppointmentModel.aggregate([
        { $group: {
            _id: "$patientId",
            bookingsCount: { $sum: 1 },
            totalSpent: { $sum: "$fees" },
            lastVisit: { $max: "$date" }
        }},
        { $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails"
        }},
        { $unwind: "$userDetails" },
        { 
          $addFields: {
            "userDetails.averageRating": { $ifNull: [ "$userDetails.averageRating", 0 ] }
          }
        },
        { 
          $sort: { 
            appointmentsCount: -1,
            "userDetails.averageRating": -1 
          }
        },
        { $limit: 5 }
      ]);
      for (const user of topUsers) {
        if (user.userDetails.image) {
          user.userDetails.image = await getUrl(user.userDetails.image);
        }
      }
      return topUsers;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  

  async fetchAppointmentAnalytics(timeFrame: string): Promise<IAppointmentAnalytics[]> {
    try {
      if (timeFrame === "weekly") {
        const analytics = await AppointmentModel.aggregate([
          {
            $group: {
              _id: { dayOfWeek: { $dayOfWeek: "$date" } },
              completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
              canceled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } }
            }
          },
          {
            $project: {
              _id: 0,
              dayOfWeek: "$_id.dayOfWeek",
              completed: 1,
              canceled: 1
            }
          },
          { $sort: { dayOfWeek: 1 } }
        ]);
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const transformedAnalytics = analytics.map(item => ({
          _id: weekDays[item.dayOfWeek - 1], 
          completed: item.completed,
          canceled: item.canceled
        }));
        return transformedAnalytics;
      } else {
        const groupFormat = {
          daily: "%Y-%m-%d",
          monthly: "%Y-%m",
          yearly: "%Y"
        }[timeFrame] || "%Y-%m-%d";
    
        const analytics = await AppointmentModel.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: groupFormat, date: "$date" } },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
              },
              canceled: {
                $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
              }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        return analytics;
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async fetchReports(
    startDate: Date,
    endDate: Date,
    status: string,
    options: PaginationOptions
  ): Promise<{
    data: IAppointment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const query: Record<string, any> = {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["completed", "cancelled"] }
      };
  
      if (status) {
        query.status = status;
      }
  
      // Add the select field in the options
      const paginatedResult = await paginate(AppointmentModel, {
        ...options,
        select: 'appointmentId date time status fees paymentMethod paymentStatus couponCode couponDiscount isApplied createdAt updatedAt',
        populate: [
          { path: "doctorId", select: "name email phone docStatus fees averageRating" },
          { path: "patientId", select: "name email phone address" }
        ]
      }, query);
  
      return paginatedResult;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  
}
