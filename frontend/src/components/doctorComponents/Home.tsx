"use client";
import React, { useState } from "react";
import { Sidebar } from "../common/doctorCommon/Sidebar";
import { DashboardStats } from "../common/doctorCommon/Dashboard-stats";
import { GrowthChart } from "../common/doctorCommon/Growth-chart";

const Home: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex bg-white">
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white shadow-lg`}
      >
        <Sidebar onCollapse={setSidebarCollapsed} />
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <h2 className="text-xl mt-2">
              Good Morning <span className="text-red-600">Dr.Roshan!</span>
            </h2>
          </div>
          <DashboardStats />
          <GrowthChart />
        </div>
      </div>
    </div>
  );
};

export default Home;
