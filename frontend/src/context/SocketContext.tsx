// File: src/context/SocketContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BASE_URL } from "../utils/configSetup"; 

// Create a context to hold the global socket instance.
const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(BASE_URL, {
      transports: ["websocket"],
      query: { token: localStorage.getItem("token") || "" },
    });
    setSocket(socketInstance);
    socketInstance.on("connect", () => {
      console.log("Global socket connected:", socketInstance.id);
    });
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
