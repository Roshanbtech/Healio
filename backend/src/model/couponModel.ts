import { Schema, model } from "mongoose";

export interface Iuser {
  _id: string;
  count: number;
}

export interface ICoupon extends Document {
  name: string;
  code: string;
  discount: number;
  startDate: Date;
  expirationDate: Date;
  isActive: boolean;
  usedBy?: Iuser;
}

const couponSchema = new Schema<ICoupon>(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    discount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
couponSchema.path("expirationDate").validate(function (value: Date) {
  return value > this.startDate;
}, "Expiration date must be after the start date.");
couponSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 });

const CouponS = model<ICoupon>("Coupon", couponSchema);
export default CouponS;