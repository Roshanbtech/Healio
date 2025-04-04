"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/userCommon/Sidebar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ReviewModal from "./ReviewModal";
import PrescriptionModal from "./PrescriptionModal";
import { verifyAppointment } from "../../services/appointment";
import { assets } from "../../assets/assets";
import { signedUrltoNormalUrl } from "../../utils/getUrl";

export interface IAppointment {
  _id: string;
  appointmentId: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    age?: number;
    gender?: string;
  };
  doctorId: {
    [x: string]: string | { _id: string; name: string } | undefined;
    _id: string;
    name: string;
    email: string;
    speciality: { _id: string; name: string };
    image?: string;
    profileImage?: string;
  };
  date: string;
  time: string;
  status: "pending" | "accepted" | "completed" | "cancelled" | "failed";
  reason?: string;
  fees?: number;
  paymentMethod?: "razorpay";
  paymentStatus?:
    | "payment pending"
    | "payment completed"
    | "payment failed"
    | "refunded"
    | "anonymous";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  prescription?: string | null;
  review?: {
    rating?: number;
    description?: string;
  };
  medicalRecords?: {
    recordDate?: string;
    condition?: string;
    symptoms?: string[];
    medications?: string[];
    notes?: string;
  }[];
  couponCode?: string;
  couponDiscount?: string;
  isApplied?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PrescriptionData {
  _id?: string | { $oid?: string };
  diagnosis: string;
  medicines: any[];
  labTests?: string[];
  advice?: string;
  followUpDate?: string | { $date?: string };
  doctorNotes?: string;
  signature?: string;
  createdAt?: string | { $date?: string };
  updatedAt?: string | { $date?: string };
  doctor: {
    name: string;
    speciality: string;
    phone?: string;
    email?: string;
  };
  patient: {
    name: string;
    age: number;
    gender: string;
    phone?: string;
    email?: string;
    address?: string;
    dateOfBirth?: string;
  };
}

interface OrderData {
  amount: number;
  currency: string;
  id: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// interface SuccessData {
//   transactionId: string;
//   amount: string;
//   date: string;
//   patientName: string;
//   email: string;
//   address: string;
//   doctorName?: string;
//   appointmentTime?: string;
//   healioLogo: string;
// }

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

const RescheduleModal: React.FC<{
  appointment: IAppointment;
  onClose: () => void;
  onReschedule: (date: string, time: string) => void;
}> = ({ appointment, onClose, onReschedule }) => {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<
    Array<{
      slot: string;
      datetime: string;
    }>
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const doctorId = appointment.doctorId._id;
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const initialDate = tomorrow.toISOString().split("T")[0];
    setDate(initialDate);
    fetchSlots(initialDate);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const formatTime = (utcDateTime: string) => {
    const date = new Date(utcDateTime);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const fetchSlots = async (selectedDate: string) => {
    if (!doctorId) return;
    setLoadingSlots(true);
    setSlotError(null);
    setTime("");
    try {
      const response = await axiosInstance.get(
        `/schedule/${doctorId}?date=${selectedDate}`
      );
      if (response.data.status && response.data.slots?.length > 0) {
        const filteredSlots = response.data.slots.filter((slot: any) => {
          const slotDate = new Date(slot.datetime);
          const slotLocalDate = getLocalDateString(slotDate);
          return slotLocalDate === selectedDate;
        });
        if (filteredSlots.length > 0) {
          setAvailableSlots(filteredSlots);
        } else {
          setAvailableSlots([]);
          setSlotError("No available slots for this date");
        }
      } else {
        setAvailableSlots([]);
        setSlotError("No available slots for this date");
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlotError("Failed to load available slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    fetchSlots(newDate);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time) {
      const selectedSlot = availableSlots.find((slot) => slot.slot === time);
      if (!selectedSlot) {
        toast.error("Invalid time selection");
        return;
      }
      const slotDate = new Date(selectedSlot.datetime);
      const isoDate = slotDate.toISOString().split("T")[0];
      const isoTime = `${String(slotDate.getUTCHours()).padStart(
        2,
        "0"
      )}:${String(slotDate.getUTCMinutes()).padStart(2, "0")}`;
      onReschedule(isoDate, isoTime);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn transform transition-all">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold">
            Reschedule Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={date}
                onChange={handleDateChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Time Slots
              </label>
              {loadingSlots ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    Loading available slots...
                  </p>
                </div>
              ) : slotError ? (
                <div className="text-center py-4 text-red-600 text-sm">
                  {slotError}
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.datetime}
                      type="button"
                      className={`p-3 text-sm border rounded-md transition-all ${
                        time === slot.slot
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md"
                          : "border-gray-300 hover:border-red-300 hover:bg-red-50"
                      }`}
                      onClick={() => setTime(slot.slot)}
                    >
                      {formatTime(slot.datetime)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No slots available for selected date
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-md ${
                  !date || !time ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={!date || !time || loadingSlots}
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const MedicalReportsModal: React.FC<{
  appointment: IAppointment;
  onClose: () => void;
  onSubmit: (data: {
    recordDate: string;
    condition: string;
    symptoms: string;
    medications: string;
    notes: string;
  }) => void;
}> = ({ onClose, onSubmit }) => {
  const [recordDate, setRecordDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [condition, setCondition] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [medications, setMedications] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (condition.trim() === "") {
      toast.error("Condition is required");
      return;
    }
    onSubmit({ recordDate, condition, symptoms, medications, notes });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn transform transition-all">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold">
            Submit Medical Report
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Date
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g. Hypertension"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms (comma separated)
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. headache, dizziness"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medications (comma separated)
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="e.g. Atenolol, Lisinopril"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any extra details..."
                rows={3}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-md"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AppointmentDetailsModal: React.FC<{
  appointment: IAppointment;
  onClose: () => void;
}> = ({ appointment, onClose }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-60"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-fadeIn">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 flex justify-between items-center">
          <h2 className="text-white text-xl font-bold">Appointment Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border-l-4 border-red-600">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Appointment ID:
                </p>
                <p className="text-base font-medium">
                  {appointment.appointmentId}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Status:</p>
                <p className="text-base font-medium">{appointment.status}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-3 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-red-50 p-2 rounded-full mr-3">
                <User className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Doctor</p>
                <p className="text-base">{appointment.doctorId.name}</p>
              </div>
            </div>
            <div className="flex items-center p-3 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-red-50 p-2 rounded-full mr-3">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Date & Time
                </p>
                <p className="text-base">
                  {formatDate(appointment.date)} at {appointment.time}
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-red-50 p-2 rounded-full mr-3">
                <span className="flex items-center justify-center w-5 h-5 text-red-600 font-bold">
                  ₹
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Payment Status
                </p>
                <p className="text-base">
                  {appointment.paymentStatus || "N/A"}{" "}
                  {appointment.fees ? `(₹${appointment.fees})` : ""}
                </p>
              </div>
            </div>
            {appointment.reason && (
              <div className="p-3 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  Reason for Visit
                </p>
                <p className="text-base">{appointment.reason}</p>
              </div>
            )}
            <div className="p-3 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-gray-500 mb-1">
                Speciality
              </p>
              <p className="text-base">
                {appointment.doctorId.speciality.name}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-md"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const UserAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [showRescheduleModal, setShowRescheduleModal] =
    useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<IAppointment | null>(null);
  const [showMedicalModal, setShowMedicalModal] = useState<boolean>(false);
  const [selectedMedicalAppointment, setSelectedMedicalAppointment] =
    useState<IAppointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [selectedReviewAppointment, setSelectedReviewAppointment] =
    useState<IAppointment | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] =
    useState<boolean>(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  // const [paymentBreakdown, setPaymentBreakdown] = useState<{ payable: number }>(
  //   { payable: 0 }
  // );
  const [selectedTime] = useState<{ slot: string } | null>(
    null
  );
  const [docInfo] = useState<{ name?: string } | null>(null);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/appointments/${userId}`);
        if (response.data.status) {
          setAppointments(response.data.appointments);
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
    if (userId) {
      fetchAppointments();
    } else {
      setError("User not found");
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    axiosInstance.get(`/profile/${userId}`).then((response) => {
      if (response.data?.user) setUserProfile(response.data.user);
    });
  }, [userId]);

  const filteredAppointments = appointments.filter(
    (appointment) => appointment.status === statusFilter
  );
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const currentAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await axiosInstance.patch(`/appointments/${appointmentId}/cancel`);
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: "cancelled" } : appt
        )
      );
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Error cancelling appointment");
    }
  };

  // const handleReschedule = (appointment: IAppointment) => {
  //   setSelectedAppointment(appointment);
  //   setShowRescheduleModal(true);
  // };

  const confirmReschedule = async (date: string, time: string) => {
    if (!selectedAppointment) return;
    try {
      await axiosInstance.put(
        `/appointments/reschedule/${selectedAppointment._id}`,
        { date, time }
      );
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === selectedAppointment._id ? { ...appt, date, time } : appt
        )
      );
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      toast.success("Appointment rescheduled successfully");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Error rescheduling appointment");
    }
  };

  const handleMedicalReports = (appointment: IAppointment) => {
    setSelectedMedicalAppointment(appointment);
    setShowMedicalModal(true);
  };

  const confirmMedicalReport = async (reportData: {
    recordDate: string;
    condition: string;
    symptoms: string;
    medications: string;
    notes: string;
  }) => {
    if (!selectedMedicalAppointment) return;
    try {
      await axiosInstance.patch(
        `/appointments/${selectedMedicalAppointment._id}/medical-records`,
        reportData
      );
      setShowMedicalModal(false);
      setSelectedMedicalAppointment(null);
      toast.success("Medical report submitted successfully");
    } catch (error) {
      console.error("Error submitting medical report:", error);
      toast.error("Error submitting medical report");
    }
  };

  const handleReview = (appointment: IAppointment) => {
    setSelectedReviewAppointment(appointment);
    setShowReviewModal(true);
  };

  const confirmReview = async (rating: number, description: string) => {
    if (!selectedReviewAppointment) return;
    try {
      const { data } = await axiosInstance.patch(
        `/appointments/${selectedReviewAppointment._id}/review`,
        { rating, description }
      );
      if (data.status) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === selectedReviewAppointment._id
              ? { ...appt, review: { rating, description } }
              : appt
          )
        );
        setShowReviewModal(false);
        setSelectedReviewAppointment(null);
        toast.success(data.message || "Review submitted successfully");
        return Promise.resolve();
      } else {
        toast.error(data.message || "Error submitting review");
        return Promise.reject(new Error(data.message));
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Error submitting review");
      return Promise.reject(error);
    }
  };

  const handleViewDetails = (appointment: IAppointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleViewPrescription = (appointment: IAppointment) => {
    if (!appointment.prescription) return;
    if (typeof appointment.prescription !== "object") return;
    const prescriptionObject = appointment.prescription as PrescriptionData;
    const prescriptionData: PrescriptionData = {
      ...prescriptionObject,
      doctor: {
        name: appointment.doctorId.name,
        speciality: appointment.doctorId.speciality?.name || "",
        phone: typeof appointment.doctorId.phone === 'string' ? appointment.doctorId.phone : "",
        email: appointment.doctorId.email || "",
      },
      patient: {
        name: appointment.patientId?.name || "",
        age: appointment.patientId?.age || 0,
        gender: appointment.patientId?.gender || "",
        phone: appointment.patientId?.phone || "",
        email: appointment.patientId?.email || "",
      },
    };
    setSelectedPrescription(prescriptionData);
    setShowPrescriptionModal(true);
  };

  const routeData = {
    patientId: localStorage.getItem("userId"),
  };

  const openRazorpay = (orderData: OrderData, doctorName: string) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded. Please try again.");
      return;
    }
    const options: RazorpayOptions = {
      key: import.meta.env.VITE_PAYMENT_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "HEALIO",
      description: `Payment for appointment with Dr. ${doctorName}`,
      order_id: orderData.id,
      handler: async function (response: RazorpayResponse) {
        const verify = await verifyAppointment(response, routeData);
        if (verify.status) {
          toast.success("Payment successful!");
          const successData = {
            transactionId: response.razorpay_payment_id,
            amount: verify.fees,
            date: new Date().toLocaleString(),
            patientName: userProfile?.name || "John Doe",
            email: userProfile?.email || "john.doe@example.com",
            address: userProfile?.address || "123 Main Street, City",
            doctorName: docInfo?.name,
            appointmentTime: selectedTime?.slot,
            healioLogo: assets.logo,
          };
          localStorage.removeItem("bookingId");
          navigate("/success", { state: successData });
        }
      },
      prefill: {
        name: userProfile?.name || "John Doe",
        email: userProfile?.email || "john.doe@example.com",
      },
      theme: {
        color: "#dc2626",
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleRetryPayment = async (bookingId: string, doctorName: string) => {
    try {
      localStorage.setItem("bookingId", bookingId);
      const response = await axiosInstance.post(`/retryPayment/${bookingId}`);
      if (response.data.status) {
        const order: OrderData = response.data.appointment;
        openRazorpay(order, doctorName);
      } else {
        toast.error("Failed to initiate retry payment. Please try again.");
      }
    } catch (error) {
      console.error("Retry Payment Error:", error);
      toast.error("An error occurred during retry payment.");
    }
  };

  const statusTabs = [
    { id: "pending", label: "Pending" },
    { id: "accepted", label: "Accepted" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "failed", label: "Failed" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transition-shadow hover:shadow-xl border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
                My Appointments
              </h1>
              <button
                className="sm:hidden p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-100">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-all ${
                      statusFilter === tab.id
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <div className="text-xl font-semibold text-gray-800 mb-2">
                Error Loading Appointments
              </div>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : currentAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <div className="text-xl font-semibold text-gray-800 mb-2">
                No Appointments Found
              </div>
              <p className="text-gray-600">
                You don't have any {statusFilter} appointments at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="sm:flex items-center p-6 bg-gradient-to-r from-red-600 to-red-700">
                    <div className="sm:flex-shrink-0 mb-4 sm:mb-0">
                      <div className="h-20 w-20 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-white mx-auto sm:mx-0 shadow-lg">
                        {appointment.doctorId.image ||
                        appointment.doctorId.profileImage ? (
                          <img
                            src={signedUrltoNormalUrl(
                              appointment.doctorId.image ||
                                appointment.doctorId.profileImage ||
                                ''
                            )}
                            alt={appointment.doctorId.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-gray-500" />
                        )}
                      </div>
                    </div>
                    <div className="sm:ml-6 flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white">
                          {appointment.doctorId.name}
                        </h2>
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                            appointment.status
                          )} shadow-sm`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-white mb-2">
                        {appointment.doctorId.speciality?.name || "N/A"}
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                        <div className="flex items-center text-sm text-white bg-red-500 bg-opacity-30 px-3 py-1 rounded-full">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(appointment.date)}
                        </div>
                        <div className="flex items-center text-sm text-white bg-red-500 bg-opacity-30 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4 mr-2" />
                          {appointment.time}
                        </div>
                        {appointment.fees && (
                          <div className="flex items-center text-sm text-white bg-red-500 bg-opacity-30 px-3 py-1 rounded-full">
                            <span className="mr-1 text-lg">₹</span>
                            {appointment.fees}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-end gap-3">
                    {appointment.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleCancel(appointment._id)}
                          className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-all text-sm font-medium shadow-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleMedicalReports(appointment)}
                          className="px-4 py-2 border border-yellow-600 text-yellow-600 rounded-md hover:bg-yellow-50 transition-all text-sm font-medium shadow-sm"
                        >
                          Medical Reports
                        </button>
                      </>
                    )}
                    {appointment.status === "accepted" && (
                      <>
                        <button
                          onClick={() => {
                            navigate("/chats");
                            window.scrollTo({
                              top: 0,
                              left: 0,
                              behavior: "smooth",
                            });
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Consult
                        </button>
                      </>
                    )}
                    {appointment.status === "completed" && (
                      <>
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          View Details
                        </button>
                        <button
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium"
                          onClick={() => handleReview(appointment)}
                        >
                          {appointment.review?.rating
                            ? "Edit Review"
                            : "Add Review"}
                        </button>
                        {appointment.prescription && (
                          <button
                            onClick={() => handleViewPrescription(appointment)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            View Prescription
                          </button>
                        )}
                      </>
                    )}
                    {appointment.status === "failed" && (
                      <button
                        onClick={() =>
                          handleRetryPayment(
                            appointment.appointmentId,
                            appointment.doctorId?.name || "Doctor"
                          )
                        }
                        className="px-4 py-2 bg-gray-600 text-white rounded-md transition-colors text-sm font-medium"
                      >
                        Retry Payment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === index + 1
                        ? "bg-red-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
          }}
          onReschedule={confirmReschedule}
        />
      )}
      {showMedicalModal && selectedMedicalAppointment && (
        <MedicalReportsModal
          appointment={selectedMedicalAppointment}
          onClose={() => {
            setShowMedicalModal(false);
            setSelectedMedicalAppointment(null);
          }}
          onSubmit={confirmMedicalReport}
        />
      )}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
      {showReviewModal && selectedReviewAppointment && (
        <ReviewModal
          appointment={selectedReviewAppointment}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedReviewAppointment(null);
          }}
          onSubmit={confirmReview}
        />
      )}
      {showPrescriptionModal && selectedPrescription && (
        <PrescriptionModal
          prescription={selectedPrescription}
          onClose={() => {
            setShowPrescriptionModal(false);
            setSelectedPrescription(null);
          }}
        />
      )}
    </div>
  );
};

export default UserAppointments;
