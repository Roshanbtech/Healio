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

  // async verifyOtp(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { email, otp } = req.body;
  //     if (!email || !otp) {
  //       res.status(HTTP_statusCode.BadRequest).json({ message: "Email and OTP are required" });
  //       return;
  //     }

  //     const response = await this.authService.verifyOtp(email, otp);
  //     res.status(HTTP_statusCode.OK).json(response);
  //   } catch (error) {
  //     res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong" });
  //   }
  // }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(HTTP_statusCode.BadRequest).json({ message: "Email is required" });
        return;
      }

      const response = await this.authService.resendOtp(email);
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong" });
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
        
            return res.status(HttpStatusCode.Created).json({ message: "User created successfully" }); 
        }

        return res.status(HttpStatusCode.Accepted).json({ message: "User Login Successful" }); 
    } catch (error) {
        console.error(error);

        if (!res.headersSent) { 
            return res.status(HttpStatusCode.InternalServerError).json({ message: "Authentication failed" });
        }
    }
}


  
}

// const jwt_secret: any = process.env.JWT_SECRET;
  
      // const token = jwt.sign({ id: user._id, role: user.role }, jwt_secret, {
      //   expiresIn: "1d",
      // });
  
      // res.cookie("authToken", token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      // });
  
      // console.log("Cookies set successfully.");
      // res.setHeader("Authorization", `Bearer ${token}`);
      // console.log("------------------- email", user.email);
      // Respond with login success