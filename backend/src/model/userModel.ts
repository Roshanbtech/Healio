import { Document, model, Schema } from "mongoose";

interface Iuser extends Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  DOB: Date;
  address: string;
  image?: string;
  lastLogin: Date;
  isBlocked: boolean;
  isVerified: boolean;
  googleId?: string;
}

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
    address: {
      type: String,
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
  },
  { timestamps: true }
);

const userModel = model<Iuser>("User", userSchema);

export default userModel;
