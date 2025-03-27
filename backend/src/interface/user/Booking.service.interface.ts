import { IAppointment } from "../../model/appointmentModel";
export interface IBookingService {
    getCoupons(): Promise<any>;
    bookAppointment(data: IAppointment): Promise<any>;
    verifyBooking(data: any): Promise<IAppointment>;
    retryPayment(id: string): Promise<any>;
    bookAppointmentUsingWallet(data: IAppointment): Promise<IAppointment>;
    getPatientAppointments(id: string): Promise<IAppointment[]>;
    addMedicalRecord(appointmentId: string, newMedicalRecord: any): Promise<IAppointment | null>;
    cancelAppointment(appointmentId: string): Promise<IAppointment>;
    getDoctorAppointments(id: string): Promise<IAppointment[]>;
    addReviewForDoctor(id: string, rating: number, description: string): Promise<IAppointment | null>;
}