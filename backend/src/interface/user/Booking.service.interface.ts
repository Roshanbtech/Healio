import { IAppointment } from "../../model/appointmentModel";
export interface IBookingService {
    getCoupons(): Promise<any>;
    bookAppointment(data: IAppointment): Promise<any>;
    verifyBooking(data: any): Promise<IAppointment>;
//     getPatientAppointments(patientId: string): Promise<IAppointment[]>;
//   cancelAppointment(appointmentId: string): Promise<IAppointment>;
}