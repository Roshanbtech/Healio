import { userType,DoctorDetails } from "../../interface/userInterface/interface";
import {IUserService} from "../../interface/user/User.service.interface";
import {IUserRepository}  from "../../interface/user/User.repository.interface";

export class UserService implements IUserService {
  private UserRepository: IUserRepository;

  private userData: userType | null = null;

  constructor(AuthRepository: IUserRepository) {
    this.UserRepository = AuthRepository;
  }

  async getDoctors(): Promise<any> {
    try {
      const doctors = await this.UserRepository.getDoctors();
      if (!doctors) {
        return null;
      }
      return doctors;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}