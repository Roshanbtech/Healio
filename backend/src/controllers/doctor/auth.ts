import { Request, Response } from "express";
import HTTP_statusCode from "../../enums/httpStatusCode";
import { IAuthService } from "../../interface/doctor/Auth.service.interface";
import dotenv from "dotenv";
dotenv.config();

export class AuthController {
  private authService: IAuthService;
  constructor(authServiceInstance: IAuthService) {
    this.authService = authServiceInstance;
  }

  async createDoctor(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const response = await this.authService.signup(data);
      if ("error" in response) {
        res.status(HTTP_statusCode.Unauthorized).json({
          status: false,
          message: response.error,
        });
        return;
      }
      res.status(HTTP_statusCode.OK).json({ status: true, response });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "Email already in use") {
          res.status(HTTP_statusCode.Conflict).json({ message: "Email already in use" });
        } else if (error.message === "Phone already in use") {
          res.status(HTTP_statusCode.Conflict).json({ message: "Phone number already in use" });
        } else if (error.message === "Otp not send") {
          res.status(HTTP_statusCode.InternalServerError).json({ message: "OTP not sent" });
        } else {
          res.status(HTTP_statusCode.InternalServerError).json({
            message: "Something went wrong, please try again later",
          });
        }
      } else {
        res.status(HTTP_statusCode.InternalServerError).json({
          message: "An unexpected error occurred",
        });
      }
    }
  }
  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const response = await this.authService.sendOtp(email);
      res.status(HTTP_statusCode.OK).json({ status: true, response });
    } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Email not found") {
        res
          .status(HTTP_statusCode.NotFound)
          .json({ message: "Email not found" });
      } else if (error.message === "Otp not send") {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "OTP not sent" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something went wrong, please try again later" });
      }
    } else {
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "An unexpected error occurred" });
    }
  }
  }
  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ message: "Email is required" });
        return;
      }

      const response = await this.authService.resendOtp(email);
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error) {
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Something went wrong" });
    }
  }

  async handleGoogleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;
      console.log("Received ID Token:", idToken);

      const { doctor, isNewDoctor, accessToken, refreshToken } =
        await this.authService.handleGoogleLogin(idToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/auth/refresh",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });

      res
        .status(
          isNewDoctor ? HTTP_statusCode.Created : HTTP_statusCode.Accepted
        )
        .json({
          message: isNewDoctor
            ? "Doctor created successfully"
            : "Doctor login successful",
          accessToken,
          doctor,
        });
    }catch (error: unknown) {    
      if (!res.headersSent) {
        if (error instanceof Error) {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: error.message });
        } else {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: "Authentication failed" });
        }
      }
    }
    
  }
  async sendForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this.authService.sendForgotPasswordOtp(email);
      res.status(HTTP_statusCode.OK).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "Email not found") {
          res.status(HTTP_statusCode.NotFound).json({ message: "Email not found" });
        } else if (error.message === "OTP not sent") {
          res.status(HTTP_statusCode.InternalServerError).json({ message: "OTP not sent" });
        } else {
          res.status(HTTP_statusCode.InternalServerError).json({
            message: "Something went wrong, please try again later",
          });
        }
      } else {
        res.status(HTTP_statusCode.InternalServerError).json({
          message: "An unexpected error occurred",
        });
      }
    }
  }

  async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const result = await this.authService.verifyForgotPasswordOtp(email, otp);
      res.status(HTTP_statusCode.OK).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "Email not found") {
          res.status(HTTP_statusCode.NotFound).json({ message: "Email not found" });
        } else if (
          error.message === "OTP expired or invalid" ||
          error.message === "Incorrect OTP"
        ) {
          res.status(HTTP_statusCode.BadRequest).json({ message: error.message });
        } else {
          res.status(HTTP_statusCode.InternalServerError).json({
            message: "Something went wrong, please try again later",
          });
        }
      } else {
        res.status(HTTP_statusCode.InternalServerError).json({
          message: "An unexpected error occurred",
        });
      }
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, values } = req.body;
      const newPassword = values.newPassword;
      const result = await this.authService.resetPassword(email, newPassword);
      res.status(HTTP_statusCode.OK).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "Email not found") {
          res.status(HTTP_statusCode.NotFound).json({ message: "Email not found" });
        } else if (error.message === "Password not updated") {
          res.status(HTTP_statusCode.InternalServerError).json({ message: "Password not updated" });
        } else {
          res.status(HTTP_statusCode.InternalServerError).json({
            message: "Something went wrong, please try again later",
          });
        }
      } else {
        res.status(HTTP_statusCode.InternalServerError).json({
          message: "An unexpected error occurred",
        });
      }
    }    
  }

  async loginDoctor(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const loginResponse = await this.authService.login(data);
      if ("error" in loginResponse) {
        res.status(HTTP_statusCode.Unauthorized).json({
          status: false,
          message: loginResponse.error,
        });
        return;
      }

      const { accessToken, refreshToken, doctorId } = loginResponse;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, 
        sameSite: "strict",
        path: "/auth/refresh", 
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });

      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Doctor logged in successfully",
        accessToken,
        doctorId,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";
    
      if (!res.headersSent) {
        res.status(HTTP_statusCode.InternalServerError).json({
          message: errorMessage,
        });
      }
    }
    
  }

  async logoutDoctor(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      await this.authService.logout(refreshToken);
  
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
  
      res.status(HTTP_statusCode.OK).json({ status: true, message: "Logout" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";  
      if (!res.headersSent) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: errorMessage || "Something went wrong, please try again later.",
        });
      }
    }
  }
  
}
