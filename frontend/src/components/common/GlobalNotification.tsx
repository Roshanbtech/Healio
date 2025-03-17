// import React, { useEffect } from "react";
// import { toast } from "react-toastify";
// import { useSocket } from "../../context/SocketContext";
// import { useNavigate, useLocation } from "react-router-dom";

// const GlobalNotifications: React.FC = () => {
//   const socket = useSocket();
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     if (!socket) return;

//     const userId = localStorage.getItem("userId");
//     const doctorId = localStorage.getItem("doctorId");

//     if (userId) {
//       socket.emit("register", { type: "user", id: userId });
//       console.log("Registered as User:", userId);
//     } else if (doctorId) {
//       socket.emit("register", { type: "doctor", id: doctorId });
//       console.log("Registered as Doctor:", doctorId);
//     } else {
//       console.warn("No user or doctor ID found!");
//     }

//     // 🔹 Handle New Chat Message
//     const handleNewMessage = (notification: any) => {
//       console.log("Received Chat Notification:", notification);

//       toast.info(notification.message, {
//         onClick: () => {
//           let targetPath = userId ? "/chats" : "/doctor/chats";
          
//           if (location.pathname) {
//             navigate(targetPath);
//           } else {
//             window.location.href = targetPath; // Fallback
//           }
//         },
//       });
//     };

//     socket.on("notification", handleNewMessage);

//     return () => {
//       socket.off("notification", handleNewMessage);
//     };
//   }, [socket, navigate, location]);

//   return null;
// };

// export default GlobalNotifications;
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

    // Retrieve user or doctor ID from storage
    const userId = localStorage.getItem("userId");
    const doctorId = localStorage.getItem("doctorId");

    if (userId) {
      socket.emit("register", { type: "user", id: userId });
      console.log("GlobalNotifications: Registered as User with ID:", userId);
    } else if (doctorId) {
      socket.emit("register", { type: "doctor", id: doctorId });
      console.log("GlobalNotifications: Registered as Doctor with ID:", doctorId);
    } else {
      console.warn("GlobalNotifications: No user or doctor ID found!");
    }

    /**
     * Handle incoming chat notifications.
     * Expected payload: { chatId: string, doctorId?: string, message: string }
     */
    const handleNewMessage = (notification: {
      chatId: string;
      doctorId?: string;
      message: string;
    }) => {
      console.log("GlobalNotifications: Received chat notification:", notification);
      toast.info(notification.message, {
        onClick: () => {
          let targetPath = userId ? "/chats" : "/doctor/chats";
          if (location.pathname) {
            navigate(targetPath);
          } else {
            window.location.href = targetPath; // Fallback
          }
        },
      });
    };

    /**
     * Handle incoming video call notifications.
     * Expected payload: { chatId: string, callerName?: string, callerId: string, callerType: string }
     */
    const handleIncomingCall = (data: {
      chatId: string;
      callerName?: string;
      callerId: string;
      callerType: string;
    }) => {
      console.log("GlobalNotifications: Received video call notification:", data);
      toast.info(
        `Incoming video call from ${data.callerName || "unknown"}. Click here to answer!`,
        {
          onClick: () => {
            let targetPath = userId ? "/chats" : "/doctor/chats";
            if (location.pathname) {
              navigate(targetPath);
            } else {
              window.location.href = targetPath; // Fallback
            }
          },
        }
      );
    };

    socket.on("notification", handleNewMessage);
    socket.on("video:incoming", handleIncomingCall);

    // Cleanup event listeners when component unmounts
    return () => {
      socket.off("notification", handleNewMessage);
      socket.off("video:incoming", handleIncomingCall);
    };
  }, [socket, navigate, location]);

  return null;
};

export default GlobalNotifications;
