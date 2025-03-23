import mongoose, { Document, Schema, model } from "mongoose";

export interface IPrescription extends Document {
  appointmentId: string;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  labTests?: string[];
  advice?: string;
  followUpDate?: Date;
  doctorNotes?: string;
  signature?: string | File;
}

const PrescriptionSchema = new Schema<IPrescription>(
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
    diagnosis: {
      type: String,
      required: true,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String, default: "" },
      },
    ],
    labTests: {
      type: [String],
      default: [],
    },
    advice: {
      type: String,
      default: "",
    },
    followUpDate: {
      type: Date,
    },
    doctorNotes: {
      type: String,
      default: "",
    },
    signature: {
      type: String
    },
  },
  { timestamps: true }
);

const PrescriptionModel = model<IPrescription>("Prescription", PrescriptionSchema);

export default PrescriptionModel;
