
export interface Coupon {
    _id: string;
    name: string;
    code: string;
    discount: number;
    expirationDate: string;
    isActive: boolean;
  }
export interface IBookingRepository {
    getCoupons(): Promise<Coupon[]>;
}