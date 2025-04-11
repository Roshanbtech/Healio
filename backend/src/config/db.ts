import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("Hurray! Database connected");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database betrayed us", error.message);
    } else {
      console.error("Database betrayed us: Unknown error");
    }
  }
};

export default connectDB;
