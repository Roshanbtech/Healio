import mongoose, { Document, model, Schema, Types } from "mongoose";

// interface ImageField {
//     type: string;
//     url: string;
// }

interface IDoctor extends Document {
    doctorId: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    specialization: Types.ObjectId; // ✅ Use 'Types.ObjectId' instead of 'mongoose.Types.ObjectId'
    experience: string;
    fees: number;
    image: string;
    lastLogin: Date;
    isBlocked: boolean;
    isVerified: boolean
}

// const imageFieldSchema = new Schema<ImageField>({
//     type: { type: String, required: true },
//     url: { type: String, required: true },
// });

const doctorSchema = new Schema<IDoctor>({
    doctorId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialization: { type: Schema.Types.ObjectId, ref: "Specialization", required: true },
    experience: { type: String, required: true },
    fees: { type: Number, required: true },
    image: { type: String, required: true },
    lastLogin: { type: Date },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  }, { timestamps: true });
  

const doctorModel = model<IDoctor>("Doctor", doctorSchema);

export default doctorModel;
