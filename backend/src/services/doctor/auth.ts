import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { doctorType } from "../../interface/doctorInterface/Interface";
import { IAuthService } from "../../interface/doctor/Auth.service.interface";
import { IAuthRepository } from "../../interface/doctor/Auth.repository.interface";
import sendMail from "../../config/emailConfig";
import {
  otpSetData,
  getOtpByEmail,
  resendOtpUtil,
  resendOtp,
} from "../../config/redisClient";
import { admin } from "../../config/firebase";

export class AuthService implements IAuthService {
  private AuthRepository: IAuthRepository;

  private doctorData: doctorType | null = null;

  constructor(AuthRepository: IAuthRepository) {
    this.AuthRepository = AuthRepository;
  }
  async signup(doctorData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }): Promise<{ status: boolean; message: string; token?: string }> {
    try {
      const { email, otp } = doctorData;
      const storedOtp = await getOtpByEmail(email);
      if (!storedOtp) {
        return {
          status: false,
          message: "OTP expired or invalid. Request a new one.",
        };
      }

      if (storedOtp !== otp) {
        return { status: false, message: "Incorrect OTP. Please try again." };
      }

      let saltRounds: number = 10;
      const hashedPassword = await bcrypt.hash(doctorData.password, saltRounds);
      this.doctorData = {
        name: doctorData.name,
        email: doctorData.email,
        phone: doctorData.phone,
        password: hashedPassword,
        isVerified: true,
        docStatus: "pending" as "pending",
      };

      await this.AuthRepository.createDoctor(this.doctorData);

      await otpSetData(email, "");

      return { status: true, message: "Doctor verified successfully" };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error creating doctor: ${error.message}`);
      }
      throw new Error("Error creating doctor");
    }
  }

  async sendOtp(email: string): Promise<{ status: boolean; message: string }> {
    try {
      const response = await this.AuthRepository.existDoctor(email);
      if (response.existEmail) {
        return { status: false, message: "Email already in use" };
      }

      const otp = await resendOtpUtil(email);
      console.log(`Generated OTP: ${otp}`);

      if (!otp) {
        return { status: false, message: "Failed to generate OTP. Try again." };
      }

      const subject = "OTP Verification";
      const text = `Hello,\n\nYour OTP is ${otp}. It is valid for 1 minute.\n\nThank you.`;
      await sendMail(email, subject, text);

      return { status: true, message: "OTP sent successfully" };
    } catch (error) {
      console.error("Error sending OTP:", error);
      return { status: false, message: "Error while sending OTP" };
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const storedOtp = await getOtpByEmail(email);
      console.log(
        ` Verifying OTP for ${email}: Stored: ${storedOtp}, Entered: ${otp}`
      );

      if (!storedOtp) {
        return {
          status: false,
          message: "OTP expired. Please request a new one.",
        };
      }

      if (storedOtp !== otp) {
        return { status: false, message: "Incorrect OTP. Please try again." };
      }

      // Remove OTP after successful verification
      await otpSetData(email, "");

      return { status: true, message: "OTP verified successfully" };
    } catch (error) {
      console.error(" Error verifying OTP:", error);
      return { status: false, message: "Error while verifying OTP" };
    }
  }

  async resendOtp(email: string) {
    try {
      const otp = await resendOtp(email);
      if (!otp) {
        return { status: false, message: "Failed to generate OTP. Try again." };
      }

      const subject = "OTP Verification - Resend";
      const text = `Hello,\n\nYour new OTP is ${otp}. It is valid for 1 minute.\n\nThank you.`;
      await sendMail(email, subject, text);

      return { status: true, message: "OTP resent successfully" };
    } catch (error) {
      console.error(" Error resending OTP:", error);
      return { status: false, message: "Error while resending OTP" };
    }
  }

  async sendForgotPasswordOtp(email: string): Promise<any> {
    const DoctorExist = await this.AuthRepository.existDoctor(email);
    if (!DoctorExist.existEmail) {
      throw new Error("Email not found");
    }

    const otp = await resendOtpUtil(email);
    if (!otp) {
      throw new Error("OTP not sent");
    }

    const subject = "OTP Verification";
    const text = `Hello,\n\nYour OTP for password reset is ${otp}. It is valid for 1 minute.\n\nThank you.`;
    await sendMail(email, subject, text);

    return { status: true, message: "OTP sent successfully" };
  }

  async verifyForgotPasswordOtp(email: string, otp: string): Promise<any> {
    const storedOtp = await getOtpByEmail(email);
    if (!storedOtp) {
      throw new Error("OTP expired or invalid");
    }
    if (storedOtp !== otp) {
      throw new Error("Incorrect OTP");
    }

    await otpSetData(email, "");
    return { status: true, message: "OTP verified successfully" };
  }

  async resetPassword(email: string, password: string): Promise<{ status: boolean; message: string }> {
    try {
      const doctorExist = await this.AuthRepository.existDoctor(email);
      if (!doctorExist.existEmail) {
        throw new Error("Email not found");
      }
  
      const saltRounds: number = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const response = await this.AuthRepository.updatePassword(email, hashedPassword);
  
      if (!response || response.modifiedCount === 0) {
        throw new Error("Password not updated");
      }
  
      return { status: true, message: "Password updated successfully" };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Unexpected error occurred while resetting password");
      }
    }
  }  

  async login(doctorData: {
    email: string;
    password: string;
  }): Promise<
    | { accessToken: string; refreshToken: string; doctorId: string }
    | { error: string }
  > {
    try {
      const { email, password } = doctorData;
      const check = await this.AuthRepository.existDoctor(email);

      if (!check) {
        return { error: "Email not found, please sign up!" };
      }

      const doctor = await this.AuthRepository.doctorCheck(email);
      if (!doctor) {
        return { error: "Doctor Not Found." };
      }

      if (doctor.isBlocked) {
        return { error: "Doctor is blocked. Ask admin for access." };
      }
      
      if (doctor.docStatus === "rejected") {
        return { error: "Your account has been rejected" };
      }

      const isPasswordValid = await bcrypt.compare(password, doctor.password);
      if (!isPasswordValid) {
        return { error: "Invalid password." };
      }

      const accessToken = jwt.sign(
        { email, role: "doctor", doctorId: doctor._id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "1d" }
      );

      const refreshToken = jwt.sign(
        { email, role: "doctor" },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "30d" }
      );

      return { accessToken, refreshToken, doctorId: doctor._id };
    } catch (error) {
      console.error("Login error:", error);
      return { error: "Internal server error." };
    }
  }

  async handleGoogleLogin(
    idToken: string
  ): Promise<{
    doctor: any;
    isNewDoctor: boolean;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Decoded Token:", decodedToken);

      const { email, name, uid, picture } = decodedToken;
      const doctorData: {
        name: string;
        email: string | undefined;
        googleId: string;
        isVerified: boolean;
        image?: string;
      } = {
        name,
        email,
        googleId: uid,
        isVerified: true,
      };
      if (picture) {
        doctorData.image = picture;
      }

      const { doctor, isNewDoctor } =
        await this.AuthRepository.handleGoogleLogin(doctorData);

      const accessToken = jwt.sign(
        { email, role: "doctor" },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "1d" }
      );

      const refreshToken = jwt.sign(
        { email, role: "doctor" },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "30d" }
      );

      return { doctor, isNewDoctor, accessToken, refreshToken };
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error("Error handling Google login");
    }
  }

  async logout(refreshToken: string): Promise<{ status: boolean; message: string }> {
    try {
      const isLoggedOut = await this.AuthRepository.logout(refreshToken);
      if (!isLoggedOut) {
        return { status: false, message: "Logout failed or token not found" };
      }
      return { status: true, message: "Logout successful" };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error("Service logout error: " + error.message);
      }
      throw new Error("Unexpected service error");
    }
  }
  

}
