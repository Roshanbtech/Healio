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
        setDoctors(response.data?.data?.doctors);
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
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium text-green-900">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {doctors.slice(0, 10).map((doctor) => (
          <div
            key={doctor._id}
            // onClick={() => {
            //   navigate(`/appointment/${doctor._id}`);
            //   window.scrollTo(0, 0);
            // }}
            className="border border-green-400 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
          >
            <img
              className="w-full h-48 object-cover bg-red-600"
              src={doctor.image || assets.doc11}
              alt={doctor.name}
            />
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-center text-green-500">
                <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                <p>Available</p>
              </div>
              <p className="text-green-900 text-lg font-medium">
                {doctor.name}
              </p>
              <p className="text-gray-600 text-sm">
                {typeof doctor.speciality === "object"
                  ? doctor.speciality.name
                  : doctor.speciality}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        // onClick={() => {
        //   navigate("/doctors");
        //   window.scrollTo(0, 0);
        // }}
        className="bg-red-600 text-white px-12 py-3 rounded-full mt-10"
      >
        Show More...
      </button>
    </div>
  );
};

export default TopDoctors;
