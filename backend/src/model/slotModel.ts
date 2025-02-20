import { Document, model, Schema, Types } from "mongoose";

export interface ISchedule extends Document {
  doctor: Types.ObjectId;
  isRecurring: boolean;
  recurrenceRule: string | null;
  startTime: Date;
  endTime: Date;
  defaultSlotDuration: number;
  breaks: {
    startTime: Date;
    endTime: Date;
  }[];
  exceptions: {
    date: Date;
    isOff: boolean;
    overrideSlotDuration?: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceRule: {
      type: String,
      default: null,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    defaultSlotDuration: {
      type: Number,
      required: true,
    },
    breaks: [
      {
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
      },
    ],
    exceptions: [
      {
        date: { type: Date, required: true },
        isOff: { type: Boolean, default: false },
        overrideSlotDuration: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

const scheduleModel = model<ISchedule>("Schedule", scheduleSchema);

export default scheduleModel;