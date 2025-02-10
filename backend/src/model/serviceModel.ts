import { Document, model, Schema } from "mongoose";

interface Iservice extends Document {
  serviceId: string;
  name: string;
  image?: string;
  isActive: boolean;
}

const serviceSchema = new Schema<Iservice>(
  {
    serviceId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

const serviceModel = model<Iservice>("Service", serviceSchema);

export default serviceModel;
