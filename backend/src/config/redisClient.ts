import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL,
});


client.on('error', (err: any) => {
  console.error('Redis Client Error', err);
});


client.connect()
  .then(() => {
    console.log('Connected to Redis');
  })
  .catch((err) => {
    console.error('Error connecting to Redis', err);
  });


export const otpSetData = async (email: string, otp: string): Promise<void> => {
  try {
    await client.del(`${email}`);

    await Promise.all([
      client.hSet(`${email}`, { otp }),
      client.expire(`${email}`, 3000),
    ]);
    console.log('OTP set on redis for user:', email);
  } catch (error) {
    console.log('Error setting OTP:', error);
  }
};


export const getOtpByEmail = async (email: string): Promise<string | null> => {
  try {
    const userData = await client.hGetAll(`${email}`);
    console.log(userData, 'userData');
    if (!userData.otp) {
      console.log('No OTP found for this email');
      return null;
    }

    return userData.otp; 
  } catch (error: unknown) {
    console.error('Error retrieving OTP:', error);
    return null;
  }
};