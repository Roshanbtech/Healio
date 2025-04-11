import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { IAuthService } from "../../interface/admin/Auth.service.interface";
import { IAuthRepository } from "../../interface/admin/Auth.repository.interface";
import { PaginationOptions } from "../../helper/pagination";
import {
  UserListResponse,
  UserToggleStatus,
} from "../../interface/adminInterface/userlist";
import {
  AdminLoginInput,
  AdminLoginSuccess,
  AdminLoginError,
  AdminLogoutSuccess,
  AdminLogoutError,
} from "../../interface/adminInterface/adminAuth";
import {
  IDashboardStats,
  ITopDoctor,
  ITopUser,
  IAppointmentAnalytics,
} from "../../interface/adminInterface/dashboard";
import { IAppointment } from "../../model/appointmentModel";
import {
  ApproveRejectResponse,
  DoctorListResponse,
  DoctorToggleStatus,
} from "../../interface/adminInterface/doctorlist";
import {
  ServiceListResponse,
  ServiceSuccessResponse,
  ServiceToggleStatus,
} from "../../interface/adminInterface/serviceInterface";
import sendMail from "../../config/emailConfig";
import {
  Coupon,
  CouponListResponse,
  CouponSuccessResponse,
  CouponToggleStatus,
} from "../../interface/adminInterface/couponlist";
config();
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class AuthService implements IAuthService {
  private AuthRepository: IAuthRepository;

  constructor(AuthRepository: IAuthRepository) {
    this.AuthRepository = AuthRepository;
  }
  async login(
    adminData: AdminLoginInput
  ): Promise<AdminLoginSuccess | AdminLoginError> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

      if (
        !adminEmail ||
        !adminPassword ||
        !accessTokenSecret ||
        !refreshTokenSecret
      ) {
        throw new Error("Server configuration missing.");
      }

      if (
        adminData.email !== adminEmail ||
        adminData.password !== adminPassword
      ) {
        return { error: "Invalid email or password." };
      }

      const accessToken = jwt.sign(
        { email: adminData.email, role: "admin" },
        accessTokenSecret,
        { expiresIn: "1d" }
      );

      const refreshToken = jwt.sign(
        { email: adminData.email, role: "admin" },
        refreshTokenSecret,
        { expiresIn: "7d" }
      );

      return { accessToken, refreshToken };
    } catch (error: unknown) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error. Please try again later.",
      };
    }
  }

  async logout(
    refreshToken: string
  ): Promise<AdminLogoutSuccess | AdminLogoutError> {
    try {
      return {
        status: true,
        message: "Logout successful.",
      };
    } catch (error: unknown) {
      return {
        error: error instanceof Error ? error.message : "Something went wrong.",
      };
    }
  }

  async getUser(
    options: PaginationOptions
  ): Promise<Omit<UserListResponse, "status">> {
    try {
      const users = await this.AuthRepository.getAllUsers(options);
      return users ?? null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while fetching users");
    }
  }

  async getDoctor(
    options: PaginationOptions
  ): Promise<Omit<DoctorListResponse, "status">> {
    try {
      const doctors = await this.AuthRepository.getAllDoctors(options);
      return doctors ?? null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while fetching doctors");
    }
  }

  async toggleUser(id: string): Promise<UserToggleStatus | null> {
    try {
      const user = await this.AuthRepository.toggleUser(id);
      if (!user) {
        return null;
      }
      const message = user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully";
      return { status: true, message };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while toggling user");
    }
  }

  async toggleDoctor(id: string): Promise<DoctorToggleStatus | null> {
    try {
      const doctor = await this.AuthRepository.toggleDoctor(id);
      if (!doctor) {
        return null;
      }
      const message = doctor.isBlocked
        ? "Doctor blocked successfully"
        : "Doctor unblocked successfully";
      return { status: true, message };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while toggling doctor");
    }
  }

  async addService(
    name: string,
    isActive: boolean
  ): Promise<ServiceSuccessResponse> {
    try {
      if (!name || name.trim() === "") {
        throw new Error("Service name cannot be empty.");
      }

      if (name.length > 20) {
        throw new Error("Service name cannot exceed 20 characters.");
      }

      const existingService = await this.AuthRepository.findServiceByName(name);
      if (existingService) {
        throw new Error("Service name already exists.");
      }

      const service = await this.AuthRepository.addService(name, isActive);
      if (!service) {
        throw new Error("Service not added.");
      }

      return { status: true, message: "Service added successfully", service };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while adding service");
    }
  }

  async editService(
    id: string,
    name: string,
    isActive: boolean
  ): Promise<ServiceSuccessResponse> {
    try {
      if (!name || name.trim() === "") {
        throw new Error("Service name cannot be empty.");
      }
      if (name.length > 20) {
        throw new Error("Service name cannot exceed 20 characters.");
      }
      const existingService = await this.AuthRepository.findServiceByName(name);
      if (existingService) {
        throw new Error("Service name already exists.");
      }
      const service = await this.AuthRepository.editService(id, name, isActive);
      if (!service) {
        throw new Error("Service not updated");
      }
      return { status: true, message: "Service updated successfully", service };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while updating service");
    }
  }

  async toggleService(id: string): Promise<ServiceToggleStatus | null> {
    try {
      const service = await this.AuthRepository.toggleService(id);
      if (!service) {
        throw new Error("Service not updated");
      }
      const message = service.isActive
        ? "Service enabled successfully"
        : "Service disabled successfully";
      return { status: true, message };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while toggling service");
    }
  }

  async toggleCoupon(id: string): Promise<CouponToggleStatus | null> {
    try {
      const coupon = await this.AuthRepository.toggleCoupon(id);
      if (!coupon) {
        throw new Error("Coupon not updated");
      }
      const message = coupon.isActive
        ? "Coupon enabled successfully"
        : "Coupon disabled successfully";
      return { status: true, message };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while toggling coupon");
    }
  }

  async getService(
    options: PaginationOptions
  ): Promise<Omit<ServiceListResponse, "status">> {
    try {
      const services = await this.AuthRepository.getAllServices(options);
      return services ?? null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while fetching services");
    }
  }

  async getCertificates(id: string): Promise<string[]> {
    try {
      const certificates = await this.AuthRepository.getCertificates(id);
      return certificates ?? [];
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      return [];
    }
  }

  async approveDoctor(id: string): Promise<ApproveRejectResponse> {
    try {
      const doctor = await this.AuthRepository.approveDoctor(id);
      if (!doctor) throw new Error("Doctor not found for approval.");

      const emailContent = `Hello Dr. ${doctor.name},

Congratulations! Your account has been approved as a doctor in the Healio team.

Thank you,
Team Healio`;

      await sendMail(doctor.email, "Account Approved", emailContent);
      return { status: true, message: "Doctor approved successfully", doctor };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Unexpected error during approval.";
      throw new Error(errMsg);
    }
  }

  async rejectDoctor(
    id: string,
    reason: string
  ): Promise<ApproveRejectResponse> {
    try {
      const doctor = await this.AuthRepository.rejectDoctor(id, reason);
      if (!doctor) throw new Error("Doctor not found for rejection.");

      const emailContent = `Hello Dr. ${doctor.name},

We regret to inform you that your account has been rejected as a doctor in the Healio team.
Because, ${reason}.

Thank you,
Team Healio`;

      await sendMail(doctor.email, "Account Rejected", emailContent);
      return { status: true, message: "Doctor rejected successfully", doctor };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Unexpected error during rejection.";
      throw new Error(errMsg);
    }
  }

  async createCoupon(couponData: Coupon): Promise<CouponSuccessResponse> {
    try {
      const { code } = couponData;

      const existingCode = await this.AuthRepository.existCoupon(code);
      if (existingCode) {
        throw new Error("Coupon code already exists.");
      }

      const coupon = await this.AuthRepository.createCoupon(couponData);
      if (!coupon) {
        throw new Error("Coupon not created.");
      }

      return {
        status: true,
        message: "Coupon created successfully",
        coupon,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while creating coupon.");
    }
  }

  async editCoupon(
    id: string,
    couponData: Coupon
  ): Promise<CouponSuccessResponse> {
    try {
      const existingCoupon = await this.AuthRepository.existCoupon(
        couponData.code
      );
      if (existingCoupon) {
        throw new Error("Coupon code already exists.");
      }
      const coupon = await this.AuthRepository.editCoupon(id, couponData);
      if (!coupon) {
        throw new Error("Coupon not updated.");
      }
      return {
        status: true,
        message: "Coupon updated successfully",
        coupon,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while updating coupon.");
    }
  }

  async getCoupons(
    options: PaginationOptions
  ): Promise<Omit<CouponListResponse, "status">> {
    try {
      const coupons = await this.AuthRepository.getAllCoupons(options);
      return coupons ?? null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while fetching coupons");
    }
  }

  async getDashboardStats(): Promise<IDashboardStats> {
    try {
      const stats = await this.AuthRepository.fetchDashboardStats();
      return stats;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while fetching dashboard stats");
    }
  }
  async getTopDoctors(): Promise<ITopDoctor[]> {
    try {
      const topDoctors = await this.AuthRepository.fetchTopDoctors();
      return topDoctors;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while fetching top doctors");
    }
  }
  async getTopUsers(): Promise<ITopUser[]> {
    try {
      const topUsers = await this.AuthRepository.fetchTopUsers();
      return topUsers;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while fetching top users");
    }
  }
  async getAppointmentAnalytics(
    timeFrame: string
  ): Promise<IAppointmentAnalytics[]> {
    try {
      const analytics = await this.AuthRepository.fetchAppointmentAnalytics(
        timeFrame
      );
      return analytics;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error(
        "Unknown error occurred while fetching appointment analytics"
      );
    }
  }

  async getReports(
    startDate: Date,
    endDate: Date,
    status: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<IAppointment>> {
    try {
      return await this.AuthRepository.fetchReports(
        startDate,
        endDate,
        status,
        options
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Unknown error occurred while fetching reports");
    }
  }
}
