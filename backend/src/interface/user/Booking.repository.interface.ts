
export interface Coupon {
  _id: string;
  name: string;
  code: string;
  discount: number;
  expirationDate: string;
  isActive: boolean;
}
import { ICoupon } from "../../model/couponModel";
import { IAppointment } from "../../model/appointmentModel";

export interface IBookingRepository {
  getCoupons(): Promise<ICoupon[]>;
  findConflictingAppointments(doctorId: string, date: Date, time: string): Promise<IAppointment[]>;
  bookAppointment(data: Partial<IAppointment>): Promise<any>;
  findAppointmentById(appointmentId: string): Promise<IAppointment | null>;
  updateByAppointmentId(appointmentId: string, data: Partial<IAppointment>): Promise<IAppointment | null>;
//   getPatientAppointments(patientId: string): Promise<IAppointment[]>;
// cancelAppointment(appointmentId: string): Promise<IAppointment | null>;
}
