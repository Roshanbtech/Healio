"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, Users, UserPlus, Calendar } from "lucide-react";
import axiosInstance from "../../../utils/axiosInterceptors";
import { assets } from "../../../assets/assets";
import { motion, AnimatePresence } from "framer-motion";

// Interfaces for aggregated data
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
  speciality: string | { _id: string; name: string };
  image?: string;
}

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const doctorId = localStorage.getItem("doctorId") || "";

  useEffect(() => {
    const fetchData = async () => {
      if (!doctorId) {
        console.error("Doctor ID not found in sessionStorage");
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(`/doctor/dashboard-stats/${doctorId}`);
        if (response.data?.data) {
          setStats(response.data.data.stats);
          setDoctorProfile(response.data.data.doctorProfile);
        } else {
          console.error("Dashboard error:", response.data?.message || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Child animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  // Fancy 3D loading animation
  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-gradient-to-b from-white to-gray-50 rounded-2xl">
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
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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

  if (!stats) return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="p-8 bg-white rounded-2xl shadow-lg text-center"
      >
        <h2 className="text-2xl font-bold text-red-600 mb-2">No Stats Available</h2>
        <p>Unable to fetch dashboard statistics at this time.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg"
          onClick={() => window.location.reload()}
        >
          Refresh
        </motion.button>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div 
      className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-2xl shadow-md mb-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        y: -5,
        transition: { type: "spring", stiffness: 300, damping: 25 }
      }}
      style={{ perspective: "1000px" }}
    >
      {/* Decorative background elements */}
      <motion.div 
        className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-200 rounded-full opacity-30"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
      <motion.div 
        className="absolute right-20 top-10 w-20 h-20 bg-red-300 rounded-full opacity-20"
        animate={{ 
          scale: [1, 1.1, 1],
          x: [0, 10, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />

      {/* Animated gradient border */}
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

      {/* Header Section */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <motion.h2 
            className="text-xl font-semibold text-gray-800"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Visits for Today
          </motion.h2>
          <motion.div 
            className="flex items-center mt-2"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="text-4xl font-bold text-red-600"
              whileHover={{ scale: 1.05 }}
            >
              {stats.visitsToday}
            </motion.div>
            <motion.div 
              className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center"
              whileHover={{ scale: 1.1, rotate: 2 }}
            >
              <TrendingUp size={12} className="mr-1" />
              {stats.growthPercentage}%
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-4 md:mt-0 bg-white px-4 py-3 rounded-lg shadow-sm text-sm"
          variants={itemVariants}
          whileHover={{ 
            scale: 1.03, 
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", 
            rotateX: 5 
          }}
        >
          <span className="text-gray-500">Monthly Target: </span>
          <span className="font-medium">{stats.monthlyTarget} patients</span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <motion.div
              className="bg-red-600 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.monthlyAchieved / stats.monthlyTarget) * 100}%` }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            ></motion.div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.monthlyAchieved} / {stats.monthlyTarget} (
            {Math.round((stats.monthlyAchieved / stats.monthlyTarget) * 100)}%)
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Cards Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-12 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4"
          variants={itemVariants}
        >
          <AnimatePresence>
            {stats.statCards.map((card, index) => (
              <motion.div
                key={index}
                className={`rounded-xl p-4 ${
                  card.label === "New Patients" ? "bg-red-600" : "bg-white border border-gray-100"
                } shadow-sm hover:shadow-md transition-shadow`}
                initial={{ y: 20, opacity: 0, rotateX: -10 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ delay: 0.2 + (index * 0.1), type: "spring", stiffness: 100 }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", 
                  rotateX: 10,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300, damping: 15 }
                }}
              >
                <div className="flex items-center mb-2">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      card.label === "New Patients" ? "bg-red-500" : "bg-red-100"
                    } mr-2`}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    animate={{ 
                      y: [0, -3, 0],
                      transition: { 
                        duration: 2,
                        delay: index * 0.3,
                        repeat: Infinity,
                        repeatType: "reverse" 
                      }
                    }}
                  >
                    {card.label === "New Patients" ? (
                      <UserPlus size={16} className="text-white" />
                    ) : card.label === "Old Patients" ? (
                      <Users size={16} className="text-red-600" />
                    ) : (
                      <Calendar size={16} className="text-red-600" />
                    )}
                  </motion.div>
                  <div className={`text-sm font-medium ${card.label === "New Patients" ? "text-red-100" : "text-gray-500"}`}>
                    {card.label}
                  </div>
                </div>
                <motion.div 
                  className={`text-2xl font-bold ${card.label === "New Patients" ? "text-white" : "text-red-600"}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + (index * 0.1), type: "spring" }}
                >
                  {card.value}
                </motion.div>
                {card.percentage !== undefined && (
                  <motion.div 
                    className={`flex items-center mt-1 text-xs ${card.label === "New Patients" ? "text-red-100" : "text-green-600"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                  >
                    <TrendingUp size={14} className="mr-1" />
                    {card.percentage}% increase
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Doctor Profile Image */}
        <motion.div 
          className="md:col-span-4 hidden md:block relative"
          variants={itemVariants}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-red-100 to-transparent rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          />
          <motion.img
            src={doctorProfile?.image || assets.doc11}
            alt={doctorProfile?.name || "Doctor"}
            className="w-full h-auto max-h-64 object-contain relative z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ 
              scale: 1.05,
              rotate: 1,
              transition: { type: "spring", stiffness: 300, damping: 15 }
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-red-100 to-transparent rounded-b-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.6, duration: 1 }}
          />
        </motion.div>
      </motion.div>

      {/* Pulsing highlight effect */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full rounded-2xl border-2 border-transparent"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.2, 0],
          boxShadow: [
            "0 0 0 0 rgba(239, 68, 68, 0)", 
            "0 0 0 10px rgba(239, 68, 68, 0.2)", 
            "0 0 0 20px rgba(239, 68, 68, 0)"
          ]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: "loop" 
        }}
      />
    </motion.div>
  );
};