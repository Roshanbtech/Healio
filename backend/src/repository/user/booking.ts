import CouponModel from "../../model/couponModel";
import { IBookingRepository, Coupon } from "../../interface/user/Booking.repository.interface";

export class BookingRepository implements IBookingRepository {
    getCoupons(): Promise<Coupon[]> {
        return CouponModel.find({ isActive: true });
    }
}