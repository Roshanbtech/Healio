import React, { useState } from "react";
// import { format } from "date-fns";
import axiosInstance from "../../utils/axiosInterceptors";
import { ISchedule } from "../doctorComponents/Schedules";

interface IBreak {
  startTime: string;
  endTime: string;
}

interface IException {
  date: string;
  isOff: boolean;
  overrideSlotDuration?: number;
}

interface IAddScheduleModalProps {
  onClose: () => void;
  onScheduleAdded: (schedule: ISchedule) => void;
}

const AddScheduleModal: React.FC<IAddScheduleModalProps> = ({
  onClose,
  onScheduleAdded,
}) => {
  // Get doctorId from session storage (assumes it has been set)
  const doctor = sessionStorage.getItem("doctorId") || "";

  // Basic schedule states
  const [isRecurring, setIsRecurring] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [defaultSlotDuration, setDefaultSlotDuration] = useState<number>(20);
  const [breaks, setBreaks] = useState<IBreak[]>([]);
  const [exceptions, setExceptions] = useState<IException[]>([]);

  // For adding breaks
  const [breakStart, setBreakStart] = useState("");
  const [breakEnd, setBreakEnd] = useState("");

  // For adding exceptions
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionIsOff, setExceptionIsOff] = useState(false);
  const [exceptionOverride, setExceptionOverride] = useState<number | "">("");

  // Recurrence-specific states:
  // The doctor selects recurrence days and an "until" datetime.
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);
  const [recurrenceUntil, setRecurrenceUntil] = useState("");

  const daysOfWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

  const handleToggleDay = (day: string) => {
    setRecurrenceDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleAddBreak = () => {
    if (!breakStart || !breakEnd) return;
    setBreaks((prev) => [
      ...prev,
      { startTime: breakStart, endTime: breakEnd },
    ]);
    setBreakStart("");
    setBreakEnd("");
  };

  const handleAddException = () => {
    if (!exceptionDate) return;
    setExceptions((prev) => [
      ...prev,
      {
        date: exceptionDate,
        isOff: exceptionIsOff,
        overrideSlotDuration:
          exceptionOverride === "" ? undefined : Number(exceptionOverride),
      },
    ]);
    setExceptionDate("");
    setExceptionIsOff(false);
    setExceptionOverride("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRecurring) {
      if (!startTime || !recurrenceUntil || recurrenceDays.length === 0) {
        alert("Please fill in all recurrence details.");
        return;
      }
    }

    // Send extra recurrence fields to the backend;
    // the backend will generate the recurrenceRule from these.
    const scheduleData = {
      doctor,
      isRecurring,
      recurrenceRule: null, // backend will generate if recurring
      startTime: startTime ? new Date(startTime).toISOString() : "",
      endTime: endTime ? new Date(endTime).toISOString() : "",
      defaultSlotDuration,
      breaks,
      exceptions,
      // Extra fields for recurrence generation on the backend:
      recurrenceDays,
      recurrenceUntil,
    };

    try {
      const res = await axiosInstance.post("/doctor/addSchedule", scheduleData);
      console.log("API response:", res.data);
      // Assumes backend returns the saved schedule in res.data.data.result.data
      const savedSchedule = res.data.data.result.data;
      if (!savedSchedule || !savedSchedule.startTime || !savedSchedule.endTime) {
        throw new Error("Invalid schedule data returned from API");
      }
      onScheduleAdded(savedSchedule);
      onClose();
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-0 rounded-lg shadow-lg w-full max-w-2xl relative">
        {/* Header Section */}
        <div className="bg-red-600 p-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-white">Add Schedule</h2>
        </div>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white">
          {/* Recurring Toggle */}
          <div className="flex items-center gap-2">
            <label className="block font-medium text-green-800">Recurring?</label>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
          </div>

          {/* If recurring, show recurrence details */}
          {isRecurring && (
            <div className="space-y-4 border p-4 rounded bg-green-100">
              <div>
                <label className="block font-medium mb-1 text-green-800">
                  Select Recurrence Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <label key={day} className="flex items-center gap-1 text-green-800">
                      <input
                        type="checkbox"
                        checked={recurrenceDays.includes(day)}
                        onChange={() => handleToggleDay(day)}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1 text-green-800">
                  Recurrence End Date (Until)
                </label>
                <input
                  type="datetime-local"
                  className="border w-full p-2 rounded bg-green-100 text-green-800"
                  value={recurrenceUntil}
                  onChange={(e) => setRecurrenceUntil(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Start / End Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-green-800">
                {isRecurring ? "Start Time (First Occurrence)" : "Start Time"}
              </label>
              <input
                type="datetime-local"
                className="border w-full p-2 rounded bg-green-100 text-green-800"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-green-800">
                {isRecurring ? "End Time (First Occurrence)" : "End Time"}
              </label>
              <input
                type="datetime-local"
                className="border w-full p-2 rounded bg-green-100 text-green-800"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Default Slot Duration */}
          <div>
            <label className="block font-medium mb-1 text-green-800">
              Default Slot Duration (minutes)
            </label>
            <input
              type="number"
              className="border w-full p-2 rounded bg-green-100 text-green-800"
              value={defaultSlotDuration}
              onChange={(e) =>
                setDefaultSlotDuration(Number(e.target.value))
              }
              required
            />
          </div>

          {/* Breaks */}
          <div>
            <label className="block font-medium mb-1 text-green-800">Breaks</label>
            <div className="flex gap-2 mb-2">
              <input
                type="datetime-local"
                className="border p-2 rounded w-full bg-green-100 text-green-800"
                placeholder="Break Start"
                value={breakStart}
                onChange={(e) => setBreakStart(e.target.value)}
              />
              <input
                type="datetime-local"
                className="border p-2 rounded w-full bg-green-100 text-green-800"
                placeholder="Break End"
                value={breakEnd}
                onChange={(e) => setBreakEnd(e.target.value)}
              />
              <button
                type="button"
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 transition"
                onClick={handleAddBreak}
              >
                Add
              </button>
            </div>
            {breaks.length > 0 && (
              <ul className="list-disc ml-6 text-sm text-green-800">
                {breaks.map((b, idx) => (
                  <li key={idx}>
                    {b.startTime} - {b.endTime}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Exceptions */}
          <div>
            <label className="block font-medium mb-1 text-green-800">Exceptions</label>
            <div className="flex flex-col md:flex-row gap-2 mb-2">
              <input
                type="date"
                className="border p-2 rounded w-full bg-green-100 text-green-800"
                value={exceptionDate}
                onChange={(e) => setExceptionDate(e.target.value)}
              />
              <label className="flex items-center gap-1 text-green-800">
                <input
                  type="checkbox"
                  checked={exceptionIsOff}
                  onChange={(e) => setExceptionIsOff(e.target.checked)}
                />
                <span>Is Off?</span>
              </label>
              <input
                type="number"
                className="border p-2 rounded w-full bg-green-100 text-green-800"
                placeholder="Override Slot Duration"
                value={exceptionOverride}
                onChange={(e) =>
                  setExceptionOverride(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
              <button
                type="button"
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 transition"
                onClick={handleAddException}
              >
                Add
              </button>
            </div>
            {exceptions.length > 0 && (
              <ul className="list-disc ml-6 text-sm text-green-800">
                {exceptions.map((ex, idx) => (
                  <li key={idx}>
                    Date: {ex.date}, Off: {ex.isOff ? "Yes" : "No"}{" "}
                    {ex.overrideSlotDuration
                      ? `Override: ${ex.overrideSlotDuration} min`
                      : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition"
          >
            Save Schedule
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleModal;
