"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MessageCircle,
  Eye,
  Phone,
  Search,
  FileText,
  Check,
  Info,
} from "lucide-react";
import { Sidebar } from "../common/doctorCommon/Sidebar";
import { format } from "date-fns";
import axiosInstance from "../../utils/axiosInterceptors";
import { toast } from "react-toastify";

// Custom Button Component (unchanged)
interface CustomButtonProps {
  children: React.ReactNode;
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  variant = "solid",
  size = "md",
  className = "",
  onClick,
  disabled = false,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none";
  const variantClasses = {
    solid: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-white border hover:bg-gray-50",
  };
  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Appointment Interface (unchanged)
interface Appointment {
  _id: string;
  appointmentId: string;
  patientId: { _id: string; name: string; email: string; phone: string };
  doctorId: string;
  date: string;
  time: string;
  status:
    | "pending"
    | "accepted"
    | "completed"
    | "cancelled"
    | "cancelled by Dr";
  reason?: string;
  fees?: number;
  paymentStatus?:
    | "payment pending"
    | "payment completed"
    | "payment failed"
    | "refunded"
    | "anonymous";
  prescription?: string | null;
  review?: { rating?: number; description?: string };
  // New property for medical records
  medicalRecords?: {
    recordDate?: string;
    condition?: string;
    symptoms?: string[];
    medications?: string[];
    notes?: string;
  }[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AppointmentsList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("pending"); // Default to pending status
  const [dateFilter, setDateFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  // New state to determine what view the modal should display
  const [modalViewType, setModalViewType] = useState<
    "appointment" | "prescription" | "previousReport"
  >("appointment");

  const itemsPerPage = 10;
  const doctorId = sessionStorage.getItem("doctorId");

  // Fetch Appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/doctor/appointments/${doctorId}`
        );
        if (response.data.status) {
          setAppointments(response.data.data.appointments);
          // Initial filtering to show only pending appointments
          const pendingAppointments = response.data.data.appointments.filter(
            (appointment: Appointment) => appointment.status === "pending"
          );
          setFilteredAppointments(pendingAppointments);
          setError(null);
        } else {
          setError("Failed to fetch appointments");
        }
      } catch (err: any) {
        setError(
          err.message || "An error occurred while fetching appointments"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [doctorId]);

  // Filter Appointments
  useEffect(() => {
    let result = appointments;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (appointment) =>
          (appointment.patientId?.name ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (appointment.appointmentId ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toISOString().split("T")[0];
      result = result.filter((appointment) =>
        appointment.date.startsWith(filterDate)
      );
    }

    setFilteredAppointments(result);
  }, [searchTerm, statusFilter, dateFilter, appointments]);

  // Update Pagination
  useEffect(() => {
    setPagination({
      total: filteredAppointments.length,
      page: currentPage,
      limit: itemsPerPage,
      totalPages: Math.ceil(filteredAppointments.length / itemsPerPage) || 1,
    });
  }, [currentPage, filteredAppointments.length]);

  const getCurrentPageAppointments = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAppointments.slice(startIndex, endIndex);
  };

  // Clear Date Filter
  const clearDateFilter = () => {
    setDateFilter("");
  };

  // Badge Styling
  const getStatusBadgeClass = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
      case "cancelled by Dr":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusBadgeClass = (status?: string) => {
    switch (status) {
      case "payment completed":
        return "bg-green-100 text-green-800";
      case "payment pending":
        return "bg-yellow-100 text-yellow-800";
      case "payment failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAppointmentDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Action Handlers
  const handleConfirmAppointment = async (appointmentId: string) => {
  try {
    const response = await axiosInstance.patch(`/doctor/appointments/${appointmentId}/accept`);
    if (response.data.status) {
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: 'accepted' }
            : appointment
        )
      );
      toast.success('Appointment confirmed successfully');
    } else {
      toast.error('Failed to confirm appointment: ' + (response.data.message || 'Unknown error'));
    }
  } catch (error: any) {
    console.error('Error confirming appointment:', error.message || error);
    toast.error('Error confirming appointment');
  }
};

  const handleAddPrescription = (appointmentId: string) => {
    console.log(`Adding prescription for appointment ${appointmentId}`);
    // Implement add prescription logic here
  };

  const handleContactPatient = (patientId: string, method: "call" | "chat") => {
    console.log(
      `${method === "call" ? "Calling" : "Chatting with"} patient ${patientId}`
    );
  };

  // For pending appointments
  const handleStartAppointment = (appointmentId: string) => {
    console.log(`Starting appointment ${appointmentId}`);
  };

  // New Cancel Handler for accepted appointments
  const handleCancelAppointment = (appointmentId: string) => {
    console.log(`Cancelling appointment ${appointmentId}`);
    // Implement cancellation logic here
  };

  // New Modal Openers
  const openAppointmentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalViewType("appointment");
    setShowModal(true);
  };

  const openPrescriptionModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalViewType("prescription");
    setShowModal(true);
  };

  const openPreviousReportModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalViewType("previousReport");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header with Title and Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
              <div className="relative mt-4 sm:mt-0">
                <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full sm:w-96">
                  <input
                    type="text"
                    placeholder="Search Appointments..."
                    className="flex-grow bg-transparent outline-none text-gray-700 focus:ring-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="button"
                    className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center ml-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Tabs with Date Filter */}
            <div className="mb-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-end">
              <nav
                className="-mb-px flex space-x-8 overflow-x-auto"
                aria-label="Tabs"
              >
                {[
                  "pending",
                  "accepted",
                  "completed",
                  "cancelled",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      statusFilter === status
                        ? "border-red-500 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </nav>

              {/* Date Filter */}
              <div className="flex items-center mb-2 md:mb-0 mt-2 md:mt-0 self-end">
                <div className="relative flex items-center">
                  <label
                    htmlFor="dateFilter"
                    className="mr-2 text-sm font-medium text-gray-700"
                  >
                    Date:
                  </label>
                  <input
                    type="date"
                    id="dateFilter"
                    className="border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm p-2"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  {dateFilter && (
                    <button
                      onClick={clearDateFilter}
                      className="ml-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {loading ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">{error}</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No appointments found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-red-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Patient Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getCurrentPageAppointments().map(
                        (appointment, index) => (
                          <tr
                            key={appointment._id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.appointmentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {appointment.patientId.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatAppointmentDate(appointment.date)}
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
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeClass(
                                  appointment.paymentStatus
                                )}`}
                              >
                                {appointment.paymentStatus || "N/A"}
                              </span>
                            </td>
                            {/* Info Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <CustomButton
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border border-blue-600 hover:bg-blue-50"
                                onClick={() =>
                                  openAppointmentModal(appointment)
                                }
                              >
                                <Info className="w-4 h-4" />
                              </CustomButton>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-2">
                                {appointment.status === "pending" && (
                                  <>
                                    <CustomButton
                                      variant="outline"
                                      size="sm"
                                      className="text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                                      onClick={() =>
                                        openPreviousReportModal(appointment)
                                      }
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Prev Report
                                    </CustomButton>
                                    <CustomButton
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 border border-green-600 hover:bg-green-50"
                                      onClick={() =>
                                        handleConfirmAppointment(
                                          appointment._id
                                        )
                                      }
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Confirm
                                    </CustomButton>
                                  </>
                                )}

                                {appointment.status === "accepted" && (
                                  <>
                                    <CustomButton
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-600 border border-blue-600 hover:bg-blue-50"
                                      onClick={() =>
                                        handleContactPatient(
                                          appointment.patientId._id,
                                          "chat"
                                        )
                                      }
                                    >
                                      <MessageCircle className="w-4 h-4 mr-1" />
                                      Consult
                                    </CustomButton>
                                    <CustomButton
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border border-red-600 hover:bg-red-50"
                                      onClick={() =>
                                        handleCancelAppointment(appointment._id)
                                      }
                                    >
                                      <Info className="w-4 h-4 mr-1" />
                                      Cancel
                                    </CustomButton>
                                  </>
                                )}

                                {appointment.status === "completed" &&
                                  !appointment.prescription && (
                                    <CustomButton
                                      variant="outline"
                                      size="sm"
                                      className="text-purple-600 border border-purple-600 hover:bg-purple-50"
                                      onClick={() =>
                                        handleAddPrescription(appointment._id)
                                      }
                                    >
                                      <FileText className="w-4 h-4 mr-1" />
                                      Add Prescription
                                    </CustomButton>
                                  )}

                                {appointment.status === "completed" &&
                                  appointment.prescription && (
                                    <CustomButton
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-600 border border-blue-600 hover:bg-blue-50"
                                      onClick={() =>
                                        openPrescriptionModal(appointment)
                                      }
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View Prescription
                                    </CustomButton>
                                  )}
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && !loading && filteredAppointments.length > 0 && (
              <div className="mt-6 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pagination.totalPages }).map(
                    (_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          currentPage === index + 1
                            ? "bg-red-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, pagination.totalPages)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}

            {/* Modal */}
            {showModal && selectedAppointment && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                  className="absolute inset-0 bg-black opacity-50"
                  onClick={closeModal}
                ></div>
                <div className="bg-white rounded-xl shadow-2xl z-50 max-w-lg w-full overflow-hidden">
                  {/* Header */}
                  <div className="bg-red-600 p-4">
                    <h2 className="text-white text-2xl font-bold">
                      {modalViewType === "prescription"
                        ? "Prescription Details"
                        : modalViewType === "previousReport"
                        ? "Previous Medical Records"
                        : "Appointment Details"}
                    </h2>
                  </div>
                  {/* Content */}
                  <div className="p-6 text-green-800">
                    {modalViewType === "prescription" ? (
                      <>
                        <div className="mb-3">
                          <p className="text-sm font-semibold">Patient:</p>
                          <p className="text-base">
                            {selectedAppointment.patientId.name}
                          </p>
                        </div>
                        <div className="mb-3 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-semibold">Date:</p>
                            <p className="text-base">
                              {formatAppointmentDate(selectedAppointment.date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Time:</p>
                            <p className="text-base">
                              {selectedAppointment.time}
                            </p>
                          </div>
                        </div>
                        <hr className="my-4 border-green-200" />
                        <div>
                          <p className="text-sm font-semibold">Prescription:</p>
                          <p className="text-base">
                            {selectedAppointment.prescription}
                          </p>
                        </div>
                      </>
                    ) : modalViewType === "previousReport" ? (
                      <>
                        <div className="mb-3">
                          <p className="text-sm font-semibold">Patient:</p>
                          <p className="text-base">
                            {selectedAppointment.patientId.name}
                          </p>
                        </div>
                        <div className="mb-4">
                          <p className="text-lg font-semibold">
                            Previous Medical Records:
                          </p>
                        </div>
                        {selectedAppointment.medicalRecords &&
                        selectedAppointment.medicalRecords.length > 0 ? (
                          <div className="space-y-4">
                            {selectedAppointment.medicalRecords.map(
                              (record, index) => (
                                <div
                                  key={index}
                                  className="p-3 border rounded-lg border-green-300 bg-green-50"
                                >
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-semibold">
                                        Record Date:
                                      </p>
                                      <p className="text-base">
                                        {record.recordDate
                                          ? format(
                                              new Date(record.recordDate),
                                              "dd/MM/yyyy"
                                            )
                                          : "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold">
                                        Condition:
                                      </p>
                                      <p className="text-base">
                                        {record.condition || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold">
                                        Symptoms:
                                      </p>
                                      <p className="text-base">
                                        {record.symptoms &&
                                        record.symptoms.length > 0
                                          ? record.symptoms.join(", ")
                                          : "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold">
                                        Medications:
                                      </p>
                                      <p className="text-base">
                                        {record.medications &&
                                        record.medications.length > 0
                                          ? record.medications.join(", ")
                                          : "N/A"}
                                      </p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm font-semibold">
                                        Notes:
                                      </p>
                                      <p className="text-base">
                                        {record.notes || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-base text-gray-600">
                            No previous records available.
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-semibold">ID:</p>
                            <p className="text-base">
                              {selectedAppointment.appointmentId}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Patient:</p>
                            <p className="text-base">
                              {selectedAppointment.patientId.name}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-semibold">Contact:</p>
                            <p className="text-base">
                              {selectedAppointment.patientId.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Email:</p>
                            <p className="text-base">
                              {selectedAppointment.patientId.email}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-semibold">Date:</p>
                            <p className="text-base">
                              {formatAppointmentDate(selectedAppointment.date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Time:</p>
                            <p className="text-base">
                              {selectedAppointment.time}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-semibold">Status:</p>
                            <p className="text-base">
                              {selectedAppointment.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Payment:</p>
                            <p className="text-base">
                              {selectedAppointment.paymentStatus || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm font-semibold">Reason:</p>
                          <p className="text-base">
                            {selectedAppointment.reason || "Not specified"}
                          </p>
                        </div>
                        {selectedAppointment.fees && (
                          <div className="mb-3">
                            <p className="text-sm font-semibold">Fees:</p>
                            <p className="text-base">
                              ₹{selectedAppointment.fees}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {/* Footer */}
                  <div className="p-4 border-t border-green-200 flex justify-end">
                    <CustomButton
                      variant="solid"
                      size="sm"
                      onClick={closeModal}
                    >
                      Close
                    </CustomButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsList;
