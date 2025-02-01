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
  return Math.floor(1000 + Math.random() * 9000).toString(); // Always a 4-digit OTP
};

// Store OTP properly in Redis
export const otpSetData = async (email: string, otp: string): Promise<void> => {
  try {
    await client.del(email); // Delete previous OTP if any
    await client.hSet(email, { otp }); // Store OTP as a hash
    await client.expire(email, 3000); 
    console.log(`OTP stored for ${email}: ${otp}`);
  } catch (error) {
    console.error("Error storing OTP:", error);
  }
};

// Retrieve OTP correctly from Redis
export const getOtpByEmail = async (email: string): Promise<string | null> => {
  try {
    const userData = await client.hGetAll(email); // Retrieve all hash fields for the email
    console.log(`Retrieved OTP for ${email}:`, userData); // Debug log
    return userData.otp || null;
  } catch (error) {
    console.error("Error retrieving OTP:", error);
    return null;
  }
};

// Resend OTP properly and store it
export const resendOtpUtil = async (email: string): Promise<string | null> => {
  try {
    const newOtp = generateOTP(); // Generate a new OTP
    await otpSetData(email, newOtp); // Store new OTP in Redis with expiration time
    return newOtp;
  } catch (error) {
    console.error("Error resending OTP:", error);
    return null;
  }
};

export const resendOtp = async (email: string): Promise<string | null> => {
  try {
      // Check if an OTP exists for the email
      const existingOtp = await getOtpByEmail(email);
      
      if (existingOtp) {
          console.log(`Existing OTP for ${email} is being deleted.`);
          await client.del(email); // Remove old OTP explicitly
      }

      // Generate a new OTP
      const newOtp = generateOTP();

      // Store new OTP with expiration
      await otpSetData(email, newOtp);

      console.log(`New OTP generated for ${email}: ${newOtp}`);

      return newOtp;
  } catch (error) {
      console.error('Error resending OTP:', error);
      return null;
  }
};

// import { createClient } from 'redis';
// import dotenv from 'dotenv';

// dotenv.config();

// const client = createClient({
//   url: process.env.REDIS_URL,
// });


// client.on('error', (err: any) => {
//   console.error('Redis Client Error', err);
// });


// client.connect()
//   .then(() => {
//     console.log('Connected to Redis');
//   })
//   .catch((err) => {
//     console.error('Error connecting to Redis', err);
//   });


// export const otpSetData = async (email: string, otp: string): Promise<void> => {
//   try {
//     await client.del(`${email}`);

//     await Promise.all([
//       client.hSet(`${email}`, { otp }),
//       client.expire(`${email}`, 3000),
//     ]);
//     console.log('OTP set on redis for user:', email);
//   } catch (error) {
//     console.log('Error setting OTP:', error);
//   }
// };


// export const getOtpByEmail = async (email: string): Promise<string | null> => {
//   try {
//     const userData = await client.hGetAll(`${email}`);
//     console.log(userData, 'userData');
//     if (!userData.otp) {
//       console.log('No OTP found for this email');
//       return null;
//     }

//     return userData.otp; 
//   } catch (error: unknown) {
//     console.error('Error retrieving OTP:', error);
//     return null;
//   }
// };

// const Generated_OTP = ():string =>{
//    return Math.floor(
//     1000 + Math.random() * 9000
//    ).toString();}

// // Resend OTP Function Implementation
// export const resendOtp = async (email: string): Promise<string | null> => {
//     try {
//       await client.del(`${email}`);
//         // Generate a new OTP
//       const newOtp = Generated_OTP();
  
//       // Remove old OTP and set the new OTP with expiration
//       await otpSetData(email, newOtp);
  
//       console.log(`New OTP generated for ${email}: ${newOtp}`);
  
//       return newOtp;
//     } catch (error) {
//       console.error('Error resending OTP:', error);
//       return null;
//     }
// }