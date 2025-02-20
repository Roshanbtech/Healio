import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInterceptors"; // Your axios instance setup
import {
  LayoutGrid,
  User,
  Calendar,
  Clock,
  GraduationCap,
  Wallet,
  MessageSquare,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { assets } from "../../../assets/assets";

// Define a type for each navigation item.
interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDoctor, setIsDoctor] = useState<boolean | null>(null); // Store doctor's isDoctor status
  const doctorId = sessionStorage.getItem("doctorId"); // Get doctorId from session storage

  // Toggle the collapse state and notify the parent if onCollapse is provided.
  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onCollapse) {
      onCollapse(newCollapsed);
    }
  };

  // Fetch doctor profile to check if the doctor is authorized to access full sidebar
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (doctorId) {
        try {
          const response = await axiosInstance.get(`/doctor/profile/${doctorId}`);
          setIsDoctor(response.data?.data?.profile?.isDoctor); // Assuming response contains isDoctor field
        } catch (error) {
          console.error("Error fetching doctor profile:", error);
        }
      }
    };

    fetchDoctorProfile();
  }, [doctorId]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/doctor/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    document.cookie = "refreshToken=; Max-Age=-99999999; path=/";
    navigate("/doctor/login");
  };

  // Sidebar items (filter based on isDoctor)
  const navItems: NavItem[] = [
    { icon: <LayoutGrid size={20} />, label: "Dashboard", path: "/doctor/home" },
    { icon: <User size={20} />, label: "Profile", path: "/doctor/profile" },
    { icon: <Calendar size={20} />, label: "Appointments", path: "/doctor/appointments" },
    { icon: <Clock size={20} />, label: "Current Schedules", path: "/doctor/schedules" },
    { icon: <GraduationCap size={20} />, label: "Qualification", path: "/doctor/qualifications" },
    { icon: <Wallet size={20} />, label: "Wallet", path: "/doctor/wallet" },
    { icon: <MessageSquare size={20} />, label: "Chats", path: "/doctor/chats" },
  ];

  // Filter navItems based on the doctor's isDoctor status
  const filteredNavItems = isDoctor
    ? navItems // If isDoctor is true, show all items
    : navItems.filter((item) => item.label === "Dashboard" || item.label === "Qualification");

  return (
    <div className={`fixed top-0 left-0 h-screen bg-white transition-all duration-300 shadow-lg
      ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="relative h-full flex flex-col p-4">
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-6 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
        >
          {isCollapsed ? <Menu size={16} /> : <X size={16} />}
        </button>

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          {isCollapsed ? (
            <img src={assets.logo} alt="Healio Logo" className="h-8 w-8 object-contain" />
          ) : (
            <img src={assets.logo} alt="Healio Logo" className="h-12" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-3 rounded-lg text-sm transition-colors
                    ${location.pathname === item.path
                      ? "bg-[#e8f8e8] text-[#2d8e3c]"
                      : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    {item.icon}
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <button
          className="flex items-center px-3 py-3 text-gray-600 hover:bg-gray-100 rounded-lg mt-4"
          onClick={handleLogout}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </div>
        </button>
      </div>
    </div>
  );
};
