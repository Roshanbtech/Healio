
export interface Coupon {
    _id: string;
    name: string;
    code: string;
    discount: number;
    expirationDate: string;
    isActive: boolean;
  }
  import { ICoupon } from "../../model/couponModel";

  export interface IBookingRepository {
    getCoupons(): Promise<ICoupon[]>;
  }
  