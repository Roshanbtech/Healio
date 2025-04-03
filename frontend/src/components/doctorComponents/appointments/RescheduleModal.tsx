import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axiosInstance from "../../../utils/axiosInterceptors";
import { toast } from "react-toastify";
import { Appointment } from "../../../types/appointmentTypes";

const RescheduleModal: React.FC<{
  appointment: Appointment;
  onClose: () => void;
  onReschedule: (date: string, time: string, reason: string) => void;
}> = ({ onClose, onReschedule }) => {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<Array<{ slot: string; datetime: string }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const doctorId = sessionStorage.getItem("doctorId");

  useEffect(() => {
    // Set initial date to tomorrow.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const initialDate = tomorrow.toISOString().split("T")[0];
    setDate(initialDate);
    fetchSlots(initialDate);

    // Prevent body scroll while modal is open.
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Helper to get local date string in YYYY-MM-DD format.
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Formats a UTC datetime string into a local time string.
  const formatTime = (utcDateTime: string) => {
    const date = new Date(utcDateTime);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchSlots = async (selectedDate: string) => {
    if (!doctorId) {
      setSlotError("Doctor ID not available");
      setLoadingSlots(false);
      return;
    }

    setLoadingSlots(true);
    setSlotError(null);
    setTime("");

    try {
      const response = await axiosInstance.get(`/doctor/slots/${doctorId}?date=${selectedDate}`);

      if (response.data.status && Array.isArray(response.data.slots) && response.data.slots.length > 0) {
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
        setSlotError("No available slots returned");
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
    if (!date || !time || !reason.trim()) {
      toast.error("Please select a date, time, and provide a reason.");
      return;
    }

    const slotDate = new Date(time);
    if (isNaN(slotDate.getTime())) {
      toast.error("Invalid slot date");
      return;
    }
    const slotLocalDate = getLocalDateString(slotDate);
    if (slotLocalDate !== date) {
      toast.error("Selected time does not match the selected date");
      return;
    }

    // Format time in 24-hour format.
    const localTime = slotDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    onReschedule(slotLocalDate, localTime, reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn transform transition-all">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold">Reschedule Appointment</h2>
          <button onClick={onClose} className="text-white hover:text-red-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Time Slots (in your local timezone)
              </label>
              {loadingSlots ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading available slots...</p>
                </div>
              ) : slotError ? (
                <div className="text-center py-4 text-red-600 text-sm">{slotError}</div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.datetime}
                      type="button"
                      className={`p-3 text-sm border rounded-md transition-all ${
                        time === slot.datetime
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md"
                          : "border-gray-300 hover:border-red-300 hover:bg-red-50"
                      }`}
                      onClick={() => setTime(slot.datetime)}
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Reschedule
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                placeholder="Enter reason for rescheduling..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
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
                  !date || !time || !reason.trim() ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={!date || !time || !reason.trim() || loadingSlots}
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

export default RescheduleModal;
