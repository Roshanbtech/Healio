// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { format, startOfDay } from "date-fns";
// import axiosInstance from "../../utils/axiosInterceptors";
// import { Clock, CheckCircle } from "lucide-react";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// interface IAvailableSlot {
//   slot: string;
//   datetime: string;
// }

// interface IDoctor {
//   name: string;
//   about: string;
//   experience: number;
//   fees: number;
//   image: string;
//   speciality: string | { name: string };
//   degree?: string;
// }

// interface IAppointment {
//   _id: string;
//   appointmentId: string;
//   patientId: string;
//   doctorId: string;
//   date: string;
//   time: string;
//   status: string;
//   fees: number;
//   paymentMethod: string;
//   paymentStatus: string;
//   prescription: any;
//   couponCode: string;
//   couponDiscount: string;
//   isApplied: boolean;
//   medicalRecords: any[];
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
//   razorpay_order_id?: string;
//   razorpay_payment_id?: string;
//   razorpay_signature?: string;
// }

// const Appointment: React.FC = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [docInfo, setDocInfo] = useState<IDoctor | null>(null);
//   const [slots, setSlots] = useState<IAvailableSlot[]>([]);
//   const [groupedSlots, setGroupedSlots] = useState<{
//     [date: string]: IAvailableSlot[];
//   }>({});
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [selectedTime, setSelectedTime] = useState<IAvailableSlot | null>(null);
//   const [bookedAppointments, setBookedAppointments] = useState<IAppointment[]>(
//     []
//   );

//   const sliderSettings = {
//     dots: false,
//     infinite: false,
//     speed: 500,
//     slidesToShow: 4,
//     slidesToScroll: 1,
//     responsive: [
//       { breakpoint: 1024, settings: { slidesToShow: 3 } },
//       { breakpoint: 768, settings: { slidesToShow: 2 } },
//       { breakpoint: 480, settings: { slidesToShow: 1 } },
//     ],
//   };

//   const fetchDoctorDetails = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axiosInstance.get(`/doctorDetails/${id}`);
//       if (data?.doctor) {
//         setDocInfo(data.doctor);
//       } else {
//         throw new Error("Doctor not found");
//       }
//     } catch (error) {
//       console.error("Error fetching doctor details:", error);
//       navigate("/");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAvailableSlots = async () => {
//     try {
//       if (id) {
//         const res = await axiosInstance.get(`/schedule/${id}`);
//         if (res.data?.slots) {
//           setSlots(res.data.slots);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching slots:", error);
//     }
//   };

//   const fetchDoctorAppointmentSlots = async () => {
//     try {
//       if (id) {
//         const res = await axiosInstance.get(`/appointments/doctor/${id}`);
//         if (res.data?.docAppointment) {
//           setBookedAppointments(res.data.docAppointment);
//         }
//       }
//     } catch (error) {
//       console.log("Error fetching doctor appointment slots:", error);
//     }
//   };

//   useEffect(() => {
//     const groups: { [date: string]: IAvailableSlot[] } = {};
//     slots.forEach((slot) => {
//       const dt = new Date(slot.datetime);
//       if (isNaN(dt.getTime())) return;
//       const dateKey = startOfDay(dt).toISOString();
//       groups[dateKey] = [...(groups[dateKey] || []), slot];
//     });
//     setGroupedSlots(groups);
//     if (Object.keys(groups).length === 1) {
//       setSelectedDate(Object.keys(groups)[0]);
//     }
//   }, [slots]);

//   useEffect(() => {
//     fetchDoctorDetails();
//     fetchAvailableSlots();
//     fetchDoctorAppointmentSlots();
//   }, [id]);

//   if (loading) return <div className="text-center py-8">Loading...</div>;
//   if (!docInfo) return <div className="text-center py-8">Doctor not found</div>;

//   const { name, about, experience, fees, image, speciality, degree } = docInfo;

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       <div className="bg-red-600 rounded-xl p-4 text-white flex flex-col md:flex-row gap-6 shadow-2xl">
//         <div className="flex-shrink-0">
//           <div className="relative bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
//             <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg items-center">
//               <img
//                 src={image || "/default-avatar.png"}
//                 alt={name || "Doctor profile"}
//                 className="w-full h-full object-cover bg-green-100"
//               />
//             </div>
//             <div className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-center font-bold shadow-md">
//               {typeof speciality === "object"
//                 ? speciality.name
//                 : speciality || "Specialist"}
//             </div>
//             {/* VERIFIED Badge */}
//             <div className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow">
//               <CheckCircle className="w-4 h-4 text-green-600" />
//               <span className="text-xs font-bold text-green-600">VERIFIED</span>
//             </div>
//           </div>
//         </div>

//         {/* Doctor Details */}
//         <div className="flex-grow flex flex-col justify-center">
//           <h1 className="text-xl sm:text-2xl font-bold">
//             {name} {degree ? `(${degree})` : ""}
//           </h1>
//           <div className="flex items-center gap-2 mt-2">
//             <Clock size={20} />
//             <span className="text-sm sm:text-base">
//               {experience || 0}+ years Exp
//             </span>
//           </div>
//           <div className="mt-4">
//             <h3 className="text-base sm:text-lg font-semibold mb-2">About</h3>
//             <p>{about || "No description available."}</p>
//           </div>
//           <div className="mt-4 p-3 bg-white/10 rounded-lg">
//             <span className="text-base font-semibold">Consultation Fee: </span>
//             <span className="text-xl font-bold">₹{fees ?? 0}</span>
//           </div>
//         </div>
//       </div>

//       {/* Date Slider */}
//       {Object.keys(groupedSlots).filter(
//         (dateKey) => new Date(dateKey) >= startOfDay(new Date())
//       ).length > 0 && (
//         <div className="mt-8 bg-white rounded-xl p-4 shadow-xl">
//           <h2 className="text-xl font-bold mb-4 text-green-800">Select Date</h2>
//           <Slider {...sliderSettings}>
//             {Object.keys(groupedSlots)
//               .filter((dateKey) => new Date(dateKey) >= startOfDay(new Date()))
//               .map((dateKey) => (
//                 <div key={dateKey} className="px-2">
//                   <button
//                     onClick={() => setSelectedDate(dateKey)}
//                     className={`w-full py-2 rounded-xl transition-all ${
//                       selectedDate === dateKey
//                         ? "bg-red-600 text-white"
//                         : "bg-green-100 hover:bg-gray-200"
//                     }`}
//                   >
//                     <div className="text-xs font-semibold">
//                       {format(new Date(dateKey), "EEE")}
//                     </div>
//                     <div className="text-xl font-bold">
//                       {format(new Date(dateKey), "dd")}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {format(new Date(dateKey), "MMM yyyy")}
//                     </div>
//                   </button>
//                 </div>
//               ))}
//           </Slider>
//         </div>
//       )}

//       {/* Time Slot Grid */}
//       {selectedDate && new Date(selectedDate) >= startOfDay(new Date()) && (
//   <div className="mt-8 bg-white rounded-xl p-4 shadow-xl">
//     <h2 className="text-xl font-bold mb-4 text-green-800">
//       {format(new Date(selectedDate), "EEEE, d MMMM yyyy")}
//     </h2>
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//       {groupedSlots[selectedDate]
//         ?.filter((slot) => new Date(slot.datetime) >= new Date())
//         .map((slot, index) => {
//           const isBooked = bookedAppointments.some((appointment) => {
//             const appointmentDate = new Date(appointment.date);
//             const slotDate = new Date(slot.datetime);
//             return (
//               startOfDay(appointmentDate).toISOString() ===
//               startOfDay(slotDate).toISOString() &&
//               appointment.time.trim() === slot.slot.trim()
//             );
//           });
//           return (
//             <button
//               key={index}
//               onClick={() => setSelectedTime(slot)}
//               disabled={isBooked}
//               className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
//                 isBooked
//                   ? "bg-green-100 text-gray-800 cursor-not-allowed"
//                   : selectedTime?.slot === slot.slot
//                   ? "bg-red-600 text-white"
//                   : "bg-green-100 text-gray-800"
//               }`}
//             >
//               <span>{format(new Date(slot.datetime), "hh:mm a")}</span>
//               {isBooked && (
//                 <span className="ml-2 text-xs text-red-500 bg-red-100 rounded-full px-2">
//                   Booked
//                 </span>
//               )}
//             </button>
//           );
//         })}
//     </div>
//   </div>
// )}


//       {/* Book Appointment Button */}
//       <div className="mt-8 text-center">
//         {selectedDate && selectedTime && (
//           <button
//             onClick={() => {
//               window.scrollTo(0, 0);
//               navigate(`/book-appointment/${id}`, {
//                 state: { selectedDate, selectedTime },
//               });
//             }}
//             className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-xl"
//           >
//             Book Appointment Now
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Appointment;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, startOfDay } from "date-fns";
import axiosInstance from "../../utils/axiosInterceptors";
import { Clock, CheckCircle } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface IAvailableSlot {
  slot: string;
  datetime: string;
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

interface IAppointment {
  _id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
  fees: number;
  paymentMethod: string;
  paymentStatus: string;
  prescription: any;
  couponCode: string;
  couponDiscount: string;
  isApplied: boolean;
  medicalRecords: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

const Appointment: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [docInfo, setDocInfo] = useState<IDoctor | null>(null);
  const [slots, setSlots] = useState<IAvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<IAvailableSlot | null>(null);
  const [bookedAppointments, setBookedAppointments] = useState<IAppointment[]>([]);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/doctorDetails/${id}`);
      if (data?.doctor) {
        setDocInfo(data.doctor);
      } else {
        throw new Error("Doctor not found");
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      if (id) {
        const res = await axiosInstance.get(`/schedule/${id}`);
        if (res.data?.slots) {
          setSlots(res.data.slots);
        }
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const fetchDoctorAppointmentSlots = async () => {
    try {
      if (id) {
        const res = await axiosInstance.get(`/appointments/doctor/${id}`);
        if (res.data?.docAppointment) {
          setBookedAppointments(res.data.docAppointment);
        }
      }
    } catch (error) {
      console.log("Error fetching doctor appointment slots:", error);
    }
  };

  // Derive a list of unique dates from fetched slots (in ISO string format of startOfDay)
  const availableDates: string[] = Array.from(
    new Set(
      slots.map((slot) =>
        startOfDay(new Date(slot.datetime)).toISOString()
      )
    )
  ).sort();

  // Set default selected date if only one available date exists
  useEffect(() => {
    if (!selectedDate && availableDates.length === 1) {
      setSelectedDate(availableDates[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableDates]);

  useEffect(() => {
    fetchDoctorDetails();
    fetchAvailableSlots();
    fetchDoctorAppointmentSlots();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!docInfo) return <div className="text-center py-8">Doctor not found</div>;

  const { name, about, experience, fees, image, speciality, degree } = docInfo;

  // Filter slots for the selected date
  const filteredSlots = slots.filter((slot) => {
    const slotDay = startOfDay(new Date(slot.datetime)).toISOString();
    if (selectedDate !== slotDay) return false;

    // If the selected date is today, filter out past slots.
    const today = startOfDay(new Date()).toISOString();
    if (selectedDate === today) {
      return new Date(slot.datetime) >= new Date();
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-red-600 rounded-xl p-4 text-white flex flex-col md:flex-row gap-6 shadow-2xl">
        <div className="flex-shrink-0">
          <div className="relative bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg items-center">
              <img
                src={image || "/default-avatar.png"}
                alt={name || "Doctor profile"}
                className="w-full h-full object-cover bg-green-100"
              />
            </div>
            <div className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-center font-bold shadow-md">
              {typeof speciality === "object" ? speciality.name : speciality || "Specialist"}
            </div>
            {/* VERIFIED Badge */}
            <div className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-600">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Doctor Details */}
        <div className="flex-grow flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            {name} {degree ? `(${degree})` : ""}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Clock size={20} />
            <span className="text-sm sm:text-base">
              {experience || 0}+ years Exp
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-base sm:text-lg font-semibold mb-2">About</h3>
            <p>{about || "No description available."}</p>
          </div>
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <span className="text-base font-semibold">Consultation Fee: </span>
            <span className="text-xl font-bold">₹{fees ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Date Slider */}
      {availableDates.filter(
        (dateKey) => new Date(dateKey) >= startOfDay(new Date())
      ).length > 0 && (
        <div className="mt-8 bg-white rounded-xl p-4 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-green-800">Select Date</h2>
          <Slider {...sliderSettings}>
            {availableDates
              .filter((dateKey) => new Date(dateKey) >= startOfDay(new Date()))
              .map((dateKey) => (
                <div key={dateKey} className="px-2">
                  <button
                    onClick={() => setSelectedDate(dateKey)}
                    className={`w-full py-2 rounded-xl transition-all ${
                      selectedDate === dateKey
                        ? "bg-red-600 text-white"
                        : "bg-green-100 hover:bg-gray-200"
                    }`}
                  >
                    <div className="text-xs font-semibold">
                      {format(new Date(dateKey), "EEE")}
                    </div>
                    <div className="text-xl font-bold">
                      {format(new Date(dateKey), "dd")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(dateKey), "MMM yyyy")}
                    </div>
                  </button>
                </div>
              ))}
          </Slider>
        </div>
      )}

      {/* Time Slot Grid */}
      {selectedDate && new Date(selectedDate) >= startOfDay(new Date()) && (
        <div className="mt-8 bg-white rounded-xl p-4 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-green-800">
            {format(new Date(selectedDate), "EEEE, d MMMM yyyy")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredSlots.map((slot, index) => {
              const isBooked = bookedAppointments.some((appointment) => {
                const appointmentDate = new Date(appointment.date);
                const slotDate = new Date(slot.datetime);
                return (
                  startOfDay(appointmentDate).toISOString() ===
                    startOfDay(slotDate).toISOString() &&
                  appointment.time.trim() === slot.slot.trim()
                );
              });
              return (
                <button
                  key={index}
                  onClick={() => setSelectedTime(slot)}
                  disabled={isBooked}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                    isBooked
                      ? "bg-green-100 text-gray-800 cursor-not-allowed"
                      : selectedTime?.slot === slot.slot
                      ? "bg-red-600 text-white"
                      : "bg-green-100 text-gray-800"
                  }`}
                >
                  <span>{format(new Date(slot.datetime), "hh:mm a")}</span>
                  {isBooked && (
                    <span className="ml-2 text-xs text-red-500 bg-red-100 rounded-full px-2">
                      Booked
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Book Appointment Button */}
      <div className="mt-8 text-center">
        {selectedDate && selectedTime && (
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate(`/book-appointment/${id}`, {
                state: { selectedDate, selectedTime },
              });
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-xl"
          >
            Book Appointment Now
          </button>
        )}
      </div>
    </div>
  );
};

export default Appointment;
