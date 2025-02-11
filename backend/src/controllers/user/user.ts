import HTTP_statusCode from "../../enums/httpStatusCode";
import { IUserService } from "../../interface/user/User.service.interface";
import { Request, Response } from "express";
import User from "../../model/userModel";

export class UserController {
  private userService: IUserService;

  constructor(userServiceInstance: IUserService) {
    this.userService = userServiceInstance;
  }

  async getDoctors(req: Request, res: Response): Promise<any> {
    try {
      const doctors = await this.userService.getDoctors();

      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { doctors },
        message: "Doctors fetched successfully",
      })
    } catch (error: any) {
      console.error("Error in getDoctors:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }
}
