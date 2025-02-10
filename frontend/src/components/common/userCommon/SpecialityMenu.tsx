import React from "react";
import { specialityData } from "../../../assets/assets";
import { Link } from "react-router-dom";

// Define TypeScript interface for speciality data
interface SpecialityItem {
  speciality: string;
  image: string;
}

const SpecialityMenu: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-gray-800" id="speciality">
      <h1 className="text-3xl font-medium text-green-900">Find by Speciality</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
      </p>

      <div className="flex sm:justify-center gap-4 pt-5 w-full">
        {specialityData.map((item: SpecialityItem, index: number) => (
          <Link
            key={index}
            to={`/doctors/${item.speciality}`}
            onClick={() => window.scrollTo(0, 0)}
            className="flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500"
          >
            <img
              className="w-16 sm:w-14 mb-2 border-2 border-red-600 rounded-full"
              src={item.image}
              alt={`${item.speciality} Icon`}
            />
            <p className="font-medium text-red-600">{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
