export interface IAuthService {
  login(AdminData: {
    email: string;
    password: string;
  }): Promise<
    { accessToken: string; refreshToken: string } | { error: string }
  >;
  getUser(): Promise<any>;
  getDoctor(): Promise<any>;
  toggleUser(id: string): Promise<any>;
  toggleDoctor(id: string): Promise<any>;
  getService(): Promise<any>;
  addService(name: string, isActive: boolean): Promise<any>;
  editService(id: string, name: string, isActive: boolean): Promise<any>;
  toggleService(id: string): Promise<any>;
  getCertificates(id: string): Promise<any>;
  approveDoctor(id: string): Promise<any>;
  rejectDoctor(id: string): Promise<any>;
}

export type AdminType = {
  email: string;
  password: string;
};
