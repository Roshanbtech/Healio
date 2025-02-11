import doctorModel from "../../model/doctorModel";
import serviceModel from "../../model/serviceModel";
import { IDoctorRepository } from "../../interface/doctor/Auth.repository.interface";
import { Service } from "../../interface/doctorInterface/Interface";

export class DoctorRepository implements IDoctorRepository {
  async getServices(): Promise<Service[]> {
    try {
      const services = await serviceModel.find({ isActive: true }).lean();
      return services;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addQualification(data: any, doctorId: string): Promise<any> {
    try {
      const updatedDoctor = await doctorModel.findByIdAndUpdate(
        doctorId,
        { $set: data },
        { new: true }
      );
      return updatedDoctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getQualifications(id: string): Promise<any> {
    try {
      const doctor = await doctorModel
        .findOne({ _id: id, docStatus: "approved" })
        .populate({ path: "speciality", model: "Service", select: "name" })
        .lean();
      if (!doctor) return null;
      return doctor;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
