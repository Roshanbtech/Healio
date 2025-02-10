import React, { useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";

// Define Doctor Interface
interface Doctor {
  _id: string;
  image: string;
  name: string;
  speciality: string;
}

// Fix Context Type Issue
interface AppContextType {
  doctors: Doctor[];
}

const TopDoctors: React.FC = () => {
  const navigate = useNavigate();
  
  // Ensure useContext has a default value
  const context = useContext(AppContext);

  if (!context) {
    return <div>Loading...</div>; // Handle undefined context case
  }

  const { doctors } = context as AppContextType;

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium text-green-900">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {doctors.slice(0, 10).map((item: Doctor, index: number) => (
          <div
            key={index}
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              window.scrollTo(0, 0);
            }}
            className="border border-green-400 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
          >
            <img className="w-full h-48 object-cover bg-red-600" src={item.image} alt={item.name} />
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-center text-green-500">
                <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                <p>Available</p>
              </div>
              <p className="text-green-900 text-lg font-medium">{item.name}</p>
              <p className="text-gray-600 text-sm">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          navigate("/doctors");
          window.scrollTo(0, 0);
        }}
        className="bg-red-600 text-green-600 px-12 py-3 rounded-full mt-10"
      >
        Show More...
      </button>
    </div>
  );
};

export default TopDoctors;
