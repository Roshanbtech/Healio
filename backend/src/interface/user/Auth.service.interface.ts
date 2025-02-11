export interface IAuthService {
  signup(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }): Promise<any>;
  sendOtp(email: string): Promise<{ status: boolean; message: string }>;
  resendOtp(email: string): Promise<{ status: boolean; message: string }>;
  login(userData: {
    email: string;
    password: string;
  }): Promise<
    { accessToken: string; refreshToken: string } | { error: string }
  >;
  logout(refreshToken: string): Promise<any>;
}
