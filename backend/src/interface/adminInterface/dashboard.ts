export interface IDashboardStats {
  totalCustomers: number;
  totalDoctors: number;
  completedBookings: number;
  totalRevenue: number;
}

export interface ITopDoctor {
  _id: string;
  appointmentsCount: number;
  totalEarnings: number;
  doctorDetails: {
    name: string;
    specialization: string;
    image: string;
    averageRating: number;
  };
}

export interface ITopUser {
  _id: string;
  bookingsCount: number;
  totalSpent: number;
  lastVisit: string;
  userDetails: {
    name: string;
    email: string;
    image: string;
  };
}
export interface IAppointmentAnalytics {
  _id: string;
  completed: number;
  canceled: number;
}
