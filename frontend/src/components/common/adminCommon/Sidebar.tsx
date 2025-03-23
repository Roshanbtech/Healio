import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  UserCog,
  Wrench,
  Tag,
  LogOut,
  Menu,
  File,
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
  };

  const navItems: NavItem[] = [
    { icon: <LayoutGrid />, label: "Dashboard", path: "/admin/dashboard" },
    { icon: <Users />, label: "Customers", path: "/admin/users" },
    { icon: <UserCog />, label: "Doctors", path: "/admin/doctors" },
    { icon: <Wrench />, label: "Services", path: "/admin/services" },
    { icon: <Tag />, label: "Coupons", path: "/admin/coupons" },
    { icon: <File />, label: "Reports", path: "/admin/reports" },
  ];

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

  return (
    <div className={`fixed top-0 left-0 h-screen bg-white transition-all duration-300 ease-in-out shadow-[0_0_35px_rgba(0,0,0,0.08)] z-50 overflow-hidden
      ${isCollapsed ? 'w-20' : 'w-72'}`}>
      
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600"></div>
      
      <div className="relative h-full flex flex-col">
        {/* Header Area */}
        <div className="relative w-full h-32 bg-gradient-to-br from-red-600 via-red-500 to-red-700 flex items-center justify-center mb-2 overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-15" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z")`,
              backgroundSize: '20px 20px'
            }}
          ></div>
          
          {/* Light Rays Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-10"></div>
          
          {/* Logo */}
          <div className="flex items-center justify-center transform translate-y-2">
            <div className="bg-white p-3 rounded-full shadow-lg border-2 border-white/20">
              <img 
                src={assets.logo} 
                alt="Admin Logo" 
                className={`transition-all duration-300 ${isCollapsed ? 'h-10 w-10' : 'h-14 w-14'} object-contain`} 
              />
            </div>
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:shadow-xl border border-red-100 transition-all duration-300 hover:scale-110 z-10"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <Menu size={20} className="text-red-600 transition-transform duration-300" />
            ) : (
              <X size={20} className="text-red-600 transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className={`group flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 
                      ${isActive
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-green-50"
                      }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                      {React.cloneElement(item.icon as React.ReactElement, { 
                        size: isCollapsed ? 22 : 20,
                        strokeWidth: isActive ? 2.3 : 2,
                        className: isActive ? 'text-white' : 'text-red-600 group-hover:text-green-800'
                      })}
                      {!isCollapsed && (
                        <span className={`ml-3.5 tracking-wide transition-all duration-200 ${
                          isActive ? 'font-semibold' : 'group-hover:text-green-800'
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <button
          className="group w-full flex items-center px-4 py-3.5 rounded-xl text-gray-700 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
          onClick={handleLogout}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <LogOut size={isCollapsed ? 24 : 20} className="flex-shrink-0 transition-all duration-200" />
            {!isCollapsed && (
              <span className="ml-3.5 tracking-wide font-medium">
                Logout
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
