import HTTP_statusCode from "../../enums/httpStatusCode";
import { Request, Response } from "express";
import { IBookingService } from "../../interface/user/Booking.service.interface";
import { IAppointment } from "../../model/appointmentModel";

export class BookingController {
  private bookingService: IBookingService;

  constructor(bookingServiceInstance: IBookingService) {
    this.bookingService = bookingServiceInstance;
  }

  async getCoupons(req: Request, res: Response): Promise<void> {
    try {
      const coupons = await this.bookingService.getCoupons();
      res.status(HTTP_statusCode.OK).json({ status: true, coupons });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async delCoupons(req: Request, res: Response): Promise<void>{
    try{
      const { id } = req.params;
      const coupon = await this.bookingService.delCoupons(id);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Coupon deleted successfully",
      });
    } catch (error) {
      console.error("Error in delCoupons:", error);
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  

  async bookAppointment(req: Request, res: Response): Promise<void> {
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

      if (!patientId || !doctorId || !date || !time || fees === undefined) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "All required fields must be provided.",
        });
        return;
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

      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Appointment booked successfully.",
        appointment,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

  async verifyBooking(req: Request, res: Response): Promise<void> {
    try{
      const {  bookingId, response } = req.body;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature){
      res.status(HTTP_statusCode.BadRequest).json({
        status: false,
        message: "All required fields must be provided.",
      });
      return;
    }
    const data = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    }
    const appointment = await this.bookingService.verifyBooking(data);
    res.status(HTTP_statusCode.OK).json({
      status: true,
      message: "Appointment verified successfully.",
      appointment,
    });
    } catch(error: unknown){
      if(error instanceof Error){
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

  async retryPayment(req: Request, res: Response): Promise<void> {
    try{
      const {bookingId} = req.params;
      if(!bookingId){
       res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Booking ID is required.",
        });
        return;
      }
      const appointment = await this.bookingService.retryPayment(bookingId);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Payment retried successfully.",
        appointment,
      });
    } catch(error: unknown){
      if(error instanceof Error){
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

  async getPatientAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
         res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Patient ID is required.",
        });
        return
      }
      const appointments = await this.bookingService.getPatientAppointments(id);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        appointments,
      });
    } catch(error: unknown){
      if(error instanceof Error){
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

  async bookAppointmentUsingWallet(req: Request, res: Response): Promise<void> {
    try{
      const { patientId, doctorId, date, time, fees, isApplied, couponCode, couponDiscount, paymentMethod } = req.body;
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
        status : "pending" as "pending",
        paymentStatus : "payment completed" as "payment completed",
      } as IAppointment;
      const appointment = await this.bookingService.bookAppointmentUsingWallet(data);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Appointment booked successfully.",
        appointment,
      });
    } catch( error: unknown){
      if(error instanceof Error){
        res.status(HTTP_statusCode.InternalServerError).json({
          status: false,
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }

  async getDoctorAppointments(req: Request, res: Response): Promise<void> {
    try{
       const { id } = req.params;
       const docAppointment = await this.bookingService.getDoctorAppointments(id);
       res.status(HTTP_statusCode.OK).json({
        status: true,
        docAppointment,
      });
    }catch(error){
      res.status(HTTP_statusCode.InternalServerError).json({
      status: false,
      message: "Something went wrong, please try again later.",
    });
  }
  }

  async addMedicalRecord(req: Request, res: Response): Promise<void> {
    try {
       const appointmentId = req.params.id;
       const { recordDate, condition, symptoms, medications, notes } = req.body;
       if(!recordDate || !condition || !symptoms || !medications || !notes){
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "All required fields must be provided.",
        });
        return;
       }
       const newMedicalRecord = {
        recordDate: recordDate ? new Date(recordDate) : new Date(),
        condition,
        symptoms:
          typeof symptoms === "string"
          ? symptoms.split(",").map((symptom: string) => symptom.trim())
          : symptoms,
        medications:
          typeof medications === "string"
          ? medications.split(",").map((medication: string) => medication.trim())
          : medications,
        notes,
       }
       const medicalRecord = await this.bookingService.addMedicalRecord(appointmentId, newMedicalRecord);
       res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Medical record added successfully",
        medicalRecord,
       });
    }catch(error){
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
  }
  }

  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointmentId = req.params.id;
      if (!appointmentId) {
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "Appointment ID is required.",
        });
        return;
      }
      const appointment = await this.bookingService.cancelAppointment(appointmentId);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Appointment cancelled successfully",
        appointment,
      });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }

  async addReviewForDoctor(req: Request, res: Response): Promise<void> {
    try{
      const { id } = req.params;
      const { rating, description } = req.body;
      if(!rating || !description){
        res.status(HTTP_statusCode.BadRequest).json({
          status: false,
          message: "All required fields must be provided.",
        });
        return;
      }
      const reviewForDoctor = await this.bookingService.addReviewForDoctor(id, rating, description);
      res.status(HTTP_statusCode.OK).json({
        status: true,
        message: "Review added successfully",
        reviewForDoctor,
      });
    }catch(error){
      res.status(HTTP_statusCode.InternalServerError).json({
        status: false,
        message: "Something went wrong, please try again later.",
      });
    }
  }
}