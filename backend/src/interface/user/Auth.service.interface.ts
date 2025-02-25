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
    { accessToken: string; refreshToken: string, user:any } 
  >;
  handleGoogleLogin(idToken: string): Promise<{ user: any; isNewUser: boolean; accessToken: string; refreshToken: string }> 
  sendForgotPasswordOtp(email: string): Promise<{ status: boolean; message: string }>;
  verifyForgotPasswordOtp(email: string, otp: string): Promise<{ status: boolean; message: string }>;
  resetPassword(email: string, password: string): Promise<{ status: boolean; message: string }>;
  logout(refreshToken: string): Promise<any>;
}
