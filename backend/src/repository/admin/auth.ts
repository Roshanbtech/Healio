import userModel from "../../model/userModel";
import doctorModel from "../../model/doctorModel";
import serviceModel from "../../model/serviceModel";
import couponModel from "../../model/couponModel";

import { IAuthRepository } from "../../interface/admin/Auth.repository.interface";
import sendMail from "../../config/emailConfig";

export class AuthRepository implements IAuthRepository {
  async logout(refreshToken: string): Promise<any> {
    try {
      console.log(refreshToken, "refresh token");
      return await userModel.updateOne(
        { refreshToken },
        { $set: { refreshToken: "" } }
      );
      console.log("Logout successful");
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async getAllUsers(): Promise<any> {
    try {
      const users = await userModel.find().lean();
      return users;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getAllDoctors(): Promise<any> {
    try {
      const doctors = await doctorModel
        .find()
        .populate({ path: "speciality", model: "Service", select: "name" })
        .lean();
      return doctors;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleUser(id: string): Promise<any> {
    try {
      const user = await userModel.findById(id);
      if (!user) return null;

      user.isBlocked = !user.isBlocked;
      await user.save();

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleDoctor(id: string): Promise<any> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;

      doctor.isBlocked = !doctor.isBlocked;
      await doctor.save();

      return doctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addService(name: string, isActive: boolean): Promise<any> {
    const service = new serviceModel({ name, isActive });
    return await service.save();
  }

  async createCoupon(couponData: any): Promise<any> {
    try {
      const coupon = new couponModel(couponData);
      return await coupon.save();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getAllCoupons(): Promise<any> {
    try {
      const coupons = await couponModel.find().lean();
      return coupons;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async existCoupon(code:string): Promise<any>{
    try{
      return await couponModel.findOne({code});
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async editService(id: string, name: string, isActive: boolean): Promise<any> {
    const service = await serviceModel.findById(id);
    if (!service) return null;

    service.name = name;
    service.isActive = isActive;
    return await service.save();
  }

  async editCoupon(id: string, couponData: any): Promise<any> {
    try{
      const coupon = await couponModel.findById(id);
      if(!coupon) return null;
      coupon.name = couponData.name;
      coupon.code = couponData.code;
      coupon.discount = couponData.discount;
      coupon.startDate = couponData.startDate;
      coupon.expirationDate = couponData.expirationDate;
      coupon.isActive = couponData.isActive;
      return await coupon.save();
    } catch (error: any){
      throw new Error(error.message);
    }
  }

  async toggleService(id: string): Promise<any> {
    try {
      const service = await serviceModel.findById(id);
      if (!service) return null;

      service.isActive = !service.isActive;
      await service.save();

      return service;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleCoupon(id: string): Promise<any> {
      try{
        const coupon = await couponModel.findById(id);
        if(!coupon) return null;
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        return coupon;
      } catch (error: any){
        throw new Error(error.message);
      }
  }

  async getAllServices(): Promise<any> {
    try {
      const services = await serviceModel.find().lean();
      return services;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async findServiceByName(name: string): Promise<any> {
    try {
      const service = await serviceModel.findOne({ name });
      return service;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCertificates(id: string): Promise<any> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;
      return doctor.certificate;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async approveDoctor(id: string): Promise<any> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;
      const emailContent = `Hello Dr. ${doctor.name},

Congratulations! Your account has been approved as a doctor in the Healio team.

Thank you,
Team Healio`;
      await sendMail(doctor.email, "Account Approved", emailContent);
      return await doctorModel.findByIdAndUpdate(
        id,
        { docStatus: "approved", isDoctor: true },
        { new: true }
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async rejectDoctor(id: string): Promise<any> {
    try {
      const doctor = await doctorModel.findById(id);
      if (!doctor) return null;
      const emailContent = `Hello Dr. ${doctor.name},

We regret to inform you that your account has been rejected as a doctor in the Healio team.

Thank you,
Team Healio`;
      await sendMail(doctor.email, "Account Rejected", emailContent);
      return await doctorModel.findByIdAndUpdate(
        id,
        { docStatus: "rejected", isDoctor: false },
        { new: true }
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
