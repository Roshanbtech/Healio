// import userModel from "../../model/userModel";
import doctorModel from "../../model/doctorModel";
import { DoctorDetails, Service } from "../../interface/userInterface/interface";
import { IUserRepository } from "../../interface/user/User.repository.interface";

export class UserRepository implements IUserRepository {
    async getDoctors(): Promise<any> {
        try {
          const doctors = await doctorModel
            .find({isDoctor: true})
            .populate({ path: "speciality", model: "Service", select: "name" })
            .lean();
          return doctors;
        } catch (error: any) {
          throw new Error(error.message);
        }
      } 
}