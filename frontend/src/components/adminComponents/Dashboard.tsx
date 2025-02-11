import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../common/adminCommon/Sidebar";
import { Users, UserIcon as UserMd, Calendar, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface DoctorData {
  id: number;
  name: string;
  earnings: string;
  appointments: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // State to control the sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const chartData = [
    { name: "JAN", value: 2, value2: 1 },
    { name: "FEB", value: 1, value2: 4 },
    { name: "MAR", value: 3, value2: 2 },
    { name: "APR", value: 2, value2: 3 },
    { name: "MAY", value: 1, value2: 2 },
    { name: "JUN", value: 4, value2: 1 },
    { name: "JUL", value: 3, value2: 2 },
    { name: "AUG", value: 2, value2: 1 },
  ];

  const doctorsData: DoctorData[] = [
    { id: 1, name: "Dr. Ryan", earnings: "$55", appointments: 31 },
    { id: 2, name: "Dr. John", earnings: "$45", appointments: 17 },
  ];

  return (
    <>
      {/* Pass the onCollapse callback to Sidebar */}
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div
        className={`p-6 bg-gray-50 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome Admin!...
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">13</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Users className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold">22</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <UserMd className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bookings Done</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Calendar className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doc Commission</p>
                <p className="text-2xl font-bold">₹36</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <DollarSign className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Analysis Chart */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Data Analysis</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" fill="#4ADE80" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value2" fill="#FF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Doctors Table */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">TOP DOCTORS</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left">ID</th>
                    <th className="py-2 px-4 text-left">NAME</th>
                    <th className="py-2 px-4 text-left">DOCTOR EARNINGS</th>
                    <th className="py-2 px-4 text-left">APPOINTMENT</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorsData.map((doctor) => (
                    <tr key={doctor.id} className="border-b">
                      <td className="py-2 px-4">{doctor.id}</td>
                      <td className="py-2 px-4">{doctor.name}</td>
                      <td className="py-2 px-4">{doctor.earnings}</td>
                      <td className="py-2 px-4">{doctor.appointments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
