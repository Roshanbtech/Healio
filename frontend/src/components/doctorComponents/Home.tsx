"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "../common/doctorCommon/Sidebar";
import { DashboardStats } from "../common/doctorCommon/Dashboard-stats";
import { GrowthChart } from "../common/doctorCommon/Growth-chart";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import axiosInstance from "../../utils/axiosInterceptors";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signedUrltoNormalUrl } from "../../utils/getUrl";

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
  // Include "daily" in the time range union
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

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

  // Fancy 3D loading animation
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50">
        <motion.div 
          initial={{ rotateY: 0 }}
          animate={{ 
            rotateY: 360,
            transition: { 
              duration: 2, 
              ease: "easeInOut", 
              repeat: Infinity,
              repeatType: "loop" 
            }
          }}
          className="relative"
        >
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <motion.div 
            className="absolute inset-0 flex items-center justify-center text-red-600 font-bold"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.2, 1, 0.2], 
              transition: { duration: 1.5, repeat: Infinity }
            }}
          >
            MD
          </motion.div>
        </motion.div>
      </div>
    );
  
  if (!dashboardData)
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex flex-col items-center justify-center min-h-screen text-lg text-gray-600 gap-4 bg-gray-50"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="p-8 bg-white rounded-2xl shadow-lg text-center"
        >
          <h2 className="text-2xl font-bold text-red-600 mb-2">No Dashboard Data</h2>
          <p>Unable to fetch your dashboard information at this time.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Try Again
          </motion.button>
        </motion.div>
      </motion.div>
    );

  const { doctorProfile, dashboardStats, todaysAppointments, demographics } = dashboardData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ease-in-out z-20`}>
        <Sidebar onCollapse={handleSidebarCollapse} />
      </div>

      {/* Main Content with scroll animations */}
      <motion.div 
        className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300`}
        style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '288px',
          perspective: "1000px",
          transformStyle: "preserve-3d"
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Header with notifications and profile */}
          <motion.div 
            className="flex justify-between items-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <div className="flex items-center mt-2 text-gray-500">
                <Calendar size={16} className="mr-2" />
                <span className="text-sm">{formattedDate}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flex items-center bg-white p-2 pr-4 rounded-full shadow-md"
                whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
              >
                {doctorProfile.image ? (
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    src={signedUrltoNormalUrl(doctorProfile.image)}
                    alt={doctorProfile.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-red-100"
                  />
                ) : (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md"
                  >
                    {doctorProfile.name.slice(0, 2).toUpperCase()}
                  </motion.div>
                )}
                <div className="ml-2 hidden md:block">
                  <div className="text-sm font-semibold">{doctorProfile.name}</div>
                  <div className="text-xs text-gray-500">
                    {doctorProfile.speciality && typeof doctorProfile.speciality === "object"
                      ? doctorProfile.speciality.name
                      : doctorProfile.speciality}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* 3D Rotating Greeting Card */}
          <motion.div 
            className="bg-white p-6 rounded-2xl shadow-md mb-6 overflow-hidden relative"
            initial={{ y: 20, opacity: 0, rotateX: -10 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            whileHover={{ 
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              y: -5
            }}
          >
            {/* Dynamic gradient background */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-50 rounded-full opacity-50 animate-pulse"></div>
            <div className="absolute right-10 bottom-5 w-20 h-20 bg-red-100 rounded-full opacity-50"></div>
            <motion.div 
              className="absolute top-0 left-0 w-full h-1"
              style={{
                background: "linear-gradient(90deg, #f87171, #ef4444, #dc2626, #b91c1c)",
                backgroundSize: "400% 100%"
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 0%"],
                transition: {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
            />
            
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <motion.h2 
                  className="text-xl font-semibold text-gray-800"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {getGreeting()}, <span className="text-red-600 font-bold">{doctorProfile.name}</span>!
                </motion.h2>
                <motion.p 
                  className="text-gray-500 mt-1"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Here's what's happening with your patients today.
                </motion.p>
              </div>
              <motion.div 
                className="flex items-center bg-red-50 px-4 py-3 rounded-lg shadow-sm"
                whileHover={{ scale: 1.05, rotate: 1 }}
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Clock size={20} className="text-red-600 mr-3" />
                <div>
                  <div className="text-xs text-gray-500">Next Appointment</div>
                  <div className="text-sm font-medium text-red-600">
                    {todaysAppointments.length > 0 ? todaysAppointments[0].time : "N/A"}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Dashboard Components */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="lg:col-span-2"
              variants={itemVariants}
            >
              <DashboardStats stats={dashboardStats} />
            </motion.div>
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-md"
              variants={itemVariants}
              whileHover={{ 
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                y: -5,
                transition: { type: "spring", stiffness: 300, damping: 25 }
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Today's Schedule</h2>
                <motion.div 
                  className="bg-red-50 px-3 py-1 rounded-full"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-red-600 text-xs font-medium flex items-center">
                    {todaysAppointments.length} appointments
                    <ChevronRight size={14} className="ml-1" />
                  </span>
                </motion.div>
              </div>
              {todaysAppointments.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {todaysAppointments.map((appt, index) => (
                    <motion.div 
                      key={index} 
                      className="border-l-4 border-red-600 pl-4 bg-white rounded-r-lg p-3 shadow-sm hover:shadow-md transition-all"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ 
                        x: 5, 
                        backgroundColor: "#fff5f5", 
                        borderColor: "#f87171",
                        scale: 1.02
                      }}
                    >
                      <div className="text-sm font-medium">
                        {appt.patientId?.name || "Patient"}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock size={12} className="mr-1 text-red-400" />
                        {appt.time} - {appt.reason || "General Checkup"}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="flex flex-col items-center justify-center py-6 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div 
                    className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  >
                    <Calendar size={24} className="text-red-400" />
                  </motion.div>
                  <p>No appointments scheduled for today</p>
                </motion.div>
              )}
              <motion.button 
                className="w-full mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg font-medium text-sm hover:from-red-600 hover:to-red-700 transition-all shadow-sm flex items-center justify-center"
                onClick={() => navigate("/doctor/appointments")}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                View All Appointments
                <ChevronRight size={16} className="ml-1" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Growth Chart Section with Time Range Filter */}
          <motion.div
            className="mb-6"
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-md p-6"
              whileHover={{ 
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                y: -5,
                transition: { type: "spring", stiffness: 300, damping: 25 }
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Growth Analytics</h2>
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                  {["daily", "weekly", "monthly", "yearly"].map((range) => (
                    <motion.button
                      key={range}
                      onClick={() => setTimeRange(range as "daily" | "weekly" | "monthly" | "yearly")}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                        timeRange === range 
                          ? "bg-white text-red-600 shadow-sm" 
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
              {/* GrowthChart component will conditionally render the date picker if "daily" is selected */}
              <GrowthChart timeRange={timeRange} />
            </motion.div>
          </motion.div>

          {/* Additional Analytics */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-md"
              variants={itemVariants}
              whileHover={{ 
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                y: -5,
                transition: { type: "spring", stiffness: 300, damping: 25 }
              }}
            >
              <h2 className="text-lg font-semibold mb-4">Patient Demographics</h2>
              <div className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span>
                      Male Patients
                    </span>
                    <span className="text-sm font-medium">{demographics.male}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${demographics.male}%` }}
                      transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-300 mr-2"></span>
                      Female Patients
                    </span>
                    <span className="text-sm font-medium">{demographics.female}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-red-300 to-red-400 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${demographics.female}%` }}
                      transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>
                      Age 18-35
                    </span>
                    <span className="text-sm font-medium">{demographics.age18to35}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-red-400 to-red-500 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${demographics.age18to35}%` }}
                      transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-md"
              variants={itemVariants}
              whileHover={{ 
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                y: -5,
                transition: { type: "spring", stiffness: 300, damping: 25 }
              }}
            >
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((item, index) => (
                  <motion.div 
                    key={item} 
                    className="flex items-start p-3 rounded-lg hover:bg-red-50 transition-colors"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0"
                      whileHover={{ scale: 1.1, backgroundColor: "#FCA5A5" }}
                      animate={{ 
                        y: [0, -5, 0],
                        transition: { duration: 2, delay: index * 0.2, repeat: Infinity, repeatType: "reverse" }
                      }}
                    >
                      <span className="text-xs text-red-600 font-medium">{item}h</span>
                    </motion.div>
                    <div>
                      <div className="text-sm font-medium">Medical Record Updated</div>
                      <div className="text-xs text-gray-500">Patient ID #1234{item} - Treatment plan updated</div>
                      <div className="mt-1 text-xs text-red-500 hover:underline cursor-pointer">View details</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// Add global styles for custom scrollbar
const globalStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f7f7f7;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e5e5e5;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #FCA5A5;
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  .float-animation {
    animation: float 3s ease-in-out infinite;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}

export default Home;
