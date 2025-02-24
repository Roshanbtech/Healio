import mongoose, { Document, Schema, model } from "mongoose";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: "pending" | "prescription pending" | "completed" | "cancelled" | "cancelled by Dr";
  reason: string;
  patientName?: string;
  age?: number;
  description?: string;
  locked?: mongoose.Types.ObjectId | null;
  fees?: number;
  paymentMethod?: "stripe";
  paymentStatus?: "payment pending" | "payment completed" | "payment failed" | "refunded" | "anonymous";
  paymentId?: string | null;
  prescription?: mongoose.Types.ObjectId | null;
  review?: {
    rating?: number;
    description?: string;
  };
  medicalRecords?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "prescription pending", "completed", "cancelled", "cancelled by Dr"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    patientName: {
      type: String,
    },
    age: {
      type: Number,
    },
    description: {
      type: String,
    },
    locked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fees: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["stripe"],
    },
    paymentStatus: {
      type: String,
      enum: ["payment pending", "payment completed", "payment failed", "refunded", "anonymous"],
    },
    paymentId: {
      type: String,
      default: null,
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },
    review: {
      rating: {
        type: Number,
        default: 0,
      },
      description: {
        type: String,
        default: "",
      },
    },
    medicalRecords: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const AppointmentModel = model<IAppointment>("Appointment", AppointmentSchema);

export default AppointmentModel;
