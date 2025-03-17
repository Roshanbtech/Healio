"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "../common/doctorCommon/Sidebar";
import { DashboardStats } from "../common/doctorCommon/Dashboard-stats";
import { GrowthChart } from "../common/doctorCommon/Growth-chart"; // Uncomment if needed
import { Calendar, Clock, Bell, Mail } from "lucide-react";
import axiosInstance from "../../utils/axiosInterceptors";
import { useNavigate } from "react-router-dom";

// Define interfaces for aggregated data
interface DoctorProfile {
  _id: string;
  name: string;
  speciality: string | { _id: string; name: string };
  image?: string;
}

interface StatCard {
  label: string;
  value: number;
  percentage?: number;
}

interface DashboardStatsData {
  visitsToday: number;
  growthPercentage: number;
  monthlyTarget: number;
  monthlyAchieved: number;
  statCards: StatCard[];
}

interface Appointment {
  time: string;
  reason?: string;
  patientId: {
    name: string;
    email: string;
    gender: string;
    age: number;
  };
}

interface Demographics {
  male: number;
  female: number;
  age18to35: number;
}

interface DashboardData {
  doctorProfile: DoctorProfile;
  dashboardStats: DashboardStatsData;
  todaysAppointments: Appointment[];
  demographics: Demographics;
}


const Home: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Current date for header
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);

  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/doctor/login");
      }
    }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!doctorId) {
        console.error("Doctor ID not found in localStorage");
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(`/doctor/dashboard/${doctorId}`);
        if (response.data.status) {
          setDashboardData(response.data.data);
        } else {
          console.error("Dashboard error:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [doctorId]);

  if (loading) return <div>Loading dashboard data...</div>;
  if (!dashboardData) return <div>No dashboard data available</div>;

  const { doctorProfile, dashboardStats, todaysAppointments, demographics } = dashboardData;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white border-r border-gray-200 shadow-sm transition-all duration-300`}>
        <Sidebar onCollapse={setSidebarCollapsed} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with notifications and profile */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <div className="flex items-center mt-2 text-gray-500">
                <Calendar size={16} className="mr-2" />
                <span className="text-sm">{formattedDate}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors">
                <Bell size={20} className="text-gray-600" />
              </button>
              <button className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors">
                <Mail size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center">
                {doctorProfile.image ? (
                  <img
                    src={doctorProfile.image}
                    alt={doctorProfile.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                    {doctorProfile.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="ml-2 hidden md:block">
                  <div className="text-sm font-semibold">{doctorProfile.name}</div>
                  <div className="text-xs text-gray-500">
                    {doctorProfile.speciality && typeof doctorProfile.speciality === "object"
                      ? doctorProfile.speciality.name
                      : doctorProfile.speciality}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Greeting Card */}
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Good Morning, <span className="text-red-600">{doctorProfile.name}</span>!
                </h2>
                <p className="text-gray-500 mt-1">Here's what's happening with your patients today.</p>
              </div>
              <div className="flex items-center bg-red-50 px-4 py-2 rounded-lg">
                <Clock size={18} className="text-red-600 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Next Appointment</div>
                  <div className="text-sm font-medium text-red-600">
                    {todaysAppointments.length > 0 ? todaysAppointments[0].time : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <DashboardStats stats={dashboardStats} />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
              {todaysAppointments.length > 0 ? (
                todaysAppointments.map((appt, index) => (
                  <div key={index} className="mb-4 border-l-4 border-red-600 pl-4">
                    <div className="text-sm font-medium">
                      {appt.patientId?.name || "Patient"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appt.time} - {appt.reason || "General Checkup"}
                    </div>
                  </div>
                ))
              ) : (
                <div>No appointments scheduled for today.</div>
              )}
              <button className="w-full mt-4 bg-red-50 text-red-600 py-2 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors"
              onClick={()=>navigate("/doctor/appointments")}>
                View All Appointments
              </button>
            </div>
          </div>

          {/* Growth Chart Section (if implemented) */}
          <GrowthChart  />

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">Patient Demographics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Male</span>
                  <span className="text-sm font-medium">{demographics.male}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: `${demographics.male}%` }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Female</span>
                  <span className="text-sm font-medium">{demographics.female}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-300 h-2 rounded-full" style={{ width: `${demographics.female}%` }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Age 18-35</span>
                  <span className="text-sm font-medium">{demographics.age18to35}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: `${demographics.age18to35}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {/* Replace static data with dynamic recent activity if available */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-xs text-red-600 font-medium">{item}h</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Medical Record Updated</div>
                      <div className="text-xs text-gray-500">Patient ID #1234{item} - Treatment plan updated</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
