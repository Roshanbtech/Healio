import { Document, model, Schema } from "mongoose";

interface ITransaction {
  amount: number;
  transactionType: "credit" | "debit";
  description: string;
  date?: Date;
}

export interface Iuser extends Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  DOB: Date;
  age?: number;
  address: string;
  gender?: "male" | "female" | "other";
  image?: string;
  lastLogin: Date;
  isBlocked: boolean;
  isVerified: boolean;
  googleId?: string;
  wallet?: {
    balance: number;
    transactions: ITransaction[];
  };
}

const transactionSchema = new Schema<ITransaction>({
  amount: { type: Number, required: true },
  transactionType: { type: String, enum: ["credit", "debit"], required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const userSchema = new Schema<Iuser>(
  {
    userId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    DOB: {
      type: Date,
      default: null,
    },
    age: {
      type: Number,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },
    image: {
      type: String,
      required: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
    },
    wallet: {
      balance: { type: Number, default: 0 },
      transactions: [transactionSchema],
    },
  },
  { timestamps: true }
);

const userModel = model<Iuser>("User", userSchema);

export default userModel;
