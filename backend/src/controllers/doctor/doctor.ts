import { Request, Response } from "express";
import HTTP_statusCode from "../../enums/httpStatusCode";
import { IDoctorService } from "../../interface/doctor/Auth.service.interface";

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

  async editDoctorProfile(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const data = req.body;
      const file = req.file as Express.Multer.File;
      console.log("Controller - Data:", data, "ID:", id);

      const result = await this.doctorService.editDoctorProfile(id, data, file);

      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error in editDoctorProfile:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      const result = await this.doctorService.changePassword(
        id,
        oldPassword,
        newPassword
      );
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Password updated successfully",
      });
    } catch (error: any) {
      console.error("Error in changePassword:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  //Schedule management started here....

  async addSchedule(req: Request, res: Response): Promise<any> {
    try {
      const scheduleData = req.body;
      const result = await this.doctorService.addSchedule(scheduleData);
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Schedule added successfully",
      });
    } catch (error: any) {
      console.error("Error in addSchedule:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getSchedule(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const schedule = await this.doctorService.getSchedule(id);
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { schedule },
        message: "Schedule fetched successfully",
      });
    } catch (error: any) {
      console.error("Error in getSchedule:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  // Removed duplicate getUsers function.

 async getUsers(req: Request, res: Response): Promise<any> {
    try {
      const users = await this.doctorService.getUsers();
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { users },
        message: "Users fetched successfully",
      });
    } catch (error: any) {
      console.error("Error in getUsers:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getAppointmentUsers(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const users = await this.doctorService.getAppointmentUsers(id);
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { users },
        message: "Users fetched successfully",
      });
    } catch (error: any) {
      console.error("Error in getUsers:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }


  async chatImageUploads(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const file = req.file as Express.Multer.File;

      if (!id || !file) {
        return res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Chat ID and image file are required",
        });
      }

      const result = await this.doctorService.chatImageUploads(id, file);
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        result,
      });
    } catch (error: any) {
      console.log("error in uploading chat image", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  //to get all appointments of a particular doctor
  async getAppointments(req: Request, res: Response): Promise<any>{
    try{
       const { id } = req.params;
       const appointments = await this.doctorService.getAppointments(id);
       return res.status(HTTP_statusCode.OK).json({
         status: true,
         data: { appointments },
         message: "Appointments fetched successfully",
       })
    }catch(error: any){
      console.log("error in getting appointments", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      })
    }
  }

  async acceptAppointment(req: Request, res: Response): Promise<any>{
    try{
       const { id } = req.params;
       const accepted = await this.doctorService.acceptAppointment(id);
       if(!accepted){
         return res.status(HTTP_statusCode.NotFound).json({
           status: false,
           message: "Appointment not found",
         })
       }
       return res.status(HTTP_statusCode.OK).json({
         status: true,
         data: { accepted },
         message: "Appointment accepted successfully",
       })
    }catch(error:any){
      console.log("error in accepting appointment", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      })
    }
  }

  async completeAppointment(req: Request, res: Response): Promise<any>{
    try{
       const { id } = req.params;
       const completed = await this.doctorService.completeAppointment(id);
       if(!completed){
         return res.status(HTTP_statusCode.NotFound).json({
           status: false,
           message: "Appointment not found",
         })
       }
       return res.status(HTTP_statusCode.OK).json({
         status: true,
         data: { completed },
         message: "Appointment completed successfully",
       })
    }catch(error:any){
      console.log("error in completing appointment", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      })
    }
  }

  //rescheduling of an appointment by doctor ........... starts here.....................

  async rescheduleAppointment(req: Request, res: Response): Promise<any>{
    try{
      const { id } = req.params;
      const { date, time , reason} = req.body;
      const rescheduled = await this.doctorService.rescheduleAppointment(id, date, time, reason);
      if(!rescheduled){
        return res.status(HTTP_statusCode.NotFound).json({
          status: false,
          message: "Appointment not found",
        })
      }
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { rescheduled },
        message: "Appointment rescheduled successfully",
      })

    }catch(error:any){
      console.log("error in rescheduling appointment", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      })
    }
  }

  //rescheduling required available slots of doctor so fetch it first..........

    async getDoctorAvailableSlots(req: Request, res: Response): Promise<any> {
      try {
        const { id } = req.params;
        const slots = await this.doctorService.getDoctorAvailableSlots(id);
        return res.status(HTTP_statusCode.OK).json({ status: true, slots });
      } catch (error: any) {
        console.error("Error in getAvailableSlots:", error);
        return res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }

}
