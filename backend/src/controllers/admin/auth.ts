import HTTP_statusCode from "../../enums/httpStatusCode";
import { IAuthService } from "../../interface/admin/Auth.service.interface";
import { Request, Response } from "express";
import { AdminLoginInput } from "../../interface/adminInterface/adminAuth";
import dotenv from "dotenv";
import {
  Coupon,
} from "../../interface/adminInterface/couponlist";
dotenv.config();

export class AuthController {
  private authService: IAuthService;

  constructor(authServiceInstance: IAuthService) {
    this.authService = authServiceInstance;
  }

  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as AdminLoginInput;

      if (!email || !password) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Email and password are required.",
        });
        return;
      }

      const loginResponse = await this.authService.login({ email, password });

      if ("error" in loginResponse) {
        res.status(HTTP_statusCode.Unauthorized).json({
          status: false,
          message: loginResponse.error,
        });
        return;
      }

      const { accessToken, refreshToken } = loginResponse;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });

      res.setHeader("Authorization", `Bearer ${accessToken}`);

      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Admin logged in successfully.",
        accessToken,
      });
    } catch (error: unknown) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong, please try again later.",
      });
    }
  }

  async logoutAdmin(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      const result = await this.authService.logout(refreshToken);

      if ("error" in result) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: result.error,
        });
        return;
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: result.message,
      });
    } catch (error: unknown) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong, please try again later.",
      });
    }
  }

  async getUserList(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const search = req.query.search as string;
      const speciality = req.query.category as string;
      const userList = await this.authService.getUser({
        page,
        limit,
        search,
        speciality,
        searchFields: ["name", "email"],
      });
      res.status(HTTP_statusCode.OK).json({ status: true, ...userList });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async getDoctorList(req: Request, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
        search: req.query.search as string,
        speciality: req.query.category as string,
        status: req.query.status as string,
        searchFields: ["name", "email"],
      };
      const doctorList = await this.authService.getDoctor(options);
      res.status(HTTP_statusCode.OK).json({ status: true, doctorList });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async toggleUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const blockUser = await this.authService.toggleUser(id);
      if (!blockUser) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "User not found.",
        });
        return;
      }
      res.status(HTTP_statusCode.OK).json({ blockUser });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async toggleDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const blockDoctor = await this.authService.toggleDoctor(id);
      if (!blockDoctor)
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ status: false, message: "Doctor not found." });
      res.status(HTTP_statusCode.OK).json({ blockDoctor });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async getServices(req: Request, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
        search: req.query.search as string,
        speciality: req.query.category as string,
      };
      const serviceList = await this.authService.getService(options);

      if (!serviceList || !serviceList.data || serviceList.data.length === 0) {
        res.status(HTTP_statusCode.NotFound).json({
          status: false,
          message: "No services found.",
        });
      }

      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { serviceList },
        message: null,
      });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async addService(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      const service = await this.authService.addService(name, true);

      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Service added successfully",
        service,
      });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";

      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async editService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const service = await this.authService.editService(id, name, true);
      res.status(HTTP_statusCode.OK).json(service);
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async toggleService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = await this.authService.toggleService(id);
      if (!service) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ status: false, message: "Service not found." });
      }
      res.status(HTTP_statusCode.OK).json({ service });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async getCertificates(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const certificates = await this.authService.getCertificates(id);

      res.status(HTTP_statusCode.OK).json({
        status: true,
        certificates,
        message: "Certificates fetched successfully",
      });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";

      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        certificates: [],
        message: errMsg,
      });
    }
  }

  async approveDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const doctor = await this.authService.approveDoctor(id);
      res.status(HTTP_statusCode.OK).json({ status: true, doctor });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Error approving doctor.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async rejectDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const doctor = await this.authService.rejectDoctor(id, reason);
      res.status(HTTP_statusCode.OK).json({ status: true, doctor });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Error rejecting doctor.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async createCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { name, code, discount, expirationDate } = req.body;
      const couponData: Coupon = {
        name,
        code,
        discount,
        startDate: new Date(),
        expirationDate: new Date(expirationDate),
        isActive: true,
      };

      const result = await this.authService.createCoupon(couponData);
      res.status(HTTP_statusCode.OK).json(result);
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async getCoupons(req: Request, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        speciality: req.query.speciality as string,
        searchFields: ["name", "code"],
      };
      const coupons = await this.authService.getCoupons(options);
      res.status(HTTP_statusCode.OK).json({ status: true, coupons });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async toggleCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const coupon = await this.authService.toggleCoupon(id);
      if (!coupon) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Coupon not found.",
        });
      }
      res.status(HTTP_statusCode.OK).json({ coupon });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async editCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, code, discount, expirationDate } = req.body;

      if (!id || !name || !code) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Service ID, name and code are required.",
        });
        return;
      }
      const couponData: Coupon = {
        name,
        code,
        discount,
        startDate: new Date(),
        expirationDate: new Date(expirationDate),
        isActive: true,
      };

      const result = await this.authService.editCoupon(id, couponData);
      res.status(HTTP_statusCode.OK).json(result);
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.authService.getDashboardStats();
      res.status(HTTP_statusCode.OK).json({ status: true, data: stats });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async getTopDoctors(req: Request, res: Response): Promise<void> {
    try {
      const topDoctors = await this.authService.getTopDoctors();
      res.status(HTTP_statusCode.OK).json({ status: true, data: topDoctors });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async getTopUsers(req: Request, res: Response): Promise<void> {
    try {
      const topUsers = await this.authService.getTopUsers();
      res.status(HTTP_statusCode.OK).json({ status: true, data: topUsers });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async getAppointmentAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const timeFrame = req.query.timeFrame as string;
      const analytics = await this.authService.getAppointmentAnalytics(
        timeFrame
      );
      res.status(HTTP_statusCode.OK).json({ status: true, data: analytics });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }

  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, page, limit, search, status } = req.query;
      const pageLimit = parseInt(limit as string, 10) || 10;
      const pageNumber = parseInt(page as string, 10) || 1;
      const searchQuery = search as string;
      const statusQuery = status as string;

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Invalid date format provided.",
        });
      }
      if (start > end) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Start date cannot be greater than end date.",
        });
      }
      const reports = await this.authService.getReports(
        start,
        end,
        statusQuery,
        {
          page: pageNumber,
          limit: pageLimit,
          search: searchQuery,
        }
      );
      res.status(HTTP_statusCode.OK).json({ status: true, data: reports });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later.";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: errMsg,
      });
    }
  }
}
