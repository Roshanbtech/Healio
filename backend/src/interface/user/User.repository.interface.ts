import { DoctorDetails } from "../userInterface/interface";
import { UserProfile } from "../userInterface/interface";

export interface IUserRepository {
    getDoctors(): Promise<DoctorDetails[]>
    getUserProfile(id: string): Promise<UserProfile[] | null>
}