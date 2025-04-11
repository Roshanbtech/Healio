import { IDoctor } from "../../model/doctorModel";

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DoctorListResponse {
  status: boolean;
  data: IDoctor[];
  pagination: PaginationInfo;
}

export interface DoctorToggleStatus {
  status: boolean;
  message: string;
}

export interface DoctorCertificateResponse {
  status: boolean;
  certificates: string[];
  message: string;
}

export interface ApproveRejectResponse {
  status: boolean;
  message: string;
  doctor: IDoctor | null;
}
