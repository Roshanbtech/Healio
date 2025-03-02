import { IBookingRepository } from "../../interface/user/Booking.repository.interface";
import { IBookingService } from "../../interface/user/Booking.service.interface";
import { razorPayInstance } from "../../config/razorpay";
import { IAppointment } from "../../model/appointmentModel";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export class BookingService implements IBookingService {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository: IBookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  async getCoupons(): Promise<any> {
    try {
      return await this.bookingRepository.getCoupons();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async bookAppointment(appointmentData: IAppointment): Promise<any> {
    try {
      // Check for conflicting appointments
      const conflictingAppointments = await this.bookingRepository.findConflictingAppointments(
        appointmentData.doctorId.toString(),
        appointmentData.date,
        appointmentData.time
      );

      if (conflictingAppointments.length > 0) {
        throw new Error("Doctor already has an appointment at this time");
      }

      // Generate unique appointment ID
      const appointmentId = `APT${Date.now().toString().slice(-5)}${Math.floor(
        Math.random() * 10
      )}`;

      // Create Razorpay order if fees exist
      let order = null;
      if (appointmentData.fees && appointmentData.paymentMethod === "razorpay") {
        const options = {
          amount: appointmentData.fees * 100, 
          currency: "INR",
          receipt: `receipt_appointment_${Math.floor(Math.random() * 1000)}`,
          payment_capture: 1,
        };

        order = await razorPayInstance.orders.create(options);
      }

      // Build appointment data to be saved
      const appointment: Partial<IAppointment> = {
        appointmentId,
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId,
        date: appointmentData.date,
        time: appointmentData.time,
        status: "pending",
        fees: appointmentData.fees,
        paymentMethod: appointmentData.paymentMethod || "razorpay",
        paymentStatus: appointmentData.fees && appointmentData.paymentMethod === "razorpay" ? "payment pending" : "anonymous",
        couponCode: appointmentData.couponCode,
        couponDiscount: appointmentData.couponDiscount,
        isApplied: appointmentData.isApplied,
      };

      let result = await this.bookingRepository.bookAppointment(appointment);
      console.log(result,order,appointmentId)
      return {
        result,
        order,
        appointmentId
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyBooking(data: any): Promise<IAppointment> {
    try {
      const { razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature, bookingId } = data;
      console.log("1",bookingId,razorpay_order_id,razorpay_payment_id,razorpay_signature)

      const appointment = await this.bookingRepository.findAppointmentById(bookingId);
      console.log("2")

      if (!appointment) {
        throw new Error("Appointment not found");
      }
      console.log("3")
      const key_secret = process.env.PAYMENT_KEY_SECRET || "";
      console.log("3.1",key_secret)
      const hmac = crypto.createHmac("sha256", key_secret);
      console.log("3.2",hmac)
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      console.log("3.3",hmac)
      const generated_signature = hmac.digest("hex");
      console.log("3.4",razorpay_signature,generated_signature)
      
      if (generated_signature !== razorpay_signature) {
        throw new Error("Payment verification failed");
      }
      console.log("4")
      const updatedAppointment = await this.bookingRepository.updateByAppointmentId(
        bookingId,
        {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          paymentStatus: "payment completed",
          status: "pending" 
        }
      );  
      console.log("5")
      if (!updatedAppointment) {
        throw new Error("Failed to update appointment");
      }
      console.log("6")
      return updatedAppointment;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  // async getPatientAppointments(patientId: string): Promise<IAppointment[]> {
  //   try {
  //     return await this.bookingRepository.getPatientAppointments(patientId);
  //   } catch (error: any) {
  //     throw new Error(error.message);
  //   }
  // }

  // // New: Cancel an appointment for a patient
  // async cancelAppointment(appointmentId: string): Promise<IAppointment> {
  //   try {
  //     const appointment = await this.bookingRepository.findAppointmentById(appointmentId);
  //     if (!appointment) {
  //       throw new Error("Appointment not found");
  //     }
  //     if (appointment.status === "cancelled" || appointment.status === "cancelled by Dr") {
  //       throw new Error("Appointment is already cancelled");
  //     }
  //     const updatedAppointment = await this.bookingRepository.cancelAppointment(appointmentId);
  //     if (!updatedAppointment) {
  //       throw new Error("Failed to cancel appointment");
  //     }
  //     return updatedAppointment;
  //   } catch (error: any) {
  //     throw error;
  //   }
  // }
}