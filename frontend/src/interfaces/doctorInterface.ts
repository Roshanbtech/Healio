export interface Doctor {
  justApproved: boolean;
  _id: string;
  doctorId: string;
  name: string;
  phone: string;
  email: string;
  isBlocked: boolean;
  docStatus: string;
  rejectedReason?: string;
  image: any;
}

export interface DoctorDetails {
    _id:string
    doctorId: string;
    name: string;
    phone : string;
    email: string;
    isBlocked: boolean;
    docStatus:string;
    rejectedReason?:string
    
  
  }
  
export interface SignUpFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmpassword: string;
}
