"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MessageCircle, Eye, Phone } from "lucide-react";
import { Button } from "../common/adminCommon/Button";
import { Sidebar } from "../common/adminCommon/Sidebar";
import Pagination from "../common/adminCommon/Pagination";

// Appointment and Pagination types
interface Appointment {
  id: string;
  patientName: string;
  time: string;
  status: "Pending" | "Cancelled" | "No Report";
  date: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Mock appointments data
const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Roshan Raji",
    time: "10:00 AM",
    status: "Pending",
    date: "25/11/2022",
  },
  {
    id: "2",
    patientName: "Roshan Raji",
    time: "11:00 AM",
    status: "Cancelled",
    date: "25/11/2022",
  },
  {
    id: "3",
    patientName: "Roshan Raji",
    time: "12:00 PM",
    status: "No Report",
    date: "25/11/2022",
  },
];

const AppointmentsList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [appointments] = useState<Appointment[]>(mockAppointments);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentDate] = useState("25/11/2022"); // This can be replaced with a dynamic date if needed

  const itemsPerPage = 10;

  // Update pagination info when the current page changes
  useEffect(() => {
    setPagination({
      total: appointments.length,
      page: currentPage,
      limit: itemsPerPage,
      totalPages: Math.ceil(appointments.length / itemsPerPage),
    });
  }, [currentPage, appointments.length]);

  // Returns proper badge styling based on the appointment status
  const getStatusBadgeClass = (status: Appointment["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "No Report":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Appointments
                  </h1>
                  <span className="text-gray-500">{">"}</span>
                  <span className="text-gray-600">Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span className="text-gray-600">{currentDate}</span>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-red-600">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {appointment.patientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {appointment.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <MessageCircle className="w-4 h-4" />
                              View Chat
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                            {appointment.status === "No Report" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-gray-600 border-gray-600 hover:bg-gray-50"
                              >
                                <Phone className="w-4 h-4" />
                                Contact
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page: number) => setCurrentPage(page)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsList;
