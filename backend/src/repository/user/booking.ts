import { GenericRepository } from "../GenericRepository";
import CouponModel, { ICoupon } from "../../model/couponModel";
import AppointmentModel, { IAppointment } from "../../model/appointmentModel";
import UserModel, { Iuser } from "../../model/userModel";
import { IBookingRepository } from "../../interface/user/Booking.repository.interface";

export class BookingRepository implements IBookingRepository {
  private couponRepo: GenericRepository<ICoupon>;
  private appointmentRepo: GenericRepository<IAppointment>;
  private userRepo: GenericRepository<Iuser>;
  

  constructor() {
    this.couponRepo = new GenericRepository<ICoupon>(CouponModel);
    this.appointmentRepo = new GenericRepository<IAppointment>(
      AppointmentModel
    );
    this.userRepo = new GenericRepository<Iuser>(UserModel);
  }

  async getCoupons(): Promise<ICoupon[]> {
    return this.couponRepo.findAll({ isActive: true });
  }

  async delCoupons(id: string): Promise<boolean> {
    try{
      const coupon = await this.couponRepo.findById(id);
      if (!coupon) {
        throw new Error("Coupon not found");
      }
      const couponUsedCount = await this.appointmentRepo.countDocuments({couponCode: coupon.code});
      if (couponUsedCount < 50) {
        throw new Error("Coupon cannot be deleted as it has been used in appointments");
      }
      const result = await this.couponRepo.delete(id);
      if (!result) {
        throw new Error("Failed to delete coupon");
      }
      return true;
    }catch(error){
      console.error("Error in delCoupons:", error);
      throw error;
    }
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

  async bookAppointmentUsingWallet(data: IAppointment): Promise<IAppointment> {
    try {
      const patient = await this.userRepo.findById(data.patientId as unknown as string);
      if (!patient) {
        throw new Error("Patient not found");
      }
      if (patient.wallet?.balance === undefined || data.fees === undefined) {
        throw new Error("Invalid data");
      }
      if (patient.wallet.balance < data.fees) {
        throw new Error("Insufficient balance");
      }
      const newBalance = patient.wallet.balance - data.fees;
      const newTransaction = {
        amount: data.fees,
        transactionType: "debit" as "debit",
        description: "Deducted for appointment booking using wallet",
        date: new Date(),
      };
      const updatedTransactions = [...(patient.wallet.transactions || []), newTransaction];
      await this.userRepo.update(String(patient._id), {
        wallet: { balance: newBalance, transactions: updatedTransactions },
      });
      const newAppointment = await this.appointmentRepo.create(data);
      return newAppointment;
    } catch (error: any) {
      console.error("Error in bookAppointmentUsingWallet:", error);
      throw error;
    }
  }
  

  async findAppointmentByPatientId(
    appointmentId: string
  ): Promise<IAppointment | null> {
    return this.appointmentRepo.findOne(appointmentId);
  }

  async findAppointmentById(
    appointmentId: string
  ): Promise<IAppointment | null> {
    return this.appointmentRepo.findById(appointmentId);
  }

  async updateByAppointmentId(
    appointmentId: string,
    data: Partial<IAppointment>
  ): Promise<IAppointment | null> {
    return this.appointmentRepo.updateOne(appointmentId, data);
  }
  async getPatientAppointments(id: string): Promise<IAppointment[]> {
    return (
      this.appointmentRepo
        .findAllQuery({ patientId: id })
        .populate("patientId", "name email phone age gender")
        .populate({
          path: "doctorId",
          select: "name image speciality",
          populate: {
            path: "speciality",
            model: "Service",
            select: "name",
          },
        })
        .populate("prescription", "_id diagnosis medicines labTests advice followUpDate doctorNotes signature createdAt updatedAt")
        .exec()
    );
  }

  async addMedicalRecord(
    appointmentId: string,
    newMedicalRecord: any
  ): Promise<IAppointment | null> {
    return this.appointmentRepo.updateWithOperators(appointmentId, {
      $push: { medicalRecords: newMedicalRecord },
    });
  }

  async cancelAppointment(appointmentId: string): Promise<IAppointment | null> {
    return this.appointmentRepo.update(appointmentId, { status: "cancelled" });
  }

  async getDoctorAppointments(id: string): Promise<IAppointment[]> {
    return this.appointmentRepo.findAll({
      doctorId: id,
      status: { $in: ["pending", "accepted", "completed"] },
    });
  }

  async addReviewForDoctor(
    id: string,
    rating: number,
    description: string
  ): Promise<IAppointment | null> {
    const updatedAppointment = await this.appointmentRepo.updateWithOperators(
      id,
      {
        $set: { review: { rating, description } },
      }
    );

    if (updatedAppointment) {
      await updatedAppointment.populate("patientId", "name email");
      await updatedAppointment.populate("doctorId", "name specialty email");
    }

    return updatedAppointment;
  }
}
