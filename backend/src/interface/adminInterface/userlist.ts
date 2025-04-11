import { Iuser } from "../../model/userModel";

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListResponse {
  status: boolean;
  data: Iuser[];
  pagination: PaginationInfo;
}

export interface UserToggleStatus {
  status: boolean;
  message: string;
}
