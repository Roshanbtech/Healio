import type React from "react";
import { TrendingUp, Users, UserPlus, Calendar, Clock } from "lucide-react";
import { assets } from "../../../assets/assets";

interface StatCardProps {
  label: string;
  value: number;
  percentage?: number;
  isNew?: boolean;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, percentage, isNew, icon }) => (
  <div className={`rounded-xl p-4 ${isNew ? "bg-red-600" : "bg-white border border-gray-100"} shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-center mb-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isNew ? "bg-red-500" : "bg-red-100"} mr-2`}>
        {icon}
      </div>
      <div className={`text-sm font-medium ${isNew ? "text-red-100" : "text-gray-500"}`}>{label}</div>
    </div>
    <div className={`text-2xl font-bold ${isNew ? "text-white" : "text-red-600"}`}>{value}</div>
    {percentage && (
      <div className={`flex items-center mt-1 text-xs ${isNew ? "text-red-100" : "text-green-600"}`}>
        <TrendingUp size={14} className="mr-1" />
        {percentage}% increase
      </div>
    )}
  </div>
);

export const DashboardStats: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-2xl shadow-md mb-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Visits for Today</h2>
          <div className="flex items-center">
            <div className="text-4xl font-bold text-red-600">104</div>
            <div className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
              <TrendingUp size={12} className="mr-1" />
              +12%
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm text-sm">
          <span className="text-gray-500">Monthly Target: </span>
          <span className="font-medium">2,400 patients</span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-red-600 h-1.5 rounded-full" style={{ width: "45%" }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">1,080 / 2,400 (45%)</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="New Patients" 
            value={40} 
            percentage={51} 
            isNew 
            icon={<UserPlus size={16} className="text-white" />} 
          />
          <StatCard 
            label="Old Patients" 
            value={64} 
            percentage={23} 
            icon={<Users size={16} className="text-red-600" />} 
          />
          <StatCard 
            label="Appointments" 
            value={28} 
            percentage={12} 
            icon={<Calendar size={16} className="text-red-600" />} 
          />
          <StatCard 
            label="Avg. Visit Time" 
            value={24} 
            icon={<Clock size={16} className="text-red-600" />} 
          />
        </div>
        
        <div className="md:col-span-4 relative hidden md:block">
          <img
            src={assets.doc11}
            alt="Doctor"
            className="absolute bottom-0 right-0 h-full max-h-64 object-contain"
          />
        </div>
      </div>
    </div>
  );
};