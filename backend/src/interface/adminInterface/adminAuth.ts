// This file contains the interfaces for admin authentication.
//login
export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminLoginSuccess {
  accessToken: string;
  refreshToken: string;
}

export interface AdminLoginError {
  error: string;
}

//logout
export interface AdminLogoutSuccess {
  status: true;
  message: string;
}

export interface AdminLogoutError {
  error: string;
}
