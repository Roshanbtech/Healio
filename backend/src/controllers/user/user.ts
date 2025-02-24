import HTTP_statusCode from "../../enums/httpStatusCode";
import { IUserService } from "../../interface/user/User.service.interface";
import { Request, Response } from "express";
import User from "../../model/userModel";

export class UserController {
  private userService: IUserService;

  constructor(userServiceInstance: IUserService) {
    this.userService = userServiceInstance;
  }

  async getDoctors(req: Request, res: Response): Promise<any> {
    try {
      const page = parseInt(req.query.page as string, 9) || 1;
      const limit = parseInt(req.query.limit as string, 9) || 10;
      const search = req.query.search as string;
      const speciality = req.query.speciality as string;    
      const doctors = await this.userService.getDoctors({ page, limit, search, speciality });

      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { doctors },
        message: "Doctors fetched successfully",
      })
    } catch (error: any) {
      console.error("Error in getDoctors:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getDoctorDetails(req: Request, res: Response): Promise<any> {
    try{
      
      const { id } = req.params;
      const doctor = await this.userService.getDoctorDetails(id);
      return res.status(HTTP_statusCode.OK).json({ status: true, doctor });
    }catch(error: any){
      console.error("Error in getDoctorDetails:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getServices(req: Request, res: Response): Promise<any> {
    try {
      const services = await this.userService.getServices();

      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { services },
        message: "Services fetched successfully",
      });
    } catch (error: any) {
      console.error("Error in getServices:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getUserProfile(req: Request, res: Response): Promise<any> {
    try{
      const { id } = req.params;
      const user = await this.userService.getUserProfile(id);
      return res.status(HTTP_statusCode.OK).json({ status: true, user });
    }catch(error: any){
      console.error("Error in getProfile:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async editUserProfile(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const data = req.body;
      const file = req.file as Express.Multer.File; 
      console.log('Controller - Data:', data, 'ID:', id);

      if (data.isBlocked !== undefined) {
        data.isBlocked = data.isBlocked === "true" || data.isBlocked === true;  
      }
      
      const result = await this.userService.editUserProfile(id, data, file);
      
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error in editUserProfile:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }
  
  async changePassword(req: Request, res: Response): Promise<any> {
    try{
       const { id} = req.params;
       const { oldPassword, newPassword } = req.body;
       const result = await this.userService.changePassword(id, oldPassword, newPassword);
       return res.status(HTTP_statusCode.OK).json({
          status: true,
          data: { result },
          message: "Password updated successfully",
        });
    }catch(error: any){
      console.error("Error in changePassword:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getAvailableSlots(req:Request, res:Response): Promise<any>{
    try{
      const { id } = req.params;
      const slots = await this.userService.getAvailableSlots(id);
      return res.status(HTTP_statusCode.OK).json({ status: true, slots });
    }catch(error:any){
      console.error("Error in getAvailableSlots:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

}
