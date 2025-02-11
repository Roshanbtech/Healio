import { DoctorDetails } from "../userInterface/interface";

export interface IUserRepository {
    getDoctors(): Promise<DoctorDetails[]>
}