export interface IUserService {
   getDoctors(): Promise<any>
   getUserProfile(id: string): Promise<any>
  }
  