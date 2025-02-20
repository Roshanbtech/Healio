import HTTP_statusCode from "../../enums/httpStatusCode";
import { IAuthService } from "../../interface/user/Auth.service.interface";
import { Request, Response } from "express";
import { admin } from "../../config/firebase";
import User from "../../model/userModel";
import { HttpStatusCode } from "axios";
import jwt from "jsonwebtoken";

export class AuthController {
  private authService: IAuthService;

  constructor(authServiceInstance: IAuthService) {
    this.authService = authServiceInstance;
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      console.log("create user auth");

      const data = req.body;
      console.log(data, "data");

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
      let user = await User.findOne({ email });
      let isNewUser = false;
  
      if (!user) {
        const userData = {
          name,
          email,
          googleId: uid,
          isVerified: true,
          image: picture || undefined,
        };
  
        user = new User(userData);
        await user.save();
        isNewUser = true;
      }
  
      const accessToken = jwt.sign(
        { email, role: "user" },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );
  
      const refreshToken = jwt.sign(
        { email, role: "user" },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "30d" }
      );
  
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
  
      return res.status(isNewUser ? HttpStatusCode.Created : HttpStatusCode.Accepted)
        .json({
          message: isNewUser ? "User created successfully" : "User login successful",
          accessToken,
        });
    } catch (error) {
      console.error(error);
  
      if (!res.headersSent) {
        return res
          .status(HttpStatusCode.InternalServerError)
          .json({ message: "Authentication failed" });
      }
    }
  }
  

  async loginUser(req: Request, res: Response): Promise<any> {
    try {
      const data = req.body;
      const loginResponse = await this.authService.login(data);
      if ("error" in loginResponse) {
        return res.status(HTTP_statusCode.Unauthorized).json({
          status: false,
          message: loginResponse.error,
        });
      }

      const { accessToken, refreshToken, user } = loginResponse;
      // console.log(accessToken, "1");
      // console.log(refreshToken, "2");

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/auth/refresh",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      });

      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "User logged in successfully",
        accessToken,
        user
      });
    } catch (error) {
      console.error(error);

      if (!res.headersSent) {
        return res
          .status(HttpStatusCode.InternalServerError)
          .json({ message: "Authentication failed" });
      }
    }
  }

  async sendForgotPasswordOtp(req: Request, res: Response): Promise<any> {
    try {
      const { email } = req.body;
      const result = await this.authService.sendForgotPasswordOtp(email);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === "Email not found") {
        return res.status(404).json({ message: "Email not found" });
      } else if (error.message === "OTP not sent") {
        return res.status(500).json({ message: "OTP not sent" });
      } else {
        return res
          .status(500)
          .json({ message: "Something went wrong, please try again later" });
      }
    }
  }

  async verifyForgotPasswordOtp(req: Request, res: Response): Promise<any> {
    try {
      const { email, otp } = req.body;
      const result = await this.authService.verifyForgotPasswordOtp(email, otp);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === "Email not found") {
        return res.status(404).json({ message: "Email not found" });
      } else if (
        error.message === "OTP expired or invalid" ||
        error.message === "Incorrect OTP"
      ) {
        return res.status(400).json({ message: error.message });
      } else {
        return res
          .status(500)
          .json({ message: "Something went wrong, please try again later" });
      }
    }
  }

  async resetPassword(req: Request, res: Response): Promise<any> {
    try {
      const { email, values } = req.body;
      const newPassword = values.newPassword;
      console.log(email, newPassword, "reset password");
      const result = await this.authService.resetPassword(email, newPassword);
      console.log(result, "reset password");
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === "Email not found") {
        return res.status(404).json({ message: "Email not found" });
      } else if (error.message === "Password not updated") {
        return res.status(500).json({ message: "Password not updated" });
      } else {
        return res
          .status(500)
          .json({ message: "Something went wrong, please try again later" });
      }
    }
  }

  async logoutUser(req: Request, res: Response): Promise<any> {
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
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({ message: "Something went wrong, please try again later" });
    }
  }
}
