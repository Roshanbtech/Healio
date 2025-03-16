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
} from "recharts";
import { TrendingUp, Users, UserPlus, ArrowUpRight } from "lucide-react";
import axiosInstance from "../../../utils/axiosInterceptors";

interface GrowthChartData {
  month: string;
  newPatients: number;
  returningPatients: number;
  total: number;
}

export const GrowthChart: React.FC = () => {
  const [data, setData] = useState<GrowthChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await axiosInstance.get(`/doctor/dashboard-chart/${doctorId}`);
        setData(response.data.data.growthData);
      } catch (error) {
        console.error("Error fetching growth data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrowthData();
  }, [doctorId]);

  if (loading) return <div>Loading chart data...</div>;
  if (!data || data.length === 0) return <div>No chart data available</div>;

  // Calculate growth percentages based on the last two data points.
  const lastMonthData = data[data.length - 1];
  const previousMonthData = data[data.length - 2] || { newPatients: 0, returningPatients: 0, total: 0 };

  const calculateGrowth = (current: number, previous: number) =>
    previous ? Math.round(((current - previous) / previous) * 100) : 0;

  const newPatientGrowth = calculateGrowth(lastMonthData.newPatients, previousMonthData.newPatients);
  const returningPatientGrowth = calculateGrowth(lastMonthData.returningPatients, previousMonthData.returningPatients);
  const totalGrowth = calculateGrowth(lastMonthData.total, previousMonthData.total);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Patient Growth</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
            6 Months
          </button>
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            1 Year
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                <Users size={16} className="text-red-600" />
              </div>
              <span className="text-sm text-gray-600">Total Patients</span>
            </div>
            <div className={`flex items-center text-xs ${totalGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp size={14} className="mr-1" />
              {totalGrowth}%
            </div>
          </div>
          <div className="text-2xl font-bold mt-2">{lastMonthData.total}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                <UserPlus size={16} className="text-red-600" />
              </div>
              <span className="text-sm text-gray-600">New Patients</span>
            </div>
            <div className={`flex items-center text-xs ${newPatientGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp size={14} className="mr-1" />
              {newPatientGrowth}%
            </div>
          </div>
          <div className="text-2xl font-bold mt-2">{lastMonthData.newPatients}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                <ArrowUpRight size={16} className="text-red-600" />
              </div>
              <span className="text-sm text-gray-600">Returning</span>
            </div>
            <div className={`flex items-center text-xs ${returningPatientGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp size={14} className="mr-1" />
              {returningPatientGrowth}%
            </div>
          </div>
          <div className="text-2xl font-bold mt-2">{lastMonthData.returningPatients}</div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "none",
              }}
            />
            <Legend align="right" verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="newPatients"
              name="New Patients"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="returningPatients"
              name="Returning Patients"
              stroke="#fb923c"
              strokeWidth={2}
              dot={{ fill: "#fb923c", r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
