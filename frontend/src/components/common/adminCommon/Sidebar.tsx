import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  UserCog,
  Wrench,
  Image,
  Tag,
  Star,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { assets } from "../../../assets/assets";
import axiosInstance from "../../../utils/axiosInterceptors";
import { toast } from 'react-toastify';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

// Define the props interface for Sidebar
interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/admin/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    document.cookie = "refreshToken=; Max-Age=-99999999; path=/";
    navigate("/admin/login");
    toast.success("Logged out successfully");
  }

  const navItems: NavItem[] = [
    { icon: <LayoutGrid size={20} />, label: "Dashboard", path: "/admin/dashboard" },
    { icon: <Users size={20} />, label: "Customers", path: "/admin/getUsers" },
    { icon: <UserCog size={20} />, label: "Doctors", path: "/admin/getDoctors" },
    { icon: <Wrench size={20} />, label: "Services", path: "/admin/services" },
    { icon: <Image size={20} />, label: "Banner", path: "/admin/banner" },
    { icon: <Tag size={20} />, label: "Coupons", path: "/admin/coupons" },
    { icon: <Star size={20} />, label: "Reviews", path: "/admin/reviews" },
  ];

  // Toggle collapse and call the onCollapse prop if provided
  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onCollapse) {
      onCollapse(newCollapsed);
    }
  };

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
            <img src={assets.logo} alt="Admin Logo" className="h-8 w-8 object-contain" />
          ) : (
            <img src={assets.logo} alt="Admin Logo" className="h-12" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
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
