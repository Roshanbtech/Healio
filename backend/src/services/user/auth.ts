import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { userType } from "../../interface/userInterface/interface";
import { IAuthService } from "../../interface/user/Auth.service.interface";
import { IAuthRepository } from "../../interface/user/Auth.repository.interface";
//import user schema
import userModel from "../../model/userModel";
import sendMail from "../../config/emailConfig";
import { otpSetData, getOtpByEmail } from "../../config/redisClient";

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
    otp: string;
  }): Promise<any>  {
    try {
        console.log('starting')
        const { email, otp } = userData;
        const storedOtp = await getOtpByEmail(email);
        if (storedOtp === null || storedOtp.toString() !== otp.toString()) {
          console.log("OTP does not match or is not found.");
          return { message: 'OTP does not match or is not found.', status: false };
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
     await this.AuthRepository.createUser(this.userData);
    



     return { status: true, message: "User created successfully" };
    } catch (error: any) {
      console.log("Error in creating new User", error);
      return { status: false, message: error.message };
    }
  }
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
  async sendOtp(email: string): Promise<any>  {
    try {
      const response = await this.AuthRepository.existUser(
        email,
      );
      console.log('small work',response)
      if (response.existEmail) {
         console.log('email already in use...');
         return { status: false, message: "Email already in use" };        
      }
        const Generated_OTP: string = Math.floor(
        1000 + Math.random() * 9000
       ).toString();
       const subject: string = "OTP Verification";
       const text: string = `Hello User,\n\nThank you for registering with Healio!, your OTP is ${Generated_OTP}\n\nHave a nice day!!!`;
       await sendMail(email, subject, text);
       console.log('.. otp.working ');
       await otpSetData(email, Generated_OTP);
       console.log('hurray otp set aahda')

       

 
       return { status: true, message: "Otp send successfully" };    } 
    catch (error) {
      throw error;
    }
  }

  // async verifyUser(email: string, password: string): Promise<GetUserData> {
  //   // Check if the user exists
  //   const user = await this.AuthRepository.userCheck(email);
  //   if (!user) {
  //     throw new Error("Email not found");
  //   }
  
  //   // Compare the provided password with the hashed password
  //   const isPasswordValid = await bcrypt.compare(password, user.password);
  //   if (!isPasswordValid) {
  //     throw new Error("Incorrect password");
  //   }
  
  //   // Construct response (excluding sensitive data like password)
  //   return {
  //     userId: user.id,
  //     name: user.name,
  //     email: user.email,
  //     phone: user.phone,
  //   };
  // }
  
}