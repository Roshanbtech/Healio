"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, Users, UserPlus, Calendar } from "lucide-react";
import axiosInstance from "../../../utils/axiosInterceptors";
import { assets } from "../../../assets/assets";

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

  if (loading) return <div>Loading dashboard stats...</div>;
  if (!stats ) return <div>No dashboard stats available</div>;

  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-2xl shadow-md mb-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Visits for Today</h2>
          <div className="flex items-center">
            <div className="text-4xl font-bold text-red-600">{stats.visitsToday}</div>
            <div className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
              <TrendingUp size={12} className="mr-1" />
              {stats.growthPercentage}%
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm text-sm">
          <span className="text-gray-500">Monthly Target: </span>
          <span className="font-medium">{stats.monthlyTarget} patients</span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-red-600 h-1.5 rounded-full"
              style={{ width: `${(stats.monthlyAchieved / stats.monthlyTarget) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.monthlyAchieved} / {stats.monthlyTarget} (
            {Math.round((stats.monthlyAchieved / stats.monthlyTarget) * 100)}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.statCards.map((card, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 ${
                card.label === "New Patients" ? "bg-red-600" : "bg-white border border-gray-100"
              } shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    card.label === "New Patients" ? "bg-red-500" : "bg-red-100"
                  } mr-2`}
                >
                  {card.label === "New Patients" ? (
                    <UserPlus size={16} className="text-white" />
                  ) : card.label === "Old Patients" ? (
                    <Users size={16} className="text-red-600" />
                  ) : (
                    <Calendar size={16} className="text-red-600" />
                  )}
                </div>
                <div className={`text-sm font-medium ${card.label === "New Patients" ? "text-red-100" : "text-gray-500"}`}>
                  {card.label}
                </div>
              </div>
              <div className={`text-2xl font-bold ${card.label === "New Patients" ? "text-white" : "text-red-600"}`}>
                {card.value}
              </div>
              {card.percentage !== undefined && (
                <div className={`flex items-center mt-1 text-xs ${card.label === "New Patients" ? "text-red-100" : "text-green-600"}`}>
                  <TrendingUp size={14} className="mr-1" />
                  {card.percentage}% increase
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="md:col-span-4 hidden md:block">
          <img
            src={doctorProfile?.image || assets.doc11}
            alt={doctorProfile?.name || "Doctor"}
            className="w-full h-auto max-h-64 object-contain"
          />
        </div>
      </div>
    </div>
  );
};
