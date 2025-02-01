import {Request,Response } from "express";
import  HTTP_statusCode from "../../enums/httpStatusCode";
import { IAuthService } from "../../interface/doctor/Auth.service.interface";


export class AuthController {
    private authService: IAuthService;
    constructor(authServiceInstance: IAuthService) {
        this.authService = authServiceInstance;
    }
    
    async createDoctor(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            const response = await this.AuthService.signup(data);
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

}
