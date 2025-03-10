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

  async findAppointmentByPatientId(appointmentId: string): Promise<IAppointment | null> {
    return this.appointmentRepo.findOne(appointmentId);
  }

  async findAppointmentById(appointmentId: string): Promise<IAppointment | null>{
    return this.appointmentRepo.findById(appointmentId);
  }


  async updateByAppointmentId(
    appointmentId: string,
    data: Partial<IAppointment>
  ): Promise<IAppointment | null> {
    return this.appointmentRepo.updateOne(appointmentId, data);
  }
  async getPatientAppointments(id: string): Promise<IAppointment[]> {
    return this.appointmentRepo
      .findAllQuery({ patientId: id })
      .populate("patientId", "name email phone")
      .populate({
        path: "doctorId",
        select: "name image speciality", 
        populate: {
          path: "speciality", 
          select: "name"      
        }
      })
      // .populate("prescription")
      .exec();
  }
  
  async addMedicalRecord(appointmentId: string, newMedicalRecord: any): Promise<IAppointment | null> {
    return this.appointmentRepo.updateWithOperators(appointmentId, { $push: { medicalRecords: newMedicalRecord } });
  }
  
  async cancelAppointment(appointmentId: string): Promise<IAppointment | null> {
    return this.appointmentRepo.update(appointmentId, { status: "cancelled" });
  }

  async getDoctorAppointments(id: string): Promise<IAppointment[]> {
    return this.appointmentRepo.findAll({ doctorId: id , status: { $in: ["pending", "accepted", "completed"] }});
  }

  async addReviewForDoctor(id: string, rating: number, description: string): Promise<IAppointment | null> {
    return this.appointmentRepo.updateWithOperators(id, { $set: { review: { rating, description } } });
  }
  
  
}