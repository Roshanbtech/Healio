import mongoose, { Document, model, Schema, Types } from "mongoose";
interface Qualification {}

interface ITransaction {
  amount: number;
  transactionType: "credit" | "debit";
  description: string;
  date?: Date;
}

export interface IDoctor extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  isBlocked: boolean;
  isVerified: boolean;
  image?: string;
  googleId?: string;
  hospital?: string;
  degree?: string;
  speciality?: Types.ObjectId;
  experience?: string;
  country?: string;
  achievements?: string;
  certificate?: string[];
  fees?: number;
  isDoctor?: boolean;
  docStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  about?: string;
  wallet?: {
    balance: number;
    transactions: ITransaction[];
  };
  averageRating?: number;
  reviewCount?: number;
}

const transactionSchema = new Schema<ITransaction>({
  amount: { type: Number, required: true },
  transactionType: { type: String, enum: ["credit", "debit"], required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const doctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    image: { type: String },
    googleId: { type: String },
    hospital: { type: String },
    degree: { type: String },
    speciality: { type: Schema.Types.ObjectId, ref: "Service" },
    experience: { type: String },
    country: { type: String },
    achievements: { type: String },
    certificate: { type: [String] },
    fees: { type: Number },
    isDoctor: { type: Boolean, default: false },
    docStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
    about: { type: String },
    wallet: {
      balance: { type: Number, default: 0 },
      transactions: [transactionSchema],
    },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const doctorModel = model<IDoctor>("Doctor", doctorSchema);

export default doctorModel;
