"use client";
import React, { useState } from "react";
import { Sidebar } from "../common/doctorCommon/Sidebar";
import { DashboardStats } from "../common/doctorCommon/Dashboard-stats";
import { GrowthChart } from "../common/doctorCommon/Growth-chart";
import { Calendar, Clock, Bell, Mail } from "lucide-react";

const Home: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  // Current date for the greeting header
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white border-r border-gray-200 shadow-sm transition-all duration-300`}
      >
        <Sidebar onCollapse={setSidebarCollapsed} />
      </div>
      
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
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                  DR
                </div>
                <div className="ml-2 hidden md:block">
                  <div className="text-sm font-semibold">Dr. Roshan</div>
                  <div className="text-xs text-gray-500">Cardiologist</div>
                </div>
              </div>
            </div>
          </div>

          {/* Greeting Card */}
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Good Morning, <span className="text-red-600">Dr. Roshan!</span></h2>
                <p className="text-gray-500 mt-1">Here's what's happening with your patients today.</p>
              </div>
              <div className="flex items-center bg-red-50 px-4 py-2 rounded-lg">
                <Clock size={18} className="text-red-600 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Next Appointment</div>
                  <div className="text-sm font-medium text-red-600">10:30 AM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <DashboardStats />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
              {[1, 2, 3].map((item) => (
                <div key={item} className="mb-4 border-l-4 border-red-600 pl-4">
                  <div className="text-sm font-medium">Patient #{item} - John Doe</div>
                  <div className="text-xs text-gray-500">10:3{item} AM - General Checkup</div>
                </div>
              ))}
              <button className="w-full mt-4 bg-red-50 text-red-600 py-2 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors">
                View All Appointments
              </button>
            </div>
          </div>

          {/* Growth Chart */}
          <GrowthChart />
          
          {/* Additional Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">Patient Demographics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Male</span>
                  <span className="text-sm font-medium">62%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: "62%" }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Female</span>
                  <span className="text-sm font-medium">38%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-300 h-2 rounded-full" style={{ width: "38%" }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Age 18-35</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
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