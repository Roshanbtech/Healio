import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, Users, UserPlus, ArrowUpRight } from "lucide-react";
import axiosInstance from "../../../utils/axiosInterceptors";
import { motion, AnimatePresence } from "framer-motion";

interface GrowthChartData {
  timeLabel: string;
  newPatients: number;
  returningPatients: number;
  total: number;
}

interface GrowthChartProps {
  timeRange: "daily" | "weekly" | "monthly" | "yearly";
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ timeRange }) => {
  const [data, setData] = useState<GrowthChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"line" | "area">("area");
  const doctorId = localStorage.getItem("doctorId");
  
  // New state to handle selected date for daily view
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // You can adjust this mapping if your backend returns different keys
  const filteredData = data;

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        setLoading(true);
        // Build URL with selected date if timeRange is "daily"
        const url = `/doctor/dashboard-chart/${doctorId}?timeRange=${timeRange}${
          timeRange === "daily" ? `&date=${selectedDate}` : ""
        }`;
        const response = await axiosInstance.get(url);
        setData(response.data.data.growthData);
      } catch (error) {
        console.error("Error fetching growth data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrowthData();
  }, [doctorId, timeRange, selectedDate]);

  const calculateGrowthStats = () => {
    if (!filteredData || filteredData.length < 2) {
      return {
        newPatientGrowth: 0,
        returningPatientGrowth: 0,
        totalGrowth: 0,
        lastDataPoint: {
          newPatients: 0,
          returningPatients: 0,
          total: 0,
        },
      };
    }

    const lastDataPoint = filteredData[filteredData.length - 1];
    const previousDataPoint = filteredData[filteredData.length - 2];

    const calculateGrowth = (current: number, previous: number) =>
      previous ? Math.round(((current - previous) / previous) * 100) : 0;

    return {
      newPatientGrowth: calculateGrowth(
        lastDataPoint.newPatients,
        previousDataPoint.newPatients
      ),
      returningPatientGrowth: calculateGrowth(
        lastDataPoint.returningPatients,
        previousDataPoint.returningPatients
      ),
      totalGrowth: calculateGrowth(lastDataPoint.total, previousDataPoint.total),
      lastDataPoint,
    };
  };

  const { newPatientGrowth, returningPatientGrowth, totalGrowth, lastDataPoint } =
    calculateGrowthStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 bg-white p-6 rounded-2xl shadow-md">
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{
            rotateY: 360,
            transition: {
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            },
          }}
          className="relative"
        >
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-red-600 font-bold"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.2, 1, 0.2],
              transition: { duration: 1.5, repeat: Infinity },
            }}
          >
            MD
          </motion.div>
        </motion.div>
      </div>
    );

  if (!data || data.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-64 bg-white p-6 rounded-2xl shadow-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <TrendingUp size={48} className="text-red-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">
            No Chart Data Available
          </h3>
          <p className="text-gray-500 mt-2">
            We couldn't find any growth data for this period.
          </p>
        </motion.div>
      </motion.div>
    );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* If the time range is daily, show a date picker */}
      {timeRange === "daily" && (
        <div className="mb-4">
          <label htmlFor="datePicker" className="mr-2 text-sm text-gray-700">
            Select Date:
          </label>
          <input
            type="date"
            id="datePicker"
            className="p-1 border border-gray-300 rounded"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      )}

      {/* Statistic Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.1, backgroundColor: "#FEE2E2" }}
                className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3"
              >
                <Users size={18} className="text-red-600" />
              </motion.div>
              <span className="text-sm text-gray-600">Total Patients</span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className={`flex items-center text-xs px-2 py-1 rounded-full ${
                totalGrowth >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}
            >
              <TrendingUp size={14} className="mr-1" />
              {totalGrowth}%
            </motion.div>
          </div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold mt-2 text-gray-800"
          >
            {lastDataPoint.total}
          </motion.div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.1, backgroundColor: "#FEE2E2" }}
                className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3"
              >
                <UserPlus size={18} className="text-red-600" />
              </motion.div>
              <span className="text-sm text-gray-600">New Patients</span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className={`flex items-center text-xs px-2 py-1 rounded-full ${
                newPatientGrowth >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}
            >
              <TrendingUp size={14} className="mr-1" />
              {newPatientGrowth}%
            </motion.div>
          </div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold mt-2 text-gray-800"
          >
            {lastDataPoint.newPatients}
          </motion.div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.1, backgroundColor: "#FEE2E2" }}
                className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3"
              >
                <ArrowUpRight size={18} className="text-red-600" />
              </motion.div>
              <span className="text-sm text-gray-600">Returning Patients</span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className={`flex items-center text-xs px-2 py-1 rounded-full ${
                returningPatientGrowth >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}
            >
              <TrendingUp size={14} className="mr-1" />
              {returningPatientGrowth}%
            </motion.div>
          </div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold mt-2 text-gray-800"
          >
            {lastDataPoint.returningPatients}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex justify-between items-center mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-800">
          Patient Growth Analysis
        </h2>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChartType("line")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              chartType === "line"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Line
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChartType("area")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              chartType === "area"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Area
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white p-4 rounded-xl shadow-md h-64 overflow-hidden"
        whileHover={{
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          transition: { type: "spring", stiffness: 300, damping: 25 },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={chartType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={filteredData}>
                  <defs>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                    animationDuration={300}
                  />
                  <Legend align="right" verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="newPatients"
                    name="New Patients"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: "#ef4444" }}
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    dataKey="returningPatients"
                    name="Returning Patients"
                    stroke="#fb923c"
                    strokeWidth={3}
                    dot={{ fill: "#fb923c", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: "#fb923c" }}
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: "#3b82f6" }}
                    animationDuration={1500}
                  />
                </LineChart>
              ) : (
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DCFCE7" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#DCFCE7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                    animationDuration={300}
                  />
                  <Legend align="right" verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    dataKey="newPatients"
                    name="New Patients"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorNew)"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: "#ef4444" }}
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="returningPatients"
                    name="Returning Patients"
                    stroke="#fb923c"
                    fillOpacity={0.8}
                    fill="url(#colorReturning)"
                    strokeWidth={2}
                    dot={{ fill: "#fb923c", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: "#fb923c" }}
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="#3b82f6"
                    fillOpacity={0.5}
                    fill="url(#colorTotal)"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: "#3b82f6" }}
                    animationDuration={1500}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 rounded-b-xl overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #f87171, #ef4444, #dc2626, #b91c1c)",
          backgroundSize: "400% 100%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%"],
          transition: {
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          },
        }}
      />
    </motion.div>
  );
};
