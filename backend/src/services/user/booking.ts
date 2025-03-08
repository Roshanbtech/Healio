import { IBookingRepository } from "../../interface/user/Booking.repository.interface";
import { DoctorRepository } from "../../repository/doctor/doctor";
import { UserRepository } from "../../repository/user/user";
import { IBookingService } from "../../interface/user/Booking.service.interface";
import { razorPayInstance } from "../../config/razorpay";
import { IAppointment } from "../../model/appointmentModel";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export class BookingService implements IBookingService {
  private bookingRepository: IBookingRepository;
  private doctorRepository: DoctorRepository;
  private userRepository: UserRepository;

  constructor(bookingRepository: IBookingRepository) {
    this.bookingRepository = bookingRepository;
    this.doctorRepository = new DoctorRepository();
    this.userRepository = new UserRepository();
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

      const appointment = await this.bookingRepository.findAppointmentByPatientId(bookingId);
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
      const { doctorId, fees, appointmentId } = updatedAppointment;
      await this.doctorRepository.updateWalletTransaction(doctorId.toString(), fees ?? 0, appointmentId);
      return updatedAppointment;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async getPatientAppointments(id: string): Promise<IAppointment[]> {
    try {
      return await this.bookingRepository.getPatientAppointments(id);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addMedicalRecord(appointmentId: string, newMedicalRecord: any): Promise<IAppointment | null>{
    try{
     const updatedAppointment = await this.bookingRepository.addMedicalRecord(appointmentId, newMedicalRecord);
     return updatedAppointment
    }catch(error:any){
      throw new Error(error.message);
    }
  }

  async cancelAppointment(appointmentId: string): Promise<IAppointment> {
    try {
      console.log("cancelAppointment: Starting cancellation for appointmentId:", appointmentId);
      const appointment = await this.bookingRepository.findAppointmentById(appointmentId);
      console.log("cancelAppointment: Retrieved appointment:", appointment);
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      if (appointment.status === "cancelled") {
        throw new Error("Appointment is already cancelled");
      }
      const isPending = appointment.status === "pending";
      console.log("cancelAppointment: isPending =", isPending);
      const updatedAppointment = await this.bookingRepository.cancelAppointment(appointmentId);
      console.log("cancelAppointment: Updated appointment:", updatedAppointment);
      if (!updatedAppointment) {
        throw new Error("Failed to cancel appointment");
      }
      if (isPending) {
        const refundAmount = appointment.fees || 0;
        console.log("cancelAppointment: Refund amount =", refundAmount);
        console.log("cancelAppointment: Calling refundToUser with patientId:", appointment.patientId);
        await this.userRepository.refundToUser(appointment.patientId.toString(), refundAmount);
        console.log("cancelAppointment: refundToUser completed");
        console.log("cancelAppointment: Calling deductFromDoctorWallet with doctorId:", appointment.doctorId);
        await this.doctorRepository.deductFromDoctorWallet(appointment.doctorId.toString(), refundAmount);
        console.log("cancelAppointment: deductFromDoctorWallet completed");
      }
      return updatedAppointment;
    } catch (error: any) {
      console.error("cancelAppointment: Error:", error);
      throw error;
    }
  }

  async getDoctorAppointments(id: string): Promise<IAppointment[]> {
    try{
      const docAppointment = await this.bookingRepository.getDoctorAppointments(id);
      return docAppointment;
    }catch(error:any){
      throw new Error(error.message);
    }
  }
  
  
}