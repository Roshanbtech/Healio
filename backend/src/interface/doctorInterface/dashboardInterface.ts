export interface StatCard {
    label: string;
    value: number;
    percentage?: number;
}

export interface DashboardStatsData {
    visitsToday: number;
    growthPercentage: number;
    monthlyTarget: number;
    monthlyAchieved: number;
    statCards: StatCard[];
}

export interface GrowthChartData {
  month: string;
  newPatients: number;
  returningPatients: number;
  total: number;
}
export interface StatCard {
    label: string;
    value: number;
    percentage?: number;
  }
  
  export interface DashboardStatsData {
    visitsToday: number;
    growthPercentage: number;
    monthlyTarget: number;
    monthlyAchieved: number;
    statCards: StatCard[];
  }

  export interface DoctorProfile {
    _id: string;
    name: string;
    speciality: string;
    image: string;
  }
  
  export interface DashboardStatsResponse {
    stats: DashboardStatsData;
    doctorProfile: DoctorProfile;
  }
  
  
  export interface Demographics {
    male: number;
    female: number;
    age18to35: number;
  }
  
  export interface DashboardHomeData {
    doctorProfile: any; // Ideally use your IDoctor interface
    dashboardStats: DashboardStatsData;
    todaysAppointments: any[]; // e.g. IAppointment[]
    demographics: Demographics;
  }
  