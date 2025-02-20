import React, { useEffect, useState } from "react";
import { format, addMinutes, isBefore } from "date-fns";
import axiosInstance from "../../utils/axiosInterceptors";
import AddScheduleModal from "./AddScheduleModal";
import { Sidebar } from "../common/doctorCommon/Sidebar";

interface IBreak {
  startTime: string; // ISO string
  endTime: string;
}

interface IException {
  date: string;
  isOff: boolean;
  overrideSlotDuration?: number;
}

export interface ISchedule {
  _id?: string;
  doctor: string;
  isRecurring: boolean;
  recurrenceRule: string | null;
  startTime: string;
  endTime: string;
  defaultSlotDuration: number;
  breaks: IBreak[];
  exceptions: IException[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Helper to generate time slots for a non-recurring schedule,
 * ignoring breaks and exceptions for simplicity.
 */
function generateTimeSlots(schedule: ISchedule): string[] {
  const slots: string[] = [];
  const start = new Date(schedule.startTime);
  const end = new Date(schedule.endTime);
  let current = new Date(start);
  while (isBefore(current, end)) {
    slots.push(format(current, "h:mma"));
    current = addMinutes(current, schedule.defaultSlotDuration);
  }
  return slots;
}

const DoctorScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Retrieve the doctorId from session storage.
  const doctorId = sessionStorage.getItem("doctorId");

  useEffect(() => {
    if (doctorId) {
      axiosInstance
        .get(`/doctor/schedule/${doctorId}`)
        .then((res) => {
          // Adjust data access as per your response structure.
          const fetchedSchedules = res.data.data.schedule;
          setSchedules(fetchedSchedules);
        })
        .catch((err) => {
          console.error("Error fetching schedules", err);
        });
    }
  }, [doctorId]);

  const handleScheduleAdded = (newSchedule: ISchedule) => {
    setSchedules((prev) => [...prev, newSchedule]);
  };

  return (
    <>
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div
        className={`${
          sidebarCollapsed ? "ml-20" : "ml-64"
        } p-4 md:p-8 max-w-6xl mx-auto transition-all duration-300`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">Current Schedules</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Add Schedule
          </button>
        </div>

        {/* Grid of schedule cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((sched) => {
            const times = !sched.isRecurring ? generateTimeSlots(sched) : [];
            return (
              <div key={sched._id} className="bg-white rounded-lg shadow p-4 break-words">
                <div className="mb-2">
                  <span className="font-semibold text-green-800">Schedule ID:</span>{" "}
                  {sched._id}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-green-800">Recurring:</span>{" "}
                  {sched.isRecurring ? "Yes" : "No"}
                </div>
                {sched.isRecurring && (
                  <div className="mb-2">
                    <span className="font-semibold text-green-800">
                      Recurrence Rule:
                    </span>{" "}
                    {sched.recurrenceRule}
                  </div>
                )}
                {!sched.isRecurring && (
                  <>
                    <div className="mb-2">
                      <span className="font-semibold text-green-800">Start Time:</span>{" "}
                      {format(new Date(sched.startTime), "dd MMM yyyy, h:mma")}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-green-800">End Time:</span>{" "}
                      {format(new Date(sched.endTime), "dd MMM yyyy, h:mma")}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-green-800">
                        Default Slot Duration:
                      </span>{" "}
                      {sched.defaultSlotDuration} min
                    </div>
                    {/* Display times as red pills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {times.map((time) => (
                        <div
                          key={time}
                          className="bg-red-600 text-white px-3 py-1 rounded-full"
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {/* Breaks & Exceptions (basic display) */}
                <div className="mt-3">
                  <div className="font-semibold text-green-800 mb-1">Breaks:</div>
                  {sched.breaks.map((b, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      {format(new Date(b.startTime), "h:mma")} -{" "}
                      {format(new Date(b.endTime), "h:mma")}
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="font-semibold text-green-800 mb-1">
                    Exceptions:
                  </div>
                  {sched.exceptions.map((ex, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      Date: {format(new Date(ex.date), "dd MMM yyyy")} |{" "}
                      {ex.isOff
                        ? "OFF"
                        : `Override Slot: ${ex.overrideSlotDuration || "N/A"} min`}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Schedule Modal */}
        {isModalOpen && (
          <AddScheduleModal
            onClose={() => setIsModalOpen(false)}
            onScheduleAdded={handleScheduleAdded}
          />
        )}
      </div>
    </>
  );
};

export default DoctorScheduleManagement;
