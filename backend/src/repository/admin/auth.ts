import userModel, { Iuser } from "../../model/userModel";
import doctorModel, { IDoctor } from "../../model/doctorModel";
import serviceModel from "../../model/serviceModel";
import couponModel, { ICoupon } from "../../model/couponModel";
import { paginate, PaginationOptions } from "../../helper/pagination";
import { IAuthRepository } from "../../interface/admin/Auth.repository.interface";
import { UserListResponse } from "../../interface/adminInterface/userlist";
import AppointmentModel, { IAppointment } from "../../model/appointmentModel";
import {
  IDashboardStats,
  ITopDoctor,
  ITopUser,
  IAppointmentAnalytics,
} from "../../interface/adminInterface/dashboard";
// import { getUrl } from "../../helper/getUrl";
import { DoctorListResponse } from "../../interface/adminInterface/doctorlist";
import {
  ServiceListResponse,
  Service,
} from "../../interface/adminInterface/serviceInterface";
import {
  Coupon,
  CouponListResponse,
} from "../../interface/adminInterface/couponlist";

export class AuthRepository implements IAuthRepository {
  async getAllUsers(
    options: PaginationOptions
  ): Promise<Omit<UserListResponse, "status">> {
    try {
      const projection = "-password -__v -wallet -userId -createdAt -updatedAt";
      const updatedOptions = { ...options, select: projection };
      const users = await paginate(userModel, updatedOptions, {});
      // for (const user of users.data) {
      //   if (user.image) {
      //     user.image = await getUrl(user.image);
      //   }
      // }
      return users;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while fetching users.");
    }
  }

  async getAllDoctors(
    options: PaginationOptions
  ): Promise<Omit<DoctorListResponse, "status">> {
    try {
      const paginationOptions: PaginationOptions = {
        ...options,
        select:
          "-password -__v -createdAt -updatedAt -wallet -averageRating -reviewCount",
        populate: { path: "speciality", model: "Service", select: "name" },
      };

      const doctors = await paginate(doctorModel, paginationOptions, {});
      // for (const doctor of doctors.data) {
      //   if (doctor.image) {
      //     doctor.image = await getUrl(doctor.image);
      //   }
      // }
      return doctors;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while fetching doctors.");
    }
  }

  async toggleUser(id: string): Promise<Iuser | null> {
    try {
      const user = await userModel.findById(id);
      if (!user) return null;

      user.isBlocked = !user.isBlocked;
      await user.save();
      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while toggling the user.");
    }
  }

  async toggleDoctor(id: string): Promise<IDoctor | null> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;

      doctor.isBlocked = !doctor.isBlocked;
      await doctor.save();
      return doctor;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while toggling the doctor.");
    }
  }

  async addService(name: string, isActive: boolean): Promise<Service | null> {
    try {
      const service = new serviceModel({ name, isActive });
      return await service.save();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while adding the service.");
    }
  }

  async createCoupon(couponData: Coupon): Promise<ICoupon | null> {
    try {
      const coupon = new couponModel(couponData);
      return await coupon.save();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while creating the coupon.");
    }
  }

  async getAllCoupons(
    options: PaginationOptions
  ): Promise<Omit<CouponListResponse, "status">> {
    try {
      const coupons = await paginate(couponModel, options, {});
      return coupons;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while fetching coupons");
    }
  }

  async existCoupon(code: string): Promise<boolean> {
    try {
      const existing = await couponModel.findOne({ code });
      return !!existing;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error checking coupon existence.");
    }
  }

  async editService(
    id: string,
    name: string,
    isActive: boolean
  ): Promise<Service | null> {
    try {
      const service = await serviceModel.findById(id);
      if (!service) return null;
      service.name = name;
      service.isActive = isActive;
      return await service.save();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while editing the service.");
    }
  }

  async editCoupon(id: string, couponData: Coupon): Promise<ICoupon | null> {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while editing the coupon.");
    }
  }

  async toggleService(id: string): Promise<Service | null> {
    try {
      const service = await serviceModel.findById(id);
      if (!service) return null;

      service.isActive = !service.isActive;
      await service.save();

      return service;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while toggling the service.");
    }
  }

  async toggleCoupon(id: string): Promise<ICoupon | null> {
    try {
      const coupon = await couponModel.findById(id);
      if (!coupon) return null;
      coupon.isActive = !coupon.isActive;
      await coupon.save();
      return coupon;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while toggling the coupon.");
    }
  }

  async getAllServices(
    options: PaginationOptions
  ): Promise<Omit<ServiceListResponse, "status">> {
    try {
      const services = await paginate(serviceModel, options, {});
      return services;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while fetching services.");
    }
  }

  async findServiceByName(name: string): Promise<Service | null> {
    try {
      const service = await serviceModel.findOne({ name });
      return service;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while finding the service.");
    }
  }

  async getCertificates(id: string): Promise<string[] | null> {
    try {
      const doctor = await doctorModel.findById(id).select("certificate");
      return doctor?.certificate ?? null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while fetching certificates.");
    }
  }

  async approveDoctor(id: string): Promise<IDoctor | null> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;
      const approvedDoctor = await doctorModel.findByIdAndUpdate(
        id,
        { docStatus: "approved", isDoctor: true, rejectionReason: "" },
        { new: true }
      );
      return approvedDoctor ?? null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while approving the doctor.");
    }
  }

  // async doctorProfile(id: string): Promise<Partial<IDoctor>|null>{
  //   try{
  //     const doctor = await doctorModel.findById(id);
  //     if(!doctor){
  //       return null;
  //     }
  //     const isProfileUpdated = doctor.isUpdated;
  //     return {isProfileUpdated};
  //   }catch(error:unknown){
  //     if(error instanceof Error){
  //       throw new Error(error.message)
  //     }
  //   }
  // }

  async rejectDoctor(id: string, reason: string): Promise<IDoctor | null> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;
      const rejectedDoctor = await doctorModel.findByIdAndUpdate(
        id,
        { docStatus: "rejected", isDoctor: false, rejectionReason: reason },
        { new: true }
      );
      return rejectedDoctor ?? null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while rejecting the doctor.");
    }
  }

  async fetchDashboardStats(): Promise<IDashboardStats> {
    try {
      const totalCustomers = await userModel.countDocuments({});
      const totalDoctors = await doctorModel.countDocuments({
        $or: [{ isDoctor: true }, { docStatus: "approved" }],
      });
      const completedBookings = await AppointmentModel.countDocuments({
        status: "completed",
      });
      const revenueResult = await AppointmentModel.aggregate([
        { $match: { status: "completed", fees: { $exists: true } } },
        { $group: { _id: null, totalRevenue: { $sum: "$fees" } } },
      ]);
      const totalRevenue = revenueResult[0]?.totalRevenue || 0;
      return { totalCustomers, totalDoctors, completedBookings, totalRevenue };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error(
        "An unknown error occurred while fetching dashboard stats."
      );
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
            totalEarnings: { $sum: "$fees" },
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        { $unwind: "$doctorDetails" },
        {
          $addFields: {
            "doctorDetails.averageRating": {
              $ifNull: ["$doctorDetails.averageRating", 0],
            },
          },
        },
        {
          $sort: {
            appointmentsCount: -1,
            "doctorDetails.averageRating": -1,
          },
        },
        { $limit: 5 },
      ]);

      // for (const doctor of topDoctors) {
      //   if (doctor.doctorDetails.image) {
      //     doctor.doctorDetails.image = await getUrl(doctor.doctorDetails.image);
      //   }
      // }
      return topDoctors;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while fetching top doctors.");
    }
  }

  async fetchTopUsers(): Promise<ITopUser[]> {
    try {
      const topUsers = await AppointmentModel.aggregate([
        {
          $group: {
            _id: "$patientId",
            bookingsCount: { $sum: 1 },
            totalSpent: { $sum: "$fees" },
            lastVisit: { $max: "$date" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $addFields: {
            "userDetails.averageRating": {
              $ifNull: ["$userDetails.averageRating", 0],
            },
          },
        },
        {
          $sort: {
            appointmentsCount: -1,
            "userDetails.averageRating": -1,
          },
        },
        { $limit: 5 },
      ]);
      // for (const user of topUsers) {
      //   if (user.userDetails.image) {
      //     user.userDetails.image = await getUrl(user.userDetails.image);
      //   }
      // }
      return topUsers;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while fetching top users.");
    }
  }

  async fetchAppointmentAnalytics(
    timeFrame: string
  ): Promise<IAppointmentAnalytics[]> {
    try {
      if (timeFrame === "weekly") {
        const analytics = await AppointmentModel.aggregate([
          {
            $group: {
              _id: { dayOfWeek: { $dayOfWeek: "$date" } },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
              },
              canceled: {
                $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              dayOfWeek: "$_id.dayOfWeek",
              completed: 1,
              canceled: 1,
            },
          },
          { $sort: { dayOfWeek: 1 } },
        ]);
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const transformedAnalytics = analytics.map((item) => ({
          _id: weekDays[item.dayOfWeek - 1],
          completed: item.completed,
          canceled: item.canceled,
        }));
        return transformedAnalytics;
      } else {
        const groupFormat =
          {
            daily: "%Y-%m-%d",
            monthly: "%Y-%m",
            yearly: "%Y",
          }[timeFrame] || "%Y-%m-%d";

        const analytics = await AppointmentModel.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: groupFormat, date: "$date" } },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
              },
              canceled: {
                $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]);
        return analytics;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error(
        "An unknown error occurred while fetching appointment analytics."
      );
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
        status: { $in: ["completed", "cancelled"] },
      };

      if (status) {
        query.status = status;
      }

      const paginatedResult = await paginate(
        AppointmentModel,
        {
          ...options,
          select:
            "appointmentId date time status fees paymentMethod paymentStatus couponCode couponDiscount isApplied createdAt updatedAt",
          populate: [
            {
              path: "doctorId",
              select: "name email phone docStatus fees averageRating",
            },
            { path: "patientId", select: "name email phone address" },
          ],
        },
        query
      );

      return paginatedResult;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while fetching reports.");
    }
  }
}
