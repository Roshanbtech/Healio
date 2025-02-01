import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { doctorType,IDoctorInfo } from "../../interface/doctorInterface/Interface"
import { IAuthRepository } from "../../interface/doctor/Auth.repository.interface";
import exp from "constants";
dotenv.config();

export class AuthService{
    private AuthRepository: IAuthRepository;
    private OTP: string | null = null;
    private doctorData: doctorType | null = null;

    constructor(
        AuthRepository: IAuthRepository,
    ){
        this.AuthRepository = AuthRepository;
    }

   async signup(doctorData: {
       name: string;
       email: string;
       phone: string;
       password: string;
       otp: string;
     }): Promise<any>  {
       try {
           console.log('starting')
           const { email, otp } = doctorData;
           const storedOtp = await getOtpByEmail(email);
           if (storedOtp === null || storedOtp.toString() !== otp.toString()) {
             console.log("OTP does not match or is not found.");
             return { message: 'OTP does not match or is not found.', status: false };
           }
         
   
         let saltRounds: number = 10;
   
         const hashedPassword = await bcrypt.hash(doctorData.password, saltRounds);
   
         const doctorId = uuidv4();
         this.doctorData = {
           doctorId: doctorId,
           name: doctorData.name,
           email: doctorData.email,
           phone: doctorData.phone,
           password: hashedPassword,
           isVerified: true
         };
        await this.AuthRepository.createDoctor(this.doctorData);
       
   
   
   
        return { status: true, message: "User created successfully" };
       } catch (error: any) {
         console.log("Error in creating new User", error);
         return { status: false, message: error.message };
       }
     }
    
}