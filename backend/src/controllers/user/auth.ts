import HTTP_statusCode from "../../enums/httpStatusCode";
import { IAuthService } from "../../interface/user/Auth.service.interface";
import { Request, Response } from "express";
import { admin } from "../../config/firebase";
import User from "../../model/userModel";
import { HttpStatusCode } from "axios";

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

        return res
          .status(HttpStatusCode.Created)
          .json({ message: "User created successfully" });
      }

      return res
        .status(HttpStatusCode.Accepted)
        .json({ message: "User Login Successful" });
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

      const { accessToken, refreshToken } = loginResponse;
      console.log(accessToken,'1');
      console.log(refreshToken,'2');

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
        accessToken
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

  async logoutUser(req: Request, res: Response): Promise<any> {
    try {
      const refreshToken = req.cookies.refreshToken;
      await this.authService.logout(refreshToken);
      res.clearCookie("refreshToken",{
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
