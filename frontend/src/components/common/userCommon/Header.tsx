import React from "react";
import { assets } from "../../../assets/assets";

const Header: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap bg-red-600 rounded-lg px-4 md:px-6 lg:px-10">
      {/* ---------------- Left Side-------------------- */}
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-6 m-auto md:py-[8vw] md:mb-[-20px]">
        <p className="text-2xl md:text-3xl lg:text-4xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight">
          Book Appointment <br /> With Trusted Doctors
        </p>
        <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
          <img className="w-24" src={assets.group_profiles} alt="Group Profiles" />
          <p>
            Simply browse through our extensive list of trusted doctors,{" "}
            <br className="hidden sm:block" /> schedule your appointment
            hassle-free.
          </p>
        </div>
        <a
          href="#speciality"
          className="flex items-center gap-2 bg-white px-6 py-4 rounded-full text-green-900 text-sm m-auto md:m-0 hover:text-white hover:bg-green-900 hover:scale-105 transition-all duration-300"
        >
          Book appointment{" "}
          <img className="w-3" src={assets.arrow_icon} alt="Arrow Icon" />
        </a>
      </div>

      {/* ---------------------- Right Side ------------------------*/}
      <div className="md:w-1/2 relative">
        <img
          className="w-full md:absolute bottom-0 rounded-lg"
          src={assets.header_img}
          alt="Header Image"
        />
      </div>
    </div>
  );
};

export default Header;
