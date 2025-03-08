import { useState, useEffect } from "react";
import { assets } from "../../../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInterceptors";

const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [userImage, setUserImage] = useState(() => localStorage.getItem("image"));

  useEffect(() => {
    setToken(localStorage.getItem("authToken"));
    setUserImage(localStorage.getItem("image"));
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }

    localStorage.clear();
    setToken(null);
    setUserImage(null);
    navigate("/login");
  };

  // Active link style handler
  const activeStyle = ({ isActive }: { isActive: boolean }) => ({
    borderBottom: isActive ? "2px solid #dc2626" : "none",
    paddingBottom: "4px",
    transition: "border-color 0.3s ease",
  });

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      {/* Logo */}
      <img
        onClick={() => navigate("/home")}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt="Logo"
      />

      {/* Navigation Links */}
      <ul className="hidden md:flex items-start gap-8 font-medium">
        <NavLink to="/home">
          {({ isActive }) => (
            <li 
              className="py-1 text-green-900 relative"
              style={activeStyle({ isActive })}
            >
              HOME
            </li>
          )}
        </NavLink>
        <NavLink to="/doctors">
          {({ isActive }) => (
            <li 
              className="py-1 text-green-900"
              style={activeStyle({ isActive })}
            >
              ALL DOCTORS
            </li>
          )}
        </NavLink>
        <NavLink to="/about">
          {({ isActive }) => (
            <li 
              className="py-1 text-green-900"
              style={activeStyle({ isActive })}
            >
              ABOUT
            </li>
          )}
        </NavLink>
        <NavLink to="/contact">
          {({ isActive }) => (
            <li 
              className="py-1 text-green-900"
              style={activeStyle({ isActive })}
            >
              CONTACT
            </li>
          )}
        </NavLink>
      </ul>

      {/* User Profile/Login Section */}
      <div className="flex items-center gap-2">
        {token && userImage ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            {/* Profile Picture */}
            <img
              className="w-16 h-16 rounded-full border-2 border-red-600 object-cover"
              src={userImage || assets.userDefault1}
              alt="Profile"
            />
            {/* Dropdown Icon */}
            <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown" />

            {/* Dropdown Menu */}
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4 border border-green-400">
                <p
                  onClick={() => navigate("/profile")}
                  className="hover:text-red-600 cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate("appointments")}
                  className="hover:text-red-600 cursor-pointer"
                >
                  My Appointments
                </p>
                <p
                  onClick={handleLogout}
                  className="hover:text-red-600 cursor-pointer"
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-red-600 text-white px-8 py-3 rounded-full font-light hidden md:block hover:bg-red-700 transition-colors"
          >
            Create account
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;