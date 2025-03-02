import { config } from "dotenv";
config();
import Razorpay from "razorpay";

export const razorPayInstance = new Razorpay({
  key_id: process.env.PAYMENT_KEY_ID || "",
  key_secret: process.env.PAYMENT_KEY_SECRET || "",
});