import { Request, Response } from "express";
import HTTP_statusCode from "../../enums/httpStatusCode";
import { IDoctorService } from "../../interface/doctor/Auth.service.interface";

export class DoctorController {
  private doctorService: IDoctorService;
  constructor(doctorServiceInstance: IDoctorService) {
    this.doctorService = doctorServiceInstance;
  }

  async getServices(req: Request, res: Response): Promise<void> {
    try {
      const services = await this.doctorService.getServices();
      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { services },
        message: "Services fetched successfully",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";  
      if (!res.headersSent) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

  async addQualification(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const files = req.files as Express.Multer.File[];
    try {
      const result = await this.doctorService.addQualification(data, files);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Qualification added successfully",
      });
    }  catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unexpected error";
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getQualifications(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const qualifications = await this.doctorService.getQualifications(id);
  
      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { qualifications },
        message: "Qualifications fetched successfully",
      });
    } catch (error: unknown) {
      console.error("Error in getQualifications:", error);
  
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }
  

  async getDoctorProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await this.doctorService.getDoctorProfile(id);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { profile },
        message: "Profile fetched successfully",
      });
    } catch (error: unknown) {
       if (error instanceof Error) {
       res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
    }
  }

  async editDoctorProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      const file = req.file as Express.Multer.File;

      const result = await this.doctorService.editDoctorProfile(id, data, file);

      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Profile updated successfully",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      const result = await this.doctorService.changePassword(
        id,
        oldPassword,
        newPassword
      );
      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Password updated successfully",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

  //Schedule management started here....

  async addSchedule(req: Request, res: Response): Promise<void> {
    try {
      const scheduleData = req.body;
      const result = await this.doctorService.addSchedule(scheduleData);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { result },
        message: "Schedule added successfully",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

 async getSchedule(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await this.doctorService.getSchedule(id);

    if (!result.status) {
      res.status(HTTP_statusCode.NotFound).json({
        status: false,
        message: result.message,
      });
      return;
    }

    res.status(HTTP_statusCode.OK).json({
      status: true,
      data: { schedule: result.data },
      message: result.message,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";

    res.status(HTTP_statusCode.InternalServerError).json({
      status: false,
      message: errorMessage,
    });
  }
}


  // Removed duplicate getUsers function.

 async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.doctorService.getUsers();
      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { users },
        message: "Users fetched successfully",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

  async getAppointmentUsers(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const users = await this.doctorService.getAppointmentUsers(id);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { users },
        message: "Users fetched successfully",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
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

      const result = await this.doctorService.chatImageUploads(id, file);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        result,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

  //to get all appointments of a particular doctor
  async getAppointments(req: Request, res: Response): Promise<void> {
    try{
       const { id } = req.params;
       const appointments = await this.doctorService.getAppointments(id);
       res.status(HTTP_statusCode.OK).json({
         status: true,
         data: { appointments },
         message: "Appointments fetched successfully",
       })
    }catch(error: unknown){
      if(error instanceof Error) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        })
      }
    }
  }

  async acceptAppointment(req: Request, res: Response): Promise<void>{
    try{
       const { id } = req.params;
       const accepted = await this.doctorService.acceptAppointment(id);
       if(!accepted){
         res.status(HTTP_statusCode.NotFound).json({
           status: false,
           message: "Appointment not found",
         })
         return;
       }
       res.status(HTTP_statusCode.OK).json({
         status: true,
         data: { accepted },
         message: "Appointment accepted successfully",
       })
    }catch(error: unknown){
       if(error instanceof Error){
         res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        })
       }
    }
  }

  async completeAppointment(req: Request, res: Response): Promise<void>{
    try{
       const { id } = req.params;
       const completed = await this.doctorService.completeAppointment(id);
       if(!completed){
         res.status(HTTP_statusCode.NotFound).json({
           status: false,
           message: "Appointment not found",
         })
         return;
       }
        res.status(HTTP_statusCode.OK).json({
         status: true,
         data: { completed },
         message: "Appointment completed successfully",
       })
    }catch(error:unknown){
      if(error instanceof Error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      })
    }
    }
  }

  //rescheduling of an appointment by doctor ........... starts here.....................

  async rescheduleAppointment(req: Request, res: Response): Promise<void>{
    try{
      const { id } = req.params;
      const { date, time , reason} = req.body;
      const rescheduled = await this.doctorService.rescheduleAppointment(id, date, time, reason);
      if(!rescheduled){
        res.status(HTTP_statusCode.NotFound).json({
          status: false,
          message: "Appointment not found",
        })
        return;
      }
       res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { rescheduled },
        message: "Appointment rescheduled successfully",
      })

    }catch(error: unknown){
      if(error instanceof Error) {
        console.log("error in rescheduling appointment", error);
         res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: error.message,
        })
      }
    }
  }

  //rescheduling required available slots of doctor so fetch it first..........

    async getDoctorAvailableSlots(req: Request, res: Response): Promise<void> {
      try {
        const { id } = req.params;
        const slots = await this.doctorService.getDoctorAvailableSlots(id);
        res.status(HTTP_statusCode.OK).json({ status: true, slots });
      } catch (error: unknown) {
        if (error instanceof Error) {
         res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
      }
    }

    async getDashboardHome(req: Request, res: Response): Promise<void> {
      try {
        const doctorId = req.params.id;
        const data = await this.doctorService.getDashboardHome(doctorId);
        res.status(200).json({
          status: true,
          data,
          message: "Dashboard data fetched successfully",
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({
            status: false,
            message: error.message,
          });
        }
      }
    }

    async getDashboardStats(req: Request, res: Response): Promise<void> {
      try {
        const { id: doctorId } = req.params;
        const data = await this.doctorService.fetchDashboardStats(doctorId);
    
        if (!data) {
         res.status(HTTP_statusCode.NotFound).json({
            status: false,
            message: "Doctor not found",
          });
          return;
        }
    
        res.status(HTTP_statusCode.OK).json({
          status: true,
          data, 
          message: "Dashboard stats fetched successfully",
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
      }
    }
    

    async getGrowthData(req: Request, res: Response): Promise<void> {
      try {
        const { id: doctorId } = req.params;
        // Default to "yearly" if timeRange is not provided
        const timeRange = (req.query.timeRange as "daily" | "weekly" | "monthly" | "yearly") || "yearly";
        const dateParam = req.query.date as string | undefined;
        
        const growthData = await this.doctorService.fetchGrowthData(doctorId, timeRange, dateParam);
        
         res.status(200).json({
          status: true,
          data: { growthData },
          message: "Growth data fetched successfully"
        });
      } catch (error: unknown) {
        if(error instanceof Error){
          res.status(HTTP_statusCode.InternalServerError).json({
            status: false,
            message: "Something went wrong, please try again later.",
          });
        }
    }
  }

}
