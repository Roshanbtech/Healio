"use client";

import React, { useEffect, useState } from "react";
import { format, addMinutes, isBefore } from "date-fns";
import {
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  Coffee,
  CalendarDays,
} from "lucide-react";
import { RRule } from "rrule";
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
 * Helper to generate time slots for a non-recurring schedule.
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

function generateRecurringSlots(
  schedule: ISchedule,
  selectedDate: Date
): string[] {
  if (!schedule.recurrenceRule) return [];
  // Parse the recurrence rule string using RRule.
  const rule = RRule.fromString(schedule.recurrenceRule);

  // Define the boundaries for the selected date.
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Check if any occurrence exists on the selected date.
  const occurrences = rule.between(startOfDay, endOfDay, true);
  if (occurrences.length === 0) return [];

  // Create occurrence start/end times by applying the original time-of-day.
  const originalStart = new Date(schedule.startTime);
  const originalEnd = new Date(schedule.endTime);

  const occurrenceStart = new Date(selectedDate);
  occurrenceStart.setHours(
    originalStart.getHours(),
    originalStart.getMinutes(),
    originalStart.getSeconds(),
    originalStart.getMilliseconds()
  );
  const occurrenceEnd = new Date(selectedDate);
  occurrenceEnd.setHours(
    originalEnd.getHours(),
    originalEnd.getMinutes(),
    originalEnd.getSeconds(),
    originalEnd.getMilliseconds()
  );

  // Generate slots between occurrenceStart and occurrenceEnd.
  const slots: string[] = [];
  let current = new Date(occurrenceStart);
  while (isBefore(current, occurrenceEnd)) {
    slots.push(format(current, "h:mma"));
    current = addMinutes(current, schedule.defaultSlotDuration);
  }
  return slots;
}

const DoctorScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Selected date for recurring schedules (default to today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
        } p-4 md:p-8 bg-white min-h-screen transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-lg">
            <div>
              <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
                <CalendarDays className="h-8 w-8" />
                Current Schedules
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your appointment schedules
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-md"
            >
              <Plus className="h-5 w-5" />
              Add Schedule
            </button>
          </div>

          {/* Date picker for recurring schedules */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">
              Select Date for Recurring Schedules:
            </label>
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {schedules.map((sched) => {
              // For non-recurring schedules, generate slots normally.
              const nonRecurringSlots = !sched.isRecurring
                ? generateTimeSlots(sched)
                : [];
              // For recurring schedules, generate slots for the selected date.
              const recurringSlots = sched.isRecurring
                ? generateRecurringSlots(sched, selectedDate)
                : [];

              return (
                <div
                  key={sched._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100"
                >
                  <div className="bg-red-600 text-white p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5" />
                      <h3 className="font-semibold">Schedule Details</h3>
                    </div>
                    <p className="text-sm opacity-90">ID: {sched._id}</p>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-lg">
                        {sched.isRecurring ? (
                          <Clock className="h-5 w-5 text-green-800" />
                        ) : (
                          <Calendar className="h-5 w-5 text-green-800" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Schedule Type</p>
                        <p className="font-semibold text-green-800">
                          {sched.isRecurring ? "Recurring" : "One-time"}
                        </p>
                      </div>
                    </div>

                    {sched.isRecurring ? (
                      <>
                        <div className="mb-4 p-4 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800">
                            Recurrence Rule:
                          </p>
                          <p className="text-gray-600">
                            {sched.recurrenceRule}
                          </p>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Slots for {format(selectedDate, "dd MMM yyyy")}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recurringSlots.length > 0 ? (
                              recurringSlots.map((time) => (
                                <div
                                  key={time}
                                  className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-sm hover:bg-red-700 transition-colors"
                                >
                                  {time}
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-600">
                                No slots available
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Start Time</p>
                            <p className="font-medium text-green-800">
                              {format(
                                new Date(sched.startTime),
                                "dd MMM yyyy, h:mma"
                              )}
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">End Time</p>
                            <p className="font-medium text-green-800">
                              {format(
                                new Date(sched.endTime),
                                "dd MMM yyyy, h:mma"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <p className="text-sm text-gray-600 mb-2">
                            Slot Duration
                          </p>
                          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block">
                            {sched.defaultSlotDuration} minutes
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {nonRecurringSlots.map((time) => (
                            <div
                              key={time}
                              className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-sm hover:bg-red-700 transition-colors"
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="mt-6 space-y-4">
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Coffee className="h-5 w-5 text-green-800" />
                          <h4 className="font-medium text-green-800">Breaks</h4>
                        </div>
                        {sched.breaks.map((b, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-gray-600 bg-green-50 p-2 rounded-md mb-2"
                          >
                            {format(new Date(b.startTime), "h:mma")} -{" "}
                            {format(new Date(b.endTime), "h:mma")}
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="h-5 w-5 text-green-800" />
                          <h4 className="font-medium text-green-800">
                            Exceptions
                          </h4>
                        </div>
                        {sched.exceptions.map((ex, idx) => (
                          <div
                            key={idx}
                            className="text-sm bg-green-50 p-3 rounded-md mb-2 space-y-1"
                          >
                            <p className="font-medium">
                              {format(new Date(ex.date), "dd MMM yyyy")}
                            </p>
                            <p className="text-gray-600">
                              {ex.isOff
                                ? "Day Off"
                                : `Modified Slot: ${
                                    ex.overrideSlotDuration || "N/A"
                                  } min`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
