import mongoose, { Document, Schema, model } from "mongoose";

export interface IAppointment extends Document {
  appointmentId: string;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: "pending" | "accepted" | "completed" | "cancelled" | "cancelled by Dr";
  reason?: string;
  fees?: number;
  paymentMethod?: "razorpay";
  paymentStatus?: "payment pending" | "payment completed" | "payment failed" | "refunded" | "anonymous";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  prescription?: mongoose.Types.ObjectId | null;
  review?: {
    rating?: number;
    description?: string;
  };
  medicalRecords?: {
    recordDate?: Date;
    condition?: string;
    symptoms?: string[];
    medications?: string[];
    notes?: string;
  }[];
  couponCode?: string;
  couponDiscount?: string;
  isApplied?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    appointmentId: {
      type: String,
      required: true,
    },
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
      enum: [
        "pending",
        "accepted",
        "completed",
        "cancelled",
        "cancelled by Dr",
      ],
      required: true,
    },
    reason: {
      type: String
    },
    fees: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay"],
    },
    paymentStatus: {
      type: String,
      enum: [
        "payment pending",
        "payment completed",
        "payment failed",
        "refunded",
        "anonymous",
      ],
    },
    razorpay_order_id: {
      type: String,
    },
    razorpay_payment_id: {
      type: String,
    },
    razorpay_signature: {
      type: String,
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
    medicalRecords: [
      {
        recordDate: { type: Date, default: Date.now },
        condition: { type: String, required: true },
        symptoms: { type: [String], default: [] },
        medications: { type: [String], default: [] },
        notes: { type: String, default: "" },
      },
    ],
    couponCode: {
      type: String,
      required: false,
    },
    couponDiscount: {
      type: String,
      required: false,
    },
    isApplied: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  { timestamps: true }
);

const AppointmentModel = model<IAppointment>("Appointment", AppointmentSchema);

export default AppointmentModel;