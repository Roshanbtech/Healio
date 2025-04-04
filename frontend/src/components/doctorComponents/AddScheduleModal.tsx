import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInterceptors";
import { toast } from "react-toastify";
import { ISchedule } from "../doctorComponents/Schedules";

// interface IBreak {
//   startTime: string;
//   endTime: string;
// }

// interface IException {
//   date: string;
//   isOff: boolean;
//   overrideSlotDuration?: number;
// }

interface IAddScheduleModalProps {
  onClose: () => void;
  onScheduleAdded: (schedule: ISchedule) => void;
}

const AddScheduleModal: React.FC<IAddScheduleModalProps> = ({
  onClose,
  onScheduleAdded,
}) => {
  const doctor = localStorage.getItem("doctorId") || "";

  // Basic schedule states
  const [isRecurring, setIsRecurring] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [defaultSlotDuration, setDefaultSlotDuration] = useState<number>(20);
  // const [breaks, setBreaks] = useState<IBreak[]>([]);
  // const [exceptions, setExceptions] = useState<IException[]>([]);

  // For adding breaks
  // const [breakStart, setBreakStart] = useState("");
  // const [breakEnd, setBreakEnd] = useState("");

  // // For adding exceptions
  // const [exceptionDate, setExceptionDate] = useState("");
  // const [exceptionIsOff, setExceptionIsOff] = useState(false);
  // const [exceptionOverride, setExceptionOverride] = useState<number | "">("");

  // Recurrence-specific states:
  // The doctor selects recurrence days and an "until" datetime.
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);
  const [recurrenceUntil, setRecurrenceUntil] = useState("");

  const daysOfWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

  const handleToggleDay = (day: string) => {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // const handleAddBreak = () => {
  //   if (!breakStart || !breakEnd) return;
  //   setBreaks((prev) => [
  //     ...prev,
  //     { startTime: breakStart, endTime: breakEnd },
  //   ]);
  //   setBreakStart("");
  //   setBreakEnd("");
  // };

  // const handleAddException = () => {
  //   if (!exceptionDate) return;
  //   setExceptions((prev) => [
  //     ...prev,
  //     {
  //       date: exceptionDate,
  //       isOff: exceptionIsOff,
  //       overrideSlotDuration:
  //         exceptionOverride === "" ? undefined : Number(exceptionOverride),
  //     },
  //   ]);
  //   setExceptionDate("");
  //   setExceptionIsOff(false);
  //   setExceptionOverride("");
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate start and end times for the schedule.
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      toast.error("Start time must be before end time.");
      return;
    }

    // For recurring schedules, validate recurrence fields.
    if (isRecurring) {
      if (!startTime || !recurrenceUntil || recurrenceDays.length === 0) {
        toast.error("Please fill in all recurrence details.");
        return;
      }
      const recUntil = new Date(recurrenceUntil);
      if (start >= recUntil) {
        toast.error("Start time must be before the recurrence end date.");
        return;
      }
    }

    // Validate each break.
    // for (const brk of breaks) {
    //   const brkStart = new Date(brk.startTime);
    //   const brkEnd = new Date(brk.endTime);
    //   if (brkStart >= brkEnd) {
    //     toast.error("Each break's start time must be before its end time.");
    //     return;
    //   }
    //   // Ensure break is within overall schedule time.
    //   if (brkStart < start || brkEnd > end) {
    //     toast.error("Break times must be within the schedule's start and end times.");
    //     return;
    //   }
    // }

    // (Optional) Validate exceptions if needed.
    // For example, you could check if exception dates are within the schedule period.

    // Pre-check: fetch existing schedules to see if one is already active.
    try {
      const checkRes = await axiosInstance.get(`/doctor/schedule/${doctor}`);
      const existingSchedules: ISchedule[] = checkRes.data.data.schedule;
      const now = new Date();
      // Check if any active schedule exists (not expired).
      const activeSchedule = existingSchedules.find(
        (sched) => new Date(sched.endTime) > now
      );
      if (activeSchedule) {
        toast.error(
          "A schedule is already present and active. Please wait until it expires before adding a new one."
        );
        return;
      }
    } catch (error) {
      console.error("Error checking existing schedules", error);
      // Optionally, decide whether to continue if the check fails.
    }

    // Prepare schedule data; backend will generate recurrenceRule if needed.
    const scheduleData = {
      doctor,
      isRecurring,
      recurrenceRule: null, // backend will generate if recurring
      startTime: startTime ? start.toISOString() : "",
      endTime: endTime ? end.toISOString() : "",
      defaultSlotDuration,
      // breaks,
      // exceptions,
      // Extra fields for recurrence generation on the backend:
      recurrenceDays,
      recurrenceUntil,
    };

    try {
      const res = await axiosInstance.post("/doctor/schedule", scheduleData);
      console.log("API response:", res.data);
      // Assumes backend returns the saved schedule in res.data.data.result.data
      const savedSchedule = res.data.data.result.data;
      if (
        !savedSchedule ||
        !savedSchedule.startTime ||
        !savedSchedule.endTime
      ) {
        throw new Error("Invalid schedule data returned from API");
      }
      onScheduleAdded(savedSchedule);
      onClose();
      toast.success("Schedule added successfully!");
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
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
            <label className="block font-medium text-green-800">
              Recurring?
            </label>
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
                    <label
                      key={day}
                      className="flex items-center gap-1 text-green-800"
                    >
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
              onChange={(e) => setDefaultSlotDuration(Number(e.target.value))}
              required
            />
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
