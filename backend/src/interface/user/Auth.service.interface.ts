// import { Appointment, BookAppointment, Doctors, FileData, GetAppointments, GetDoctorsResponse, GetUserData, MedicalField, ScheduleSlot, SingleDoctor, Slot, UserProfileData, UserProfileDetails } from "../userInterface/interface";



export interface IAuthService {
    signup(userData: {name: string;email: string;phone: string;password: string; otp: string}): Promise<{token:string}>;
    sendOtp(email: string): Promise<{ status: boolean; message: string }>;
    resendOtp(email: string): Promise<{ status: boolean; message: string }>;
 };