import { GenericRepository } from "../GenericRepository";
import CouponModel, { ICoupon } from "../../model/couponModel";
import { IBookingRepository } from "../../interface/user/Booking.repository.interface";

export class BookingRepository
  extends GenericRepository<ICoupon>
  implements IBookingRepository
{
  constructor() {
    super(CouponModel);
  }

  async getCoupons(): Promise<ICoupon[]> {
    return this.findAll({ isActive: true }); 
  }
}
