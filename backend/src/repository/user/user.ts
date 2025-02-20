import userModel from "../../model/userModel";
import doctorModel from "../../model/doctorModel";
import serviceModel from "../../model/serviceModel";
import slotModel from "../../model/slotModel";
import { Schedule } from "../../interface/doctorInterface/Interface";
import {
  DoctorDetails,
  Service,
} from "../../interface/userInterface/interface";
import { IUserRepository } from "../../interface/user/User.repository.interface";
import { paginate, PaginationOptions } from "../../helper/pagination";
import bcrypt from "bcrypt";

export class UserRepository implements IUserRepository {
  async getDoctors(options: PaginationOptions): Promise<any> {
    try {
      const doctors = await paginate(
        doctorModel,
        {
          ...options,
          populate: { path: "speciality", select: "name" },
        },
        { isDoctor: true, isBlocked: false }
      );
      return doctors;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getDoctorDetails(id: string): Promise<any> {
    try {
      const doctor = await doctorModel
        .findById(id)
        .populate({ path: "speciality", select: "name" })
        .lean();
      return doctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getServices(): Promise<any> {
    try {
      const services = await serviceModel.find({ isActive: true }).lean();
      return services;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async getUserProfile(id: string): Promise<any> {
    try {
      const user = await userModel.findById(id);
      if (!user) return null;
      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async editUserProfile(id: string, data: any): Promise<any> {
    try {
      const updatedUser = await userModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<any> {
    try {
      const user = await userModel.findById(id);
      if (!user) throw new Error("Doctor not found");

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return { status: false, message: "Old password is incorrect" };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userModel.findByIdAndUpdate(id, {
        $set: { password: hashedPassword },
      });
      return { status: true, message: "Password changed successfully" };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  async getScheduleForDoctor(id: string): Promise<any> {
    try {
      const schedules = await slotModel.find({ doctor: id }).lean();
      return schedules;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
}
