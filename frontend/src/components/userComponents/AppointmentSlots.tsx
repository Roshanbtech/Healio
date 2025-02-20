import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, startOfDay } from "date-fns";
import axiosInstance from "../../utils/axiosInterceptors";
import { Clock } from "lucide-react";

interface IAvailableSlot {
  slot: string;
  datetime: string; // ISO string
}

interface IDoctor {
  name: string;
  about: string;
  experience: number;
  fees: number;
  image: string;
  speciality: string | { name: string };
  degree?: string;
}

const Appointment: React.FC = () => {
  // Use doctor id from URL params.
  const { id } = useParams();
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState<IDoctor | null>(null);
  const [slots, setSlots] = useState<IAvailableSlot[]>([]);
  const [groupedSlots, setGroupedSlots] = useState<{ [date: string]: IAvailableSlot[] }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch doctor details.
  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/doctorDetails/${id}`);
      if (data?.doctor) {
        setDocInfo(data.doctor);
      } else {
        throw new Error("Doctor not found");
      }
    } catch (error: any) {
      console.error("Error fetching doctor details:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available slots using the user endpoint.
  const fetchAvailableSlots = async () => {
    try {
      if (id) {
        const res = await axiosInstance.get(`/schedule/${id}`);
        // Assuming response structure: { status: true, slots: [...] }
        if (res.data && res.data.slots) {
          setSlots(res.data.slots);
        } else {
          console.error("Unexpected response format:", res.data);
        }
      }
    } catch (error: any) {
      console.error("Error fetching available slots:", error);
    }
  };

  // Group slots by date (using startOfDay)
  useEffect(() => {
    const groups: { [date: string]: IAvailableSlot[] } = {};
    slots.forEach((slot) => {
      // Convert the datetime string to a Date object and then get the day start.
      const dt = new Date(slot.datetime);
      if (isNaN(dt.getTime())) {
        console.error("Invalid datetime received:", slot.datetime);
        return;
      }
      const dateKey = startOfDay(dt).toISOString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
    });
    setGroupedSlots(groups);
    // Auto-select a date if there's only one group.
    const uniqueDates = Object.keys(groups);
    if (uniqueDates.length === 1) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [slots]);

  useEffect(() => {
    fetchDoctorDetails();
    fetchAvailableSlots();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading doctor details...</div>;
  }
  if (!docInfo) {
    return <div className="text-center py-8">No doctor details found.</div>;
  }

  const { name, about, experience, fees, image, speciality, degree } = docInfo;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Doctor Details Section */}
      <div className="bg-red-600 rounded-lg p-4 sm:p-6 text-white flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
            <div className="w-48 h-48 bg-white rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={image || "/api/placeholder/128/128"}
                alt="Doctor profile"
                className="w-full h-full object-cover bg-green-100"
              />
            </div>
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-center mt-2 shadow">
              {typeof speciality === "object" ? speciality.name : speciality || "Specialist"}
            </div>
          </div>
        </div>
        <div className="flex-grow flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            {name} {degree ? `(${degree})` : ""}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Clock size={20} />
            <span className="text-sm sm:text-base">{experience || 0}+ years Exp</span>
          </div>
          <div className="mt-4">
            <h3 className="text-base sm:text-lg font-semibold mb-2">About</h3>
            <p>{about || "No description available."}</p>
          </div>
          <p className="text-white font-medium mt-4">
            Appointment Fee: <span className="text-white font-bold">{fees}</span>
          </p>
        </div>
      </div>

      {/* Available Dates Section */}
      {Object.keys(groupedSlots).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Select a Date</h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(groupedSlots).map((dateKey) => (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={`px-4 py-2 rounded ${
                  selectedDate === dateKey
                    ? "bg-red-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {format(new Date(dateKey), "dd MMM yyyy")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Available Slots for Selected Date */}
      {selectedDate && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Available Slots on {format(new Date(selectedDate), "dd MMM yyyy")}
          </h2>
          {groupedSlots[selectedDate] && groupedSlots[selectedDate].length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {groupedSlots[selectedDate].map((slotObj, index) => (
                <button
                  key={index}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  onClick={() => {
                    console.log("Selected slot:", slotObj);
                    // Integrate slot selection with your booking flow.
                  }}
                >
                  {slotObj.slot}
                </button>
              ))}
            </div>
          ) : (
            <p>No available slots found for this date.</p>
          )}
        </div>
      )}

      {/* Book Appointment Button */}
      <div className="mt-8">
        <button
          onClick={() => navigate(`/book-appointment/${id}`)}
          className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full hover:bg-white hover:text-primary hover:border-2 hover:border-primary transition-all"
        >
          Book an appointment
        </button>
      </div>
    </div>
  );
};

export default Appointment;
