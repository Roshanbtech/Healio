import HTTP_statusCode from "../../enums/httpStatusCode";
import { IAuthService } from "../../interface/admin/Auth.service.interface";
import { Request, Response } from "express";

export class AuthController {
  private authService: IAuthService;

  constructor(authServiceInstance: IAuthService) {
    this.authService = authServiceInstance;
  }

  async loginAdmin(req: Request, res: Response): Promise<any> {
    try {
      console.log("Processing admin login request...");
      const { email, password } = req.body;

      // Validate request body
      if (!email || !password) {
        return res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Email and password are required.",
        });
      }

      // Authenticate the admin
      const loginResponse = await this.authService.login({ email, password });

      // Check for login errors
      if ("error" in loginResponse) {
        console.warn("Admin login failed:", loginResponse.error);
        return res.status(HTTP_statusCode.Unauthorized).json({
          status: false,
          message: loginResponse.error,
        });
      }

      const { accessToken, refreshToken } = loginResponse;

      // Store refresh token securely in an HttpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh", // Path where the refresh token is valid
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
      });

      // Set authorization header with access token
      res.setHeader("Authorization", `Bearer ${accessToken}`);

      console.log("Admin logged in successfully.");

      return res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Admin logged in successfully.",
        accessToken,
      });
    } catch (error: any) {
      console.error("Error in loginAdmin:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getUserList(req: Request, res: Response): Promise<any> {
    try {
      const userList = await this.authService.getUser();
      return res.status(HTTP_statusCode.OK).json({ status: true, userList });
    } catch (error: any) {
      console.error("Error in getUserList:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getDoctorList(req: Request, res: Response): Promise<any> {
    try {
      const doctorList = await this.authService.getDoctor();
      return res.status(HTTP_statusCode.OK).json({ status: true, doctorList });
    } catch (error: any) {
      console.error("Error in getDoctorList:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async toggleUser(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      console.log(id);
      const blockUser = await this.authService.toggleUser(id);
      return res.status(HTTP_statusCode.OK).json({ status: true, blockUser });
    } catch (error: any) {
      console.error("Error in blockUser:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async toggleDoctor(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      console.log(id);
      const blockUser = await this.authService.toggleDoctor(id);
      return res.status(HTTP_statusCode.OK).json({ status: true, blockUser });
    } catch (error: any) {
      console.error("Error in blockDoctor:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getServices(req: Request, res: Response): Promise<any> {
    try {
      const serviceList = await this.authService.getService();

      if (!serviceList || serviceList.length === 0) {
        return res.status(HTTP_statusCode.NotFound).json({
          status: false,
          message: "No services found.",
        });
      }

      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { serviceList },
        message: null,
      });
    } catch (error: any) {
      console.error("Error in serviceList:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async addService(req: Request, res: Response): Promise<any> {
    try {
      const { name } = req.body;
  
      const service = await this.authService.addService(name, true);
  
      return res.status(200).json({ status: true, service });
    } catch (error: any) {
      console.error("Error in AuthController.addService:", error); 
  
      return res.status(500).json({
        status: false,
        message: error.message || "Something went wrong, please try again later.",
      });
    }
  }
  


  async editService(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { name } = req.body;

      // Input validation
      if (!id || !name) {
        return res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Service ID and name are required.",
        });
      }

      const service = await this.authService.editService(id, name, true);

      return res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Service updated successfully.",
        service,
      });
    } catch (error: any) {
      console.error("Error in editService:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async toggleService(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const service = await this.authService.toggleService(id);
      return res.status(HTTP_statusCode.OK).json({ status: true, service });
    } catch (error: any) {
      console.error("Error in toggleService:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async getCertificates(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const certificates = await this.authService.getCertificates(id);
      return res.status(HTTP_statusCode.OK).json({ status: true, certificates });
    } catch (error: any) {
      console.error("Error in getCertificates:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async approveDoctor(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const doctor = await this.authService.approveDoctor(id);
      return res.status(HTTP_statusCode.OK).json({ status: true, doctor });
    } catch (error: any) {
      console.error("Error in approveDoctor:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async rejectDoctor(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const doctor = await this.authService.rejectDoctor(id);
      return res.status(HTTP_statusCode.OK).json({ status: true, doctor });
    } catch (error: any) {
      console.error("Error in rejectDoctor:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

}
