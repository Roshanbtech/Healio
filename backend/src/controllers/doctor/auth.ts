import { Request, Response } from "express";
import HTTP_statusCode from "../../enums/httpStatusCode";
import { IAuthService } from "../../interface/doctor/Auth.service.interface";
import { admin } from "../../config/firebase";
import Doctor from "../../model/doctorModel";

export class AuthController {
  private authService: IAuthService;
  constructor(authServiceInstance: IAuthService) {
    this.authService = authServiceInstance;
  }

  async createDoctor(req: Request, res: Response): Promise<void> {
    try {
      console.log("create doctor auth");
      const data = req.body;
      console.log(data, "docdata");

      const response = await this.authService.signup(data);
      res.status(HTTP_statusCode.OK).json({ status: true, response });
    } catch (error: any) {
      if (error.message === "Email already in use") {
        res
          .status(HTTP_statusCode.Conflict)
          .json({ message: "Email already in use" });
      } else if (error.message === "Phone already in use") {
        res
          .status(HTTP_statusCode.Conflict)
          .json({ message: "Phone number already in use" });
      } else if (error.message === "Otp not send") {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "OTP not sent" });
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

  async handleGoogleLogin(req: Request, res: Response): Promise<any> {
    try {
      const { idToken } = req.body;
      console.log("Received ID Token:", idToken);

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Decoded Token:", decodedToken);

      const { email, name, uid, picture } = decodedToken;
      let doctor = await Doctor.findOne({ email });
      console.log(doctor);

      if (!doctor) {
        const doctorData = {
          name,
          email,
          googleId: uid,
          isVerified: true,
          image: picture || undefined,
        };

        doctor = new Doctor(doctorData);
        await doctor.save();

        return res
          .status(HTTP_statusCode.Created)
          .json({ message: "Doctor created successfully" });
      }

      return res
        .status(HTTP_statusCode.Created)
        .json({ message: "Doctor Login Successful" });
    } catch (error) {
      console.error(error);

      if (!res.headersSent) {
        return res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Authentication failed" });
      }
    }
  }
  async loginDoctor(req: Request, res: Response): Promise<any> {
    try {
      const data = req.body;
      const loginResponse = await this.authService.login(data);
      if ("error" in loginResponse) {
        return res.status(HTTP_statusCode.Unauthorized).json({
          status: false,
          message: loginResponse.error,
        });
      }

      const { accessToken, refreshToken, doctorId } = loginResponse;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // Set to false for local testing
        sameSite: "strict",
        path: "/auth/refresh", // Refresh token endpoint
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      });

      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Doctor logged in successfully",
        accessToken,
        doctorId,
      });
    } catch (error) {
      console.error(error);

      if (!res.headersSent) {
        return res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Authentication failed" });
      }
    }
  }
}
