import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInterceptors";
import { assets } from "../../../assets/assets";

// Define the Speciality interface
interface Speciality {
  _id: string;
  name: string;
}

// Update Doctor interface to handle speciality as either a string or an object
interface Doctor {
  _id: string;
  image: string;
  name: string;
  speciality: string | Speciality;
}

const TopDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Use axiosInstance to get doctors from the '/doctors' route
        const response = await axiosInstance.get("/doctors");
        console.log(response.data.data.doctors);
        setDoctors(response.data?.data?.doctors.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-bold text-green-900">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-gray-600 text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pt-5 px-3 sm:px-0">
        {doctors.slice(0, 10).map((doctor) => (
          <div
            key={doctor._id}
            onClick={() => navigate(`/doctorDetails/${doctor._id}`)}
            className="rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 transform hover:-translate-y-2 shadow-md hover:shadow-lg"
          >
            {/* Image Container with bg-green-100 */}
            <div className="relative w-full h-48 bg-green-100">
              <img
                className="w-full h-full object-cover"
                src={doctor.image || assets.doc11}
                alt={doctor.name}
              />
              {/* Removed gradient overlay */}
            </div>

            {/* Doctor Details Card with bg-red-600 and white text */}
            <div className="p-4 bg-red-600 text-white">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className = "text-green-500">Available</p>
              </div>
              <h3 className="text-lg font-semibold mt-2">
                {doctor.name}
              </h3>
              <p className="text-sm">
                {typeof doctor.speciality === "object"
                  ? doctor.speciality.name
                  : doctor.speciality}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      <button
        // onClick={() => {
        //   navigate("/doctors");
        //   window.scrollTo(0, 0);
        // }}
        className="bg-red-600 text-white px-12 py-3 rounded-full mt-10 hover:bg-red-700 transition-colors duration-300"
      >
        Show More...
      </button>
    </div>
  );
};

export default TopDoctors;
