import { Request, Response } from "express";
import HTTP_statusCode from "../../enums/httpStatusCode";
import { IDoctorService } from "../../interface/doctor/Auth.service.interface";
import Doctor from "../../model/doctorModel";

export class DoctorController {
  private doctorService: IDoctorService;
  constructor(doctorServiceInstance: IDoctorService) {
    this.doctorService = doctorServiceInstance;
  }

  async getServices(req: Request, res: Response): Promise<any> {
    try {
      const services = await this.doctorService.getServices();
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { services },
        message: "Services fetched successfully",
      });
    } catch (error: any) {
      console.error("Error in serviceList:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async addQualification(req: Request, res: Response): Promise<any> {
    const data = req.body;
    console.log(data, "1");
    const files = req.files as Express.Multer.File[];
    try {
      const result = await this.doctorService.addQualification(data, files);
      console.log(result, "2");
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Qualification added successfully",
      });
    } catch (error: any) {
      console.error("Error in addQualification:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getQualifications(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const qualifications = await this.doctorService.getQualifications(id);
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { qualifications },
        message: "Qualifications fetched successfully",
      });
    } catch (error: any) {
      console.error("Error in getQualifications:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getDoctorProfile(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const profile = await this.doctorService.getDoctorProfile(id);
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { profile },
        message: "Profile fetched successfully",
      });
    } catch (error: any) {
      console.error("Error in getDoctorProfile:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  // async editDoctorProfile(req: Request, res: Response): Promise<any> {
  //   try {
  //     const { id } = req.params;
  //     const data = req.body;
  //     const files = req.files as Express.Multer.File[];
  //     const result = await this.doctorService.editDoctorProfile(
  //       id,
  //       data,
  //       files
  //     );
  //     return res.status(HTTP_statusCode.OK).json({
  //       status: true,
  //       data: { result },
  //       message: "Profile updated successfully",
  //     });
  //   } catch (error: any) {
  //     console.error("Error in editDoctorProfile:", error);
  //     return res.status(HTTP_statusCode.InternalServerError).json({
  //       status: false,
  //       message: "Something went wrong, please try again later.",
  //     });
  //   }
  // }

}
