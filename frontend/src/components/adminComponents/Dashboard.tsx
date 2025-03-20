// // Dashboard.jsx - Main component
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import StatCard from "./dashboardComponents/StatCard";
// import TopDoctorsTable from "./dashboardComponents/TopDoctorsTable";
// import TopUsersTable from "./dashboardComponents/TopUsersTable";
// import AppointmentChart from "./dashboardComponents/AppointmentChart";
// import { Sidebar } from "../common/adminCommon/Sidebar";
// import { Users, UserIcon, Calendar, DollarSign } from "lucide-react";
// import { motion } from "framer-motion";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [timeFrame, setTimeFrame] = useState("weekly");
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       navigate("/admin/login");
//     }
    
//     // Animation on mount
//     setIsVisible(true);
    
//     // Set up scroll event listeners for animation
//     const handleScroll = () => {
//       const elements = document.querySelectorAll('.scroll-animate');
//       elements.forEach(el => {
//         const rect = el.getBoundingClientRect();
//         const isInViewport = rect.top <= window.innerHeight * 0.8;
        
//         if (isInViewport) {
//           el.classList.add('animate-in');
//         }
//       });
//     };
    
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [navigate]);

//   // Mock data
//   const statData = [
//     { title: "Total Customers", value: 1342, icon: <Users size={20} />, bgColor: "bg-red-600", iconBg: "bg-red-100" },
//     { title: "Total Doctors", value: 86, icon: <UserIcon size={20} />, bgColor: "bg-green-600", iconBg: "bg-green-100" },
//     { title: "Completed Bookings", value: 924, icon: <Calendar size={20} />, bgColor: "bg-blue-600", iconBg: "bg-blue-100" },
//     { title: "Total Revenue", value: "₹85,246", icon: <DollarSign size={20} />, bgColor: "bg-purple-600", iconBg: "bg-purple-100" }
//   ];

//   const doctorsData = [
//     { id: 1, name: "Dr. Sarah Wilson", specialty: "Cardiologist", image: "/api/placeholder/48/48", earnings: "12,450", appointments: 37, rating: 4.9 },
//     { id: 2, name: "Dr. Michael Chen", specialty: "Neurologist", image: "/api/placeholder/48/48", earnings: "10,875", appointments: 31, rating: 4.8 },
//     { id: 3, name: "Dr. Emily Johnson", specialty: "Pediatrician", image: "/api/placeholder/48/48", earnings: "9,320", appointments: 29, rating: 4.7 },
//     { id: 4, name: "Dr. James Rodriguez", specialty: "Orthopedic", image: "/api/placeholder/48/48", earnings: "8,750", appointments: 25, rating: 4.6 },
//     { id: 5, name: "Dr. Lisa Wong", specialty: "Dermatologist", image: "/api/placeholder/48/48", earnings: "7,890", appointments: 22, rating: 4.5 }
//   ];

//   const usersData = [
//     { id: 1, name: "Rahul Sharma", image: "/api/placeholder/48/48", bookings: 12, lastVisit: "2025-03-15", totalSpent: "7,500" },
//     { id: 2, name: "Priya Patel", image: "/api/placeholder/48/48", bookings: 9, lastVisit: "2025-03-10", totalSpent: "6,200" },
//     { id: 3, name: "Amit Singh", image: "/api/placeholder/48/48", bookings: 8, lastVisit: "2025-03-05", totalSpent: "5,800" },
//     { id: 4, name: "Deepa Gupta", image: "/api/placeholder/48/48", bookings: 7, lastVisit: "2025-03-01", totalSpent: "4,900" },
//     { id: 5, name: "Vikram Joshi", image: "/api/placeholder/48/48", bookings: 6, lastVisit: "2025-02-25", totalSpent: "4,200" }
//   ];

//   return (
//     <div className="min-h-screen overflow-x-hidden">
//       <Sidebar onCollapse={setSidebarCollapsed} />
//       <div
//         className={`transition-all duration-500 ease-in-out ${
//           sidebarCollapsed ? "ml-16" : "ml-64"
//         }`}
//       >
//         <div className="p-6">
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
//             transition={{ duration: 0.5 }}
//             className="mb-8"
//           >
//             <h1 className="text-3xl font-bold text-gray-800">Welcome Back, Admin</h1>
//             <p className="text-gray-600 mt-1">Here's what's happening with your clinic today.</p>
//           </motion.div>

//           {/* Stats Section */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {statData.map((stat, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, x: -30 }}
//                 animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -30 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//               >
//                 <StatCard
//                   title={stat.title}
//                   value={stat.value}
//                   icon={stat.icon}
//                   bgColor={stat.bgColor}
//                   iconBg={stat.iconBg}
//                 />
//               </motion.div>
//             ))}
//           </div>

//           {/* Chart Section */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden scroll-animate"
//           >
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-xl font-bold text-gray-800">Appointment Analytics</h2>
//                 <div className="flex space-x-2">
//                   {["daily", "weekly", "monthly", "yearly"].map((option) => (
//                     <button
//                       key={option}
//                       onClick={() => setTimeFrame(option)}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                         timeFrame === option
//                           ? "bg-red-600 text-white"
//                           : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                       }`}
//                     >
//                       {option.charAt(0).toUpperCase() + option.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <AppointmentChart timeFrame={timeFrame} />
//             </div>
//           </motion.div>

//           {/* Tables Section */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <motion.div
//               initial={{ opacity: 0, x: -30 }}
//               animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -30 }}
//               transition={{ duration: 0.5, delay: 0.3 }}
//               className="bg-white rounded-xl shadow-lg overflow-hidden scroll-animate"
//             >
//               <div className="p-6">
//                 <h2 className="text-xl font-bold text-gray-800 mb-6">Top Performing Doctors</h2>
//                 <TopDoctorsTable doctors={doctorsData} />
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, x: 30 }}
//               animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 30 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//               className="bg-white rounded-xl shadow-lg overflow-hidden scroll-animate"
//             >
//               <div className="p-6">
//                 <h2 className="text-xl font-bold text-gray-800 mb-6">Most Active Patients</h2>
//                 <TopUsersTable users={usersData} />
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

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
          icon: <Users size={20} />,
          bgColor: "bg-red-600",
          iconBg: "bg-red-100",
        },
        {
          title: "Total Doctors",
          value: stats.totalDoctors,
          icon: <UserIcon size={20} />,
          bgColor: "bg-green-600",
          iconBg: "bg-green-100",
        },
        {
          title: "Completed Bookings",
          value: stats.completedBookings,
          icon: <Calendar size={20} />,
          bgColor: "bg-blue-600",
          iconBg: "bg-blue-100",
        },
        {
          title: "Total Revenue",
          value: `₹${stats.totalRevenue.toLocaleString()}`,
          icon: <DollarSign size={20} />,
          bgColor: "bg-purple-600",
          iconBg: "bg-purple-100",
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
