import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosInterceptors";
import StatCard from "./dashboardComponents/StatCard";
import TopDoctorsTable from "./dashboardComponents/TopDoctorsTable";
import TopUsersTable from "./dashboardComponents/TopUsersTable";
import AppointmentChart from "./dashboardComponents/AppointmentChart";
import { Sidebar } from "../common/adminCommon/Sidebar";
import { Users, UserIcon, Calendar, DollarSign } from "lucide-react";

interface DashboardStats {
  totalCustomers: number;
  totalDoctors: number;
  completedBookings: number;
  totalRevenue: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeFrame, setTimeFrame] = useState("weekly");
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/admin/login");
    }
    setIsVisible(true);
    const handleScroll = () => {
      const elements = document.querySelectorAll(".scroll-animate");
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.8) {
          el.classList.add("animate-in");
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navigate]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await axiosInstance.get("/admin/stats");
        if (response.data.status) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchTopDoctors() {
      try {
        const response = await axiosInstance.get("/admin/top-doctors");
        if (response.data.status) {
          setDoctors(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching top doctors:", error);
      }
    }
    fetchTopDoctors();
  }, []);

  useEffect(() => {
    async function fetchTopUsers() {
      try {
        const response = await axiosInstance.get("/admin/top-users");
        if (response.data.status) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching top users:", error);
      }
    }
    fetchTopUsers();
  }, []);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await axiosInstance.get(
          `/admin/analytics?timeFrame=${timeFrame}`
        );
        if (response.data.status) {
          setAnalytics(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }
    fetchAnalytics();
  }, [timeFrame]);

  const statData = stats
  ? [
      {
        title: "Total Customers",
        value: stats.totalCustomers,
        icon: <Users size={24} className="text-red-600" />,
        bgColor: "bg-white",
        iconBg: "bg-red-100",
        textColor: "text-red-600"
      },
      {
        title: "Total Doctors",
        value: stats.totalDoctors,
        icon: <UserIcon size={24} className="text-green-800" />, // Changed from text-white to text-green-800
        bgColor: "bg-green-800",
        iconBg: "bg-green-100",
        textColor: "text-white"
      },
      {
        title: "Completed Bookings",
        value: stats.completedBookings,
        icon: <Calendar size={24} className="text-green-800" />,
        bgColor: "bg-green-100",
        iconBg: "bg-white",
        textColor: "text-green-800"
      },
      {
        title: "Total Revenue",
        value: `₹${stats.totalRevenue.toLocaleString()}`,
        icon: <DollarSign size={24} className="text-red-600" />, // Changed from text-white to text-red-600
        bgColor: "bg-red-600",
        iconBg: "bg-white",
        textColor: "text-white"
      },
    ]
  : [];


  return (
    <div className="min-h-screen overflow-x-hidden">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div
        className={`transition-all duration-500 ease-in-out ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: isVisible ? 1 : 0,
              y: isVisible ? 0 : -20,
            }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome Back, Admin
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your clinic today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  x: isVisible ? 0 : -30,
                }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  bgColor={stat.bgColor}
                  iconBg={stat.iconBg}
                  textColor={stat.textColor}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: isVisible ? 1 : 0,
              y: isVisible ? 0 : 30,
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden scroll-animate"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Appointment Analytics
                </h2>
                <div className="flex space-x-2">
                  {["daily", "weekly", "monthly", "yearly"].map((option) => (
                    <button
                      key={option}
                      onClick={() => setTimeFrame(option)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        timeFrame === option
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <AppointmentChart data={analytics} timeFrame={timeFrame} />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{
                opacity: isVisible ? 1 : 0,
                x: isVisible ? 0 : -30,
              }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden scroll-animate"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Top Performing Doctors
                </h2>
                <TopDoctorsTable doctors={doctors} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{
                opacity: isVisible ? 1 : 0,
                x: isVisible ? 0 : 30,
              }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden scroll-animate"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Most Active Patients
                </h2>
                <TopUsersTable users={users} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
