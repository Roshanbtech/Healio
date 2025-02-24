import { IBookingRepository } from "../../interface/user/Booking.repository.interface";
import { IBookingService } from "../../interface/user/Booking.service.interface";

export class BookingService implements IBookingService {
    private BookingRepository: IBookingRepository;

    constructor(BookingRepository: IBookingRepository) {
        this.BookingRepository = BookingRepository;
    }

    async getCoupons(): Promise<any> {
        try {
            const coupons = await this.BookingRepository.getCoupons();
            return coupons;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}