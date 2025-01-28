// import { Appointment, BookAppointment, Doctors, FileData, GetAppointments, GetDoctorsResponse, GetUserData, MedicalField, ScheduleSlot, SingleDoctor, Slot, UserProfileData, UserProfileDetails } from "../userInterface/interface";



export interface IAuthService {
    signup(userData: {name: string;email: string;phone: string;password: string;confirmpassword: string;}): Promise<{token:string}>;
    // otpCheck(otp: string, token: string): Promise<{valid:boolean}>;
    // verifyUser(email: string, password: string): Promise<GetUserData>;
    // resendOtpCheck(userToken: string): Promise<{token:string}>;
    
    
    
 };