import HTTP_statusCode from "../../enums/httpStatusCode";
import { Request, Response } from "express";
import { IBookingService } from "../../interface/user/Booking.service.interface";
import { IAppointment } from "../../model/appointmentModel";

export class BookingController {
  private bookingService: IBookingService;

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

  async bookAppointment(req: Request, res: Response): Promise<any> {
    try {
      const {
        patientId,
        doctorId,
        date,
        time,
        fees,
        isApplied,
        couponCode,
        couponDiscount,
        paymentMethod,
      } = req.body;

      // Validate required fields
      if (!patientId || !doctorId || !date || !time || fees === undefined) {
        return res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "All required fields must be provided.",
        });
      }

      const data = {
        patientId,
        doctorId,
        date,
        time,
        fees,
        isApplied,
        couponCode,
        couponDiscount,
        paymentMethod,
      } as IAppointment;

      const appointment = await this.bookingService.bookAppointment(data);

      return res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Appointment booked successfully.",
        appointment,
      });
    } catch (error: any) {
      console.error("Error in bookAppointment:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async verifyBooking(req: Request, res: Response): Promise<any> {
    try{
      const {  bookingId, response } = req.body;
      console.log("1")
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
    console.log("1.1",response)
    console.log("1.2",razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId)
    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature){
      return res.status(HTTP_statusCode.BadRequest).json({
        status: false,
        message: "All required fields must be provided.",
      });
    }
    console.log("2")
    const data = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    }
    console.log("3",data)
    const appointment = await this.bookingService.verifyBooking(data);
    console.log("4")
    return res.status(HTTP_statusCode.OK).json({
      status: true,
      message: "Appointment verified successfully.",
      appointment,
    });
    }catch(error: any){
      console.log("Error in verifyBooking:", error);
      return res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      })
    }
  }

  // async getPatientAppointments(req: Request, res: Response): Promise<any> {
  //   try {
  //     const { patientId } = req.body;
  //     if (!patientId) {
  //       return res.status(HTTP_statusCode.BadRequest).json({
  //         status: false,
  //         message: "Patient ID is required.",
  //       });
  //     }
  //     const appointments = await this.bookingService.getPatientAppointments(patientId);
  //     return res.status(HTTP_statusCode.OK).json({
  //       status: true,
  //       appointments,
  //     });
  //   } catch (error: any) {
  //     console.error("Error in getPatientAppointments:", error);
  //     return res.status(HTTP_statusCode.InternalServerError).json({
  //       status: false,
  //       message: "Something went wrong, please try again later.",
  //     });
  //   }
  // }

  // // New: Cancel an appointment
  // async cancelAppointment(req: Request, res: Response): Promise<any> {
  //   try {
  //     const { appointmentId } = req.body;
  //     if (!appointmentId) {
  //       return res.status(HTTP_statusCode.BadRequest).json({
  //         status: false,
  //         message: "Appointment ID is required.",
  //       });
  //     }
  //     const appointment = await this.bookingService.cancelAppointment(appointmentId);
  //     return res.status(HTTP_statusCode.OK).json({
  //       status: true,
  //       message: "Appointment cancelled successfully",
  //       appointment,
  //     });
  //   } catch (error: any) {
  //     console.error("Error in cancelAppointment:", error);
  //     return res.status(HTTP_statusCode.InternalServerError).json({
  //       status: false,
  //       message: "Something went wrong, please try again later.",
  //     });
  //   }
  // }
}