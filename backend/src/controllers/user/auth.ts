import HTTP_statusCode from "../../enums/httpStatusCode";
import { IAuthService } from "../../interface/user/Auth.service.interface";
import { Request, Response } from "express";

export class AuthController {
  private authService: IAuthService;

  constructor(authServiceInstance: IAuthService) {
    this.authService = authServiceInstance;
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
        console.log("create user auth");
        
      const data = req.body;
      console.log(data,"data")

      const response = await this.authService.signup(data);

      res.status(HTTP_statusCode.OK).json({ status: true, response });
    } catch (error: any) {
      if (error.message === "Email already in use") {
        res.status(HTTP_statusCode.Conflict).json({ message: "Email already in use" });
      } else if (error.message === "Phone already in use") {
        res.status(HTTP_statusCode.Conflict).json({ message: "Phone number already in use" });
      } else if (error.message === "Otp not send") {
        res.status(HTTP_statusCode.InternalServerError).json({ message: "OTP not sent" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something went wrong, please try again later" });
      }
    }
  }

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const response = await this.authService.sendOtp(email);
      res.status(HTTP_statusCode.OK).json({ status: true, response });
    } catch (error: any) {
      if (error.message === "Email not found") {
        res.status(HTTP_statusCode.NotFound).json({ message: "Email not found" });
      } else if (error.message === "Otp not send") {
        res.status(HTTP_statusCode.InternalServerError).json({ message: "OTP not sent" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something went wrong, please try again later" });
      }
    }
  }

  // async loginUser(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { email, password } = req.body;
  
  //     // Validate input
  //     if (!email || !password) {
  //       res.status(HTTP_statusCode.BadRequest).json({
  //         message: "Email and password are required",
  //       });
  //     }
  
  //     const response = await this.authService.verifyUser(email, password);
  //     res.status(HTTP_statusCode.OK).json({ status: true, response });
  //   } catch (error: any) {
  //     if (error.message === "Email not found") {
  //       res.status(HTTP_statusCode.NotFound).json({ message: "Email not found" });
  //     } else if (error.message === "Incorrect password") {
  //       res.status(HTTP_statusCode.BadRequest).json({ message: "Incorrect password" });
  //     } else {
  //       res.status(HTTP_statusCode.InternalServerError).json({
  //         message: "Something went wrong, please try again later",
  //       });
  //     }
  //   }
  // }
  
}