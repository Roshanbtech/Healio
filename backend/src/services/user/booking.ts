import { IBookingRepository } from "../../interface/user/Booking.repository.interface";
import { IBookingService } from "../../interface/user/Booking.service.interface";

export class BookingService implements IBookingService {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository: IBookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  async getCoupons(): Promise<any> {
    try {
      return await this.bookingRepository.getCoupons();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
