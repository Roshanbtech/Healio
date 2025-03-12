import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInterceptors";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../common/doctorCommon/Sidebar";
import AppointmentFilters from "./AppointmentFilters";
import AppointmentTable from "./AppointmentTable";
import AppointmentModal from "./AppointmentModal";
import Pagination from "./Pagination";
import RescheduleModal from "./RescheduleModal";
import { Appointment } from "../../../types/appointmentTypes";

const AppointmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalViewType, setModalViewType] = useState<"appointment" | "prescription" | "previousReport">("appointment");
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);

  const itemsPerPage = 10;
  const doctorId = sessionStorage.getItem("doctorId");

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/doctor/appointments/${doctorId}`);
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
      setError(err.message || "An error occurred while fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  useEffect(() => {
    let result = appointments;
    if (searchTerm) {
      result = result.filter((appointment) =>
        (appointment.patientId?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.appointmentId ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter((appointment) => appointment.status === statusFilter);
    }
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toISOString().split("T")[0];
      result = result.filter((appointment) => appointment.date.startsWith(filterDate));
    }
    setFilteredAppointments(result);
    setCurrentPage(1); // Reset page when filters change
  }, [searchTerm, statusFilter, dateFilter, appointments]);

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
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  };

  const clearDateFilter = () => {
    setDateFilter("");
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const response = await axiosInstance.patch(`/doctor/appointments/${appointmentId}/accept`);
      if (response.data.status) {
        toast.success("Appointment confirmed successfully");
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment._id === appointmentId ? { ...appointment, status: "accepted" } : appointment
          )
        );
      } else {
        toast.error("Failed to confirm appointment: " + (response.data.message || "Unknown error"));
      }
    } catch (error: any) {
      toast.error("Error confirming appointment");
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const response = await axiosInstance.patch(`/doctor/appointments/${appointmentId}/complete`);
      if (response.data.status) {
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment._id === appointmentId ? { ...appointment, status: "completed" } : appointment
          )
        );
        toast.success("Appointment completed successfully");
      } else {
        toast.error("Failed to complete appointment: " + (response.data.message || "Unknown error"));
      }
    } catch (error: any) {
      toast.error("Error completing appointment");
    }
  };

  const handleOpenModal = (appointment: Appointment, modalType: "appointment" | "prescription" | "previousReport") => {
    setSelectedAppointment(appointment);
    setModalViewType(modalType);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const confirmReschedule = async (date: string, time: string, reason: string) => {
    if (!selectedAppointment) return;
    try {
      const response = await axiosInstance.patch(
        `/doctor/appointments/${selectedAppointment._id}/reschedule`,
        { date, time, reason }
      );
      if (response.data.status) {
        const updatedAppointment = { ...selectedAppointment, date, time };
        setAppointments((prev) =>
          prev.map((appt) => (appt._id === selectedAppointment._id ? updatedAppointment : appt))
        );
        fetchAppointments();
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        toast.success("Appointment rescheduled successfully");
      } else {
        toast.error("Failed to reschedule: " + (response.data.message || "Unknown error"));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error rescheduling appointment";
      toast.error(errorMessage);
    }
  };

  const handleConsult = (appointment: Appointment) => {
    navigate("/doctor/chats");
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <AppointmentFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              clearDateFilter={clearDateFilter}
            />
            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No appointments found</div>
            ) : (
              <>
                <AppointmentTable
                  appointments={getCurrentPageAppointments()}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onConfirmAppointment={handleConfirmAppointment}
                  onCompleteAppointment={handleCompleteAppointment}
                  onReschedule={handleReschedule}
                  onOpenModal={handleOpenModal}
                  onConsult={handleConsult}
                />
                {pagination && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {showModal && selectedAppointment && (
        <AppointmentModal appointment={selectedAppointment} modalViewType={modalViewType} onClose={closeModal} />
      )}
      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={() => setShowRescheduleModal(false)}
          onReschedule={confirmReschedule}
        />
      )}
    </div>
  );
};

export default AppointmentsList;
