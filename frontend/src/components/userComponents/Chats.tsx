"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  Send,
  ArrowLeft,
  X,
  MessageSquare,
  Phone,
  Video,
} from "lucide-react";
import io, { Socket } from "socket.io-client";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/userCommon/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Message {
  _id: string;
  message: string;
  sender: "user" | "doctor";
  timestamp?: string;
  createdAt: string;
  type: "img" | "txt";
}

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  image: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline?: boolean;
}

interface User {
  id: string;
  name: string;
  image: string;
}

export default function Chat() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  useEffect(() => {
    const s = io("http://localhost:5000", {
      transports: ["websocket"],
      query: { token: localStorage.getItem("token") || "" },
    });
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("chat:history", (chat) => {
      if (
        chat &&
        chat._id &&
        selectedDoctor &&
        chat.doctorId === selectedDoctor._id
      ) {
        setChatId(chat._id);
        setCurrentMessages(chat.messages || []);
      }
    });

    s.on("message:receive", (message: Message) => {
      setCurrentMessages((prev) => {
        if (prev.some((msg) => msg._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    s.on("doctor:status", (data: { doctorId: string; isOnline: boolean }) => {
      setDoctors((prevDoctors) =>
        prevDoctors.map((doctor) =>
          doctor._id === data.doctorId
            ? { ...doctor, isOnline: data.isOnline }
            : doctor
        )
      );
    });

    return () => {
      s.disconnect();
    };
  }, [selectedDoctor]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId") || "";
    setCurrentUser({ id: storedUserId, name: "Current User", image: "" });

    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get("/doctors");
        const doctorsWithStatus = data.data.doctors.data.map((doc: Doctor) => ({
          ...doc,
          isOnline: Math.random() > 0.5,
        }));
        setDoctors(doctorsWithStatus);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (socket && selectedDoctor && currentUser) {
      if (chatId) {
        socket.emit("leave", chatId);
      }
      setChatId(null);
      setCurrentMessages([]);
      socket.emit("join:chat", {
        doctorId: selectedDoctor._id,
        userId: currentUser.id,
      });
    }
  }, [selectedDoctor, socket, currentUser]);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prevFiles) => {
      const newFiles = files.filter(
        (file) =>
          !prevFiles.some(
            (prevFile) =>
              prevFile.name === file.name &&
              prevFile.lastModified === file.lastModified
          )
      );
      return [...prevFiles, ...newFiles];
    });
    // Clear the file input to allow re-selection of the same file if needed.
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (
      (!inputMessage.trim() && selectedFiles.length === 0) ||
      !selectedDoctor ||
      !chatId ||
      !currentUser ||
      !socket
    )
      return;

    try {
      // If there are selected files, upload each image
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("image", file);
          const response = await axiosInstance.post(
            `/chatImgUploads/${chatId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          const { imageUrl, messageId, createdAt } = response.data.result;
          socket.emit("message:send", {
            chatId,
            doctorId: selectedDoctor._id,
            userId: currentUser.id,
            sender: "user",
            message: imageUrl,
            type: "img",
            _id: messageId,
            createdAt,
          });
        }
      }

      // If there is text, send a text message
      if (inputMessage.trim()) {
        socket.emit("message:send", {
          chatId,
          doctorId: selectedDoctor._id,
          userId: currentUser.id,
          sender: "user",
          message: inputMessage,
          type: "txt",
        });
      }

      setInputMessage("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <ToastContainer />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="flex flex-col md:flex-row w-full max-w-6xl h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 m-4">
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
            <div className="bg-red-600 p-4 shadow-md h-20 flex items-center">
              <h2 className="text-white text-lg font-bold">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 relative 
                    ${selectedDoctor?._id === doctor._id ? "bg-gray-100" : ""}`}
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  {selectedDoctor?._id === doctor._id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-200"
                      />
                      {doctor.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-green-800 truncate">
                          {doctor.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {doctor.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {doctor.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="m-4 p-3 text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors duration-200 hover:text-red-600 hover:border-red-300">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col">
            {selectedDoctor ? (
              <>
                <div className="bg-red-600 p-4 flex items-center shadow-md h-20">
                  <div className="relative">
                    <img
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white bg-green-100"
                    />
                    {selectedDoctor.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="text-white ml-3">
                    <h2 className="font-bold text-lg">{selectedDoctor.name}</h2>
                    {typeof selectedDoctor.speciality === "object" ? (
                      <p className="text-sm opacity-90">
                        {selectedDoctor.speciality?.name}
                      </p>
                    ) : (
                      <p className="text-sm opacity-90">
                        {selectedDoctor.speciality}
                      </p>
                    )}
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <button
                      onClick={() => {}}
                      className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 shadow-md"
                      title="Audio Call"
                    >
                      <Phone size={18} />
                    </button>
                    <button
                      onClick={() => {}}
                      className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 shadow-md"
                      title="Video Call"
                    >
                      <Video size={18} />
                    </button>
                    <div className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      {selectedDoctor.isOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-100">
                  {currentMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                          message.sender === "user"
                            ? "bg-green-600 text-white rounded-tr-none"
                            : "bg-white text-green-800 rounded-tl-none border border-gray-200"
                        }`}
                      >
                        {message.type === "img" ? (
                          <img
                            src={message.message}
                            alt="Chat image"
                            className="max-w-full rounded-lg border-2 border-white"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.jpg";
                            }}
                          />
                        ) : (
                          <p className="text-base">{message.message}</p>
                        )}
                        <div
                          className={`text-xs mt-2 flex justify-end ${
                            message.sender === "user"
                              ? "text-green-100"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                {selectedFiles.length > 0 && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Selected file ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-lg border-2 border-green-200"
                        />
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                      accept="image/*"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 hover:bg-gray-100 text-gray-500 hover:text-green-600 rounded-full transition-colors duration-200"
                    >
                      <Paperclip size={22} />
                    </button>
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <button
                      onClick={handleSendMessage}
                      className={`p-3 rounded-full transition-colors duration-200 shadow-md ${
                        chatId
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    >
                      <Send size={22} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-green-50 p-8">
                <div className="text-center max-w-md">
                  <div className="flex justify-center mb-6">
                    <div className="h-32 w-32 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <MessageSquare size={64} className="text-white" />
                    </div>
                  </div>
                  <h1 className="text-green-800 text-2xl font-bold mb-4">
                    Welcome to Healio
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Select a conversation from the left to start chatting with
                    your healthcare provider. All your medical conversations are
                    secure and encrypted.
                  </p>
                  <div className="text-left bg-white p-4 rounded-lg shadow-md border border-green-100">
                    <h3 className="font-medium text-green-700 mb-2">
                      Quick Tips:
                    </h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>
                        • Upload photos to help your doctor better understand
                        your condition
                      </li>
                      <li>
                        • All conversations are stored securely for future
                        reference
                      </li>
                      <li>
                        • You can schedule video consultations through chat
                      </li>
                      <li>
                        • Receive prescription updates directly in your
                        conversations
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
