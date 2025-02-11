import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

client
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Error connecting to Redis", err));

export const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const otpSetData = async (email: string, otp: string): Promise<void> => {
  try {
    await client.del(email);
    await client.hSet(email, { otp }); 
    await client.expire(email, 3000);
    console.log(`OTP stored for ${email}: ${otp}`);
  } catch (error) {
    console.error("Error storing OTP:", error);
  }
};

export const getOtpByEmail = async (email: string): Promise<string | null> => {
  try {
    const userData = await client.hGetAll(email); 
    console.log(`Retrieved OTP for ${email}:`, userData); 
    return userData.otp || null;
  } catch (error) {
    console.error("Error retrieving OTP:", error);
    return null;
  }
};

export const resendOtpUtil = async (email: string): Promise<string | null> => {
  try {
    const newOtp = generateOTP(); 
    await otpSetData(email, newOtp);
    return newOtp;
  } catch (error) {
    console.error("Error resending OTP:", error);
    return null;
  }
};

export const resendOtp = async (email: string): Promise<string | null> => {
  try {
    const existingOtp = await getOtpByEmail(email);

    if (existingOtp) {
      console.log(`Existing OTP for ${email} is being deleted.`);
      await client.del(email); 
    }

    const newOtp = generateOTP();

    await otpSetData(email, newOtp);

    console.log(`New OTP generated for ${email}: ${newOtp}`);

    return newOtp;
  } catch (error) {
    console.error("Error resending OTP:", error);
    return null;
  }
};
