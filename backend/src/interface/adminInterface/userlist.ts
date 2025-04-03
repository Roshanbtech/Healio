export interface IUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    isBlocked: boolean;
    isVerified: boolean;
  }
  
  export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface UserListResponse {
    status: boolean;
    data: IUser[];
    pagination: PaginationInfo;
  }
  