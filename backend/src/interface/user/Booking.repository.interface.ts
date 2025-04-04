
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
  delCoupons(id: string): Promise<boolean>;
  findConflictingAppointments(doctorId: string, date: Date, time: string): Promise<IAppointment[]>;
  bookAppointment(data: Partial<IAppointment>): Promise<any>;
  bookAppointmentUsingWallet(data: Partial<IAppointment>): Promise<IAppointment>;
  findAppointmentByPatientId(appointmentId: string): Promise<IAppointment | null>;
  updateByAppointmentId(appointmentId: string, data: Partial<IAppointment>): Promise<IAppointment | null>;
  getPatientAppointments(id: string): Promise<IAppointment[]>;
  addMedicalRecord(appointmentId: string, newMedicalRecord: any): Promise<IAppointment | null>;
  cancelAppointment(appointmentId: string): Promise<IAppointment | null>;
  findAppointmentById(appointmentId: string): Promise<IAppointment | null>;
  getDoctorAppointments(id: string): Promise<IAppointment[]>;
  addReviewForDoctor(id: string, rating: number, description: string): Promise<IAppointment | null>;
}
