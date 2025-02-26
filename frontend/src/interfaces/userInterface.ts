interface UserImage {
  url: string;
  type: string;
}

export interface User {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  isBlocked: boolean;
  address: string | null;
  DOB: Date | null;
  image: UserImage;
}

export interface SignUpFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmpassword: string;
}

export interface UserProfile {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  DOB: Date;
  address: string;
  image: string;
  isBlocked: boolean;
  isVerified: boolean;
}
