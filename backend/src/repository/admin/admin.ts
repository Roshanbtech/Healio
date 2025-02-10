// import userModel from "../../model/userModel";
// import doctorModel from "../../model/doctorModel";

// import { IAuthRepository } from "../../interface/admin/Auth.repository.interface";

// export class AuthRepository implements IAuthRepository {
//   async getAllUsers(): Promise<any> {
//     try {
//       const users = await userModel.find().lean();
//       return users;
//     } catch (error: any) {
//       throw new Error(error.message);
//     }
//   }

//   async getAllDoctors(): Promise<any> {
//     try {
//       const doctors = await doctorModel.find().lean();
//       return doctors;
//     } catch (error: any) {
//       throw new Error(error.message);
//     }
//   }

//   async toggleUser(id: string): Promise<any> {
//     try {
//       const user = await userModel.findById(id);
//       if (!user) return null;

//       user.isBlocked = !user.isBlocked;
//       await user.save();

//       return user;
//     } catch (error: any) {
//       throw new Error(error.message);
//     }
//   }

//   async toggleDoctor(id: string): Promise<any> {
//     try {
//       const doctor = await doctorModel.findById(id);
//       if (!doctor) return null;

//       doctor.isBlocked = !doctor.isBlocked;
//       await doctor.save();

//       return doctor;
//     } catch (error: any) {
//       throw new Error(error.message);
//     }
//   }
// }
