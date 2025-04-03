import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    // console.log(process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("Hurray! Database connected");
  } catch (error:any) {
    console.log("Database betrayed us",error.message);
  }
};

export default connectDB;
