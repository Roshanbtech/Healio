import { GenericRepository } from "../GenericRepository";
import CouponModel, { ICoupon } from "../../model/couponModel";
import AppointmentModel, { IAppointment } from "../../model/appointmentModel";
import { IBookingRepository } from "../../interface/user/Booking.repository.interface";

export class BookingRepository implements IBookingRepository {
  private couponRepo: GenericRepository<ICoupon>;
  private appointmentRepo: GenericRepository<IAppointment>;

  constructor() {
    this.couponRepo = new GenericRepository<ICoupon>(CouponModel);
    this.appointmentRepo = new GenericRepository<IAppointment>(AppointmentModel);
  }

  async getCoupons(): Promise<ICoupon[]> {
    return this.couponRepo.findAll({ isActive: true });
  }

  async findConflictingAppointments(
    doctorId: string,
    date: Date,
    time: string
  ): Promise<IAppointment[]> {
    return this.appointmentRepo.findAll({
      doctorId,
      date: new Date(date),
      time,
      status: { $nin: ["cancelled", "cancelled by Dr"] },
    });
  }

  async bookAppointment(data: Partial<IAppointment>): Promise<any> {
    return this.appointmentRepo.create(data);
  }

  async findAppointmentById(appointmentId: string): Promise<IAppointment | null> {
    return this.appointmentRepo.findOne(appointmentId);
  }

  async updateByAppointmentId(
    appointmentId: string,
    data: Partial<IAppointment>
  ): Promise<IAppointment | null> {
    return this.appointmentRepo.updateOne(appointmentId, data);
  }
  // async getPatientAppointments(patientId: string): Promise<IAppointment[]> {
  //   return this.appointmentRepo.findAll({ patientId });
  // }

  // // New: Cancel an appointment (updates its status)
  // async cancelAppointment(appointmentId: string): Promise<IAppointment | null> {
  //   return this.appointmentRepo.update(appointmentId, { status: "cancelled" });
  // }
}