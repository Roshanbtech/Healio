import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { userType } from "../../interface/userInterface/interface";
import { IAuthService } from "../../interface/user/Auth.service.interface";
import { IAuthRepository } from "../../interface/user/Auth.repository.interface";
//import user schema
import userModel from "../../model/userModel";
// import sendMail from "../../config/emailConfig";

export class AuthService implements IAuthService {
    private AuthRepository: IAuthRepository;
    private OTP: string | null = null;
    private expiryOTP_time: Date | null = null;
    private userData: userType | null = null;
  
    constructor(AuthRepository: IAuthRepository) {
      this.AuthRepository = AuthRepository;
    }
 async signup(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmpassword: string;
  }): Promise<any>  {
    try {
        console.log('starting')
      const response = await this.AuthRepository.existUser(
        userData.email,
        userData.phone
      );
      console.log('small work',response)
      if (response.existEmail) {
        throw new Error("Email already in use");
      }
      if (response.existPhone) {
        throw new Error("Phone already in use");
      }

      let saltRounds: number = 10;

      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const userId = uuidv4();
      this.userData = {
        userId: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
      };
      const res = await userModel.create(this.userData);
      console.log(res);
    //   const Generated_OTP: string = Math.floor(
    //     1000 + Math.random() * 9000
    //   ).toString();
    //   const hashedOTP: string = await bcrypt.hash(Generated_OTP, saltRounds);

    //   this.OTP = hashedOTP;

    //   let text = `Your OTP is ${Generated_OTP}`; 
    //   let subject = 'OTP Verification';

    //   const sendMailStatus: boolean = await sendMail(
    //     userData.email,
    //     subject,text
    //   );

    //   if (!sendMailStatus) {
    //     throw new Error("Otp not send");
    //   }
    //   const Generated_time = new Date();

    //   this.expiryOTP_time = new Date(Generated_time.getTime() + 60 * 1000);

    //   const token = jwt.sign(
    //     {
    //       userData: this.userData,
    //       OTP: this.OTP,
    //       expirationTime: this.expiryOTP_time,
    //     },
    //     process.env.JWT_SECRET as string,
    //     {
    //       expiresIn: "1min",
    //     }
    //   );



     return { res };
    } catch (error: any) {
      throw error;
    }
  }
}