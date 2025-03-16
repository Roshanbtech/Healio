import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useSocket } from "../../context/SocketContext";
import { useNavigate, useLocation } from "react-router-dom";

const GlobalNotifications: React.FC = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!socket) return;

    const userId = localStorage.getItem("userId");
    const doctorId = localStorage.getItem("doctorId");

    if (userId) {
      socket.emit("register", { type: "user", id: userId });
      console.log("Registered as User:", userId);
    } else if (doctorId) {
      socket.emit("register", { type: "doctor", id: doctorId });
      console.log("Registered as Doctor:", doctorId);
    } else {
      console.warn("No user or doctor ID found!");
    }

    // 🔹 Handle New Chat Message
    const handleNewMessage = (notification: any) => {
      console.log("Received Chat Notification:", notification);

      toast.info(notification.message, {
        onClick: () => {
          let targetPath = userId ? "/chats" : "/doctor/chats";
          
          // Check if we are inside a router; otherwise, use window.location.href
          if (location.pathname) {
            navigate(targetPath);
          } else {
            window.location.href = targetPath; // Fallback
          }
        },
      });
    };

    socket.on("notification", handleNewMessage);

    return () => {
      socket.off("notification", handleNewMessage);
    };
  }, [socket, navigate, location]);

  return null;
};

export default GlobalNotifications;
