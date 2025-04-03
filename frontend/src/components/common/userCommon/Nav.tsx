import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../../utils/axiosInterceptors";
import { toast } from "react-toastify";
import { assets } from "../../../assets/assets";
import { signedUrltoNormalUrl } from "../../../utils/getUrl";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  
  // Initialize state using the helper to convert the signed URL
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [userImage, setUserImage] = useState<string | null>(() => {
    const storedImage = localStorage.getItem("image");
    return storedImage ? signedUrltoNormalUrl(storedImage) : null;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    setToken(localStorage.getItem("authToken"));
    const storedImage = localStorage.getItem("image");
    setUserImage(storedImage ? signedUrltoNormalUrl(storedImage) : null);
  }, []);

  const handleLogout = async (): Promise<void> => {
    try {
      const response = await axiosInstance.post<{ message?: string }>("/logout");
      toast.success(response.data.message || "Logout successful");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Logout failed:", error.message);
      } else {
        console.error("An unexpected error occurred during logout");
      }
      toast.error("Logout failed. Please try again.");
    }
    localStorage.clear();
    setToken(null);
    setUserImage(null);
    navigate("/login");
  };

  const activeStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
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
          {({ isActive }: { isActive: boolean }) => (
            <li className="py-1 text-green-900 relative" style={activeStyle({ isActive })}>
              HOME
            </li>
          )}
        </NavLink>
        <NavLink to="/doctors">
          {({ isActive }: { isActive: boolean }) => (
            <li className="py-1 text-green-900" style={activeStyle({ isActive })}>
              ALL DOCTORS
            </li>
          )}
        </NavLink>
        <NavLink to="/about">
          {({ isActive }: { isActive: boolean }) => (
            <li className="py-1 text-green-900" style={activeStyle({ isActive })}>
              ABOUT
            </li>
          )}
        </NavLink>
        <NavLink to="/contact">
          {({ isActive }: { isActive: boolean }) => (
            <li className="py-1 text-green-900" style={activeStyle({ isActive })}>
              CONTACT
            </li>
          )}
        </NavLink>
      </ul>

      {/* User Profile/Login Section */}
      <div className="flex items-center gap-2">
        {token ? (
          <div className="relative">
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                className="w-16 h-16 rounded-full border-2 border-gray-300 object-cover shadow-md transition-all duration-300 hover:shadow-lg"
                src={userImage || assets.userDefault1}
                alt="Profile"
              />
              <motion.img
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                className="w-2.5 transition-transform"
                src={assets.dropdown_icon}
                alt="Dropdown"
              />
            </motion.div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-4 text-base font-medium text-gray-700 z-20"
                >
                  <div className="min-w-[12rem] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                    <motion.div 
                      className="flex flex-col"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.1 }}
                    >
                      {[
                        { label: "My Profile", path: "/profile" },
                        { label: "My Appointments", path: "/appointments" },
                        { label: "Logout", action: handleLogout }
                      ].map((item, index) => (
                        <motion.p
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ 
                            backgroundColor: "#fff1f1", 
                            color: "#dc2626", 
                            paddingLeft: "1rem" 
                          }}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            item.path ? navigate(item.path) : item.action && item.action();
                          }}
                          className="px-4 py-3 cursor-pointer transition-all duration-300 hover:bg-red-50"
                        >
                          {item.label}
                        </motion.p>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
