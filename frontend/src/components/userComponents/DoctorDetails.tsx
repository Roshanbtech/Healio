import React, { useEffect, useState } from "react";
import {
  Clock,
  Award,
  GraduationCap,
  Building2,
  Info,
  Star,
} from "lucide-react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInterceptors";
import { useNavigate } from "react-router-dom";
import RelatedDoctors from "../../components/common/userCommon/RelatedDoctors";

const DoctorDetails: React.FC = ({}) => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await axiosInstance.get(`/doctorDetails/${id}`);
        setDoctor(response.data?.doctor);
      } catch (err: any) {
        setError(err.message || "Failed to fetch doctor details");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading)
    return <div className="text-center py-8">Loading doctor details...</div>;
  if (error)
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  if (!doctor)
    return <div className="text-center py-8">No doctor details available.</div>;

  const {
    name,
    about,
    experience,
    fees,
    image,
    speciality,
    degree,
    hospital,
    achievements,
  } = doctor;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-red-600 rounded-lg p-4 sm:p-6 text-white relative flex flex-col md:flex-row gap-6">
        {/* Left: Doctor Image + Speciality */}
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
              {speciality?.name || speciality || "Specialist"}
            </div>
          </div>
        </div>

        {/* Right: Name, Experience, About */}
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
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Consultation Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-green-800 mb-4">
              Consultation
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Video Consultation</p>
                <p className="text-sm text-gray-500">20-30 mins duration</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">₹{fees}</p>
                <button
                  onClick={() => navigate(`/doctorSlots/${id}`)}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-8 h-8 text-red-600" />
              <h3 className="text-2xl font-bold text-green-800">Education</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">{degree}</p>
                  <p className="text-gray-600 text-sm">Medical University</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Experience */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-red-600" />
              <h3 className="text-2xl font-bold text-green-800">Experience</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">Senior Consultant</p>
                  <p className="text-gray-600">{hospital}</p>
                  <p className="text-sm text-gray-500">{experience}+ years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-red-600" />
              <h3 className="text-2xl font-bold text-green-800">
                Achievements
              </h3>
            </div>
            <ul className="space-y-3">
              {achievements && typeof achievements === "string" ? (
                achievements.split(",").map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">{item.trim()}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-600">No achievements listed</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Floating Button for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl lg:hidden p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <p className="font-semibold">Consultation Fee</p>
            <p className="text-red-600 font-bold text-xl">₹{fees}</p>
          </div>
          <button className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors">
            Book Now
          </button>
        </div>
      </div>
      {doctor && (
        <RelatedDoctors speciality={doctor.speciality._id} docId={doctor._id} />
      )}
    </div>
  );
};

export default DoctorDetails;
