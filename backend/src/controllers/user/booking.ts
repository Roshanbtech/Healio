import HTTP_statusCode from "../../enums/httpStatusCode";
import { Request, Response } from "express";
import { IBookingService } from "../../interface/user/Booking.service.interface";

export class BookingController {
  private bookingService: IBookingService

  constructor(bookingServiceInstance: IBookingService) {
    this.bookingService = bookingServiceInstance;
  } 

  async getCoupons(req: Request, res: Response): Promise<any> {
    try {
      const coupons = await this.bookingService.getCoupons();
      return res.status(HTTP_statusCode.OK).json({ status: true, coupons });
    } catch (error: any) {
      console.error("Error in getCoupons:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }
}
