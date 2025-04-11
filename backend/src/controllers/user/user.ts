import HTTP_statusCode from "../../enums/httpStatusCode";
import { IUserService } from "../../interface/user/User.service.interface";
import { Request, Response } from "express";

export class UserController {
  private userService: IUserService;

  constructor(userServiceInstance: IUserService) {
    this.userService = userServiceInstance;
  }

  async getDoctors(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 9) || 1;
      const limit = parseInt(req.query.limit as string, 9) || 10;
      const search = req.query.search as string;
      const speciality = req.query.speciality as string;
      const doctors = await this.userService.getDoctors({
        page,
        limit,
        search,
        speciality,
      });

      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { doctors },
        message: "Doctors fetched successfully",
      });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getDoctorDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const doctor = await this.userService.getDoctorDetails(id);
      res.status(HTTP_statusCode.OK).json({ status: true, doctor });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getServices(req: Request, res: Response): Promise<void> {
    try {
      const services = await this.userService.getServices();

      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { services },
        message: "Services fetched successfully",
      });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserProfile(id);
      res.status(HTTP_statusCode.OK).json({ status: true, user });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async editUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      const file = req.file as Express.Multer.File;

      if (data.isBlocked !== undefined) {
        data.isBlocked = data.isBlocked === "true" || data.isBlocked === true;
      }

      const result = await this.userService.editUserProfile(id, data, file);

      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Profile updated successfully",
      });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      const result = await this.userService.changePassword(
        id,
        oldPassword,
        newPassword
      );
      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Password updated successfully",
      });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const slots = await this.userService.getAvailableSlots(id);
      res.status(HTTP_statusCode.OK).json({ status: true, slots });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getAppointmentDoctors(req: Request, res: Response): Promise<void>{
    try{
      const { id } = req.params;
      const getAcceptedDoctors = await this.userService.getAppointmentDoctors(id);
      res.status(HTTP_statusCode.OK).json({ status: true, getAcceptedDoctors });
    }catch(error){
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async chatImageUploads(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const file = req.file as Express.Multer.File;

      if (!id || !file) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Chat ID and image file are required",
        });
        return;
      }

      const result = await this.userService.chatImageUploads(id, file);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        result,
      });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }
}
