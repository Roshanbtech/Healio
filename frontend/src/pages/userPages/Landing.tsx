import React, { useState } from "react";
import {
  HomeIcon,
  UserIcon,
  CalendarIcon,
  ListChecksIcon,
  AwardIcon,
  WalletIcon,
  MessageSquareIcon,
  LogOutIcon,
  PlusIcon,
} from "lucide-react";

const CurrentSchedules = () => {
  const [selectedDate, setSelectedDate] = useState("2025-11-25");
  
  const mockSchedules = [
    {
      date: "15 Jul 2025",
      times: ["9:00am - 10:00am", "11:30am"],
    },
    {
      date: "16 Jul 2025",
      times: ["9:00am - 10:00am", "11:30am", "1:30pm"],
    },
    {
      date: "17 Jul 2025",
      times: ["9:00am", "10:30am", "11:30am", "1:30pm"],
    },
    {
      date: "18 Jul 2025",
      times: ["9:00am - 10:00am", "1:30pm"],
    },
  ];

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

 

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      

    

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Current Schedules</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="outline-none text-sm"
              />
            </div>
            <button className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors">
              <PlusIcon size={18} className="mr-1" />
              Add Schedule
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          Dashboard &gt; Current Schedules
        </div>

        {/* Schedules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockSchedules.map((schedule, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
            >
              <h3 className="text-lg font-bold text-gray-700 mb-3">
                {schedule.date}
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {schedule.times.map((time, i) => (
                  <span
                    key={i}
                    className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CurrentSchedules;