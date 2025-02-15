import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { userType } from "../../interface/userInterface/interface";
import { IAuthService } from "../../interface/user/Auth.service.interface";
import { IAuthRepository } from "../../interface/user/Auth.repository.interface";
//import user schema
import sendMail from "../../config/emailConfig";
import {
  otpSetData,
  getOtpByEmail,
  resendOtpUtil,
  resendOtp,
} from "../../config/redisClient";

export class AuthService implements IAuthService {
  private AuthRepository: IAuthRepository;

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
  }): Promise<any> {
    try {
      console.log(" Signup process started...");
      const { email, otp } = userData;

      const storedOtp = await getOtpByEmail(email);
      console.log(`Retrieved OTP for ${email}:`, storedOtp);

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
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const userId = uuidv4();
      this.userData = {
        userId: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        isVerified: true,
      };

      await this.AuthRepository.createUser(this.userData);

      await otpSetData(email, "");

      return { status: true, message: "User created successfully" };
    } catch (error) {
      console.log(" Error in creating new User", error);
      return { status: false, message: "Error while creating user" };
    }
  }

  async sendOtp(email: string): Promise<{ status: boolean; message: string }> {
    try {
      const response = await this.AuthRepository.existUser(email);
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
    const userExist = await this.AuthRepository.existUser(email);
    if (!userExist.existEmail) {
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
  
  async resetPassword(email: string, password: string): Promise<any> {
    const userExist = await this.AuthRepository.existUser(email);
    console.log("User exist:", userExist);
    if (!userExist.existEmail) {
      throw new Error("Email not found");
    }
   console.log("Password:",
    password,email);
    const saltRounds: number = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Hashed password:", hashedPassword,password);
  
    const response = await this.AuthRepository.updatePassword(email, hashedPassword);
    console.log("Response:", response);
    if (!response || response.modifiedCount === 0) {
      throw new Error("Password not updated");
    }
    return { status: true, message: "Password updated successfully" };
  }
  
  async login(userData: {
    email: string;
    password: string;
  }): Promise<
    { accessToken: string; refreshToken: string } | { error: string }
  > {
    try {
      const { email, password } = userData;
      const check = await this.AuthRepository.existUser(email);

      if (!check) {
        return { error: "Email not found, please sign up!" };
      }

      const user = await this.AuthRepository.userCheck(email);
      if (!user) {
        return { error: "User Not Found." };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { error: "Invalid password." };
      }

      const accessToken = jwt.sign(
        { email, role: "user" },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { email, role: "user" },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "30d" }
      );

      console.log("Role assigned in token:", "user");

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Login error:", error);
      return { error: "Internal server error." };
    }
  }

  async logout(refreshToken: string): Promise<any> {
    try {
      console.log("Logout process started...");
      return await this.AuthRepository.logout(refreshToken);
    } catch (error) {
      console.error("Logout error:", error);
      return { error: "Internal server error." };
    }
  }
}

