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
  Crown,
  Search,
  Filter,
  Shield,
  Clock,
  Bell
} from "lucide-react";
import io, { Socket } from "socket.io-client";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/doctorCommon/Sidebar";
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

interface User {
  _id: string;
  name: string;
  image: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline?: boolean;
}

interface Doctor {
  id: string;
  name: string;
  image: string;
  speciality: string;
}

export default function DoctorChat() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [filterOption, setFilterOption] = useState("all");

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
        selectedUser &&
        chat.userId === selectedUser._id
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

    s.on("user:status", (data: { userId: string; isOnline: boolean }) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === data.userId ? { ...user, isOnline: data.isOnline } : user
        )
      );
    });

    return () => {
      s.disconnect();
    };
  }, [selectedUser]);

  useEffect(() => {
    const storedDoctorId = sessionStorage.getItem("doctorId") || "";
    setCurrentDoctor({
      id: storedDoctorId,
      name: "Dr. Current Doctor",
      image: "",
      speciality: "General Physician",
    });

    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get("/doctor/users");
        const usersWithStatus = data.data.users.map((user: User) => ({
          ...user,
          isOnline: Math.random() > 0.5,
        }));
        setUsers(usersWithStatus);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (socket && selectedUser && currentDoctor) {
      if (chatId) {
        socket.emit("leave", chatId);
      }
      setChatId(null);
      setCurrentMessages([]);
      socket.emit("join:chat", {
        userId: selectedUser._id,
        doctorId: currentDoctor.id,
      });
    }
  }, [selectedUser, socket, currentDoctor]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
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
      !selectedUser ||
      !chatId ||
      !currentDoctor ||
      !socket
    )
      return;

    try {
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("image", file);
          const response = await axiosInstance.post(
            `doctor/chatImgUploads/${chatId}`,
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
            userId: selectedUser._id,
            doctorId: currentDoctor.id,
            sender: "doctor",
            message: imageUrl,
            type: "img",
            _id: messageId,
            createdAt,
          });
        }
      }

      if (inputMessage.trim()) {
        socket.emit("message:send", {
          chatId,
          userId: selectedUser._id,
          doctorId: currentDoctor.id,
          sender: "doctor",
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

  const handleFilterChange = (option: string) => {
    setFilterOption(option);
    setShowFilterOptions(false);
  };

  const filteredUsers = users.filter(user => {
    // Name search filter
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    if (filterOption === 'online' && !user.isOnline) return false;
    if (filterOption === 'offline' && user.isOnline) return false;
    
    return matchesSearch;
  });

  return (
    <div className="flex h-screen">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <ToastContainer />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="flex flex-col md:flex-row w-full max-w-6xl h-[90vh] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 m-4">
          {/* Left sidebar with patient list */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-gradient-to-b from-white to-gray-50">
            <div className="bg-gradient-to-r from-red-700 to-red-600 p-4 shadow-lg h-24 flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-white text-xl font-bold">Healio Patients</h2>
              </div>
              <button className="relative p-2 text-white rounded-full hover:bg-red-700 transition-colors">
                <Bell size={22} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-300 rounded-full"></span>
              </button>
            </div>
            
            {/* Search and filter bar */}
            <div className="p-3 bg-white shadow-sm">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
                <div className="relative ml-2">
                  <button 
                    onClick={() => setShowFilterOptions(!showFilterOptions)}
                    className={`p-3 rounded-lg transition-colors ${
                      filterOption !== 'all' 
                        ? 'bg-red-100 text-red-600 border border-red-200' 
                        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-red-300 hover:text-red-500'
                    }`}
                  >
                    <Filter size={18} />
                  </button>
                  
                  {showFilterOptions && (
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div 
                        className="p-2 hover:bg-red-50 cursor-pointer border-b border-gray-100"
                        onClick={() => handleFilterChange('all')}
                      >
                        <span className={`flex items-center ${filterOption === 'all' ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                          {filterOption === 'all' && <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>}
                          All patients
                        </span>
                      </div>
                      <div 
                        className="p-2 hover:bg-red-50 cursor-pointer border-b border-gray-100"
                        onClick={() => handleFilterChange('online')}
                      >
                        <span className={`flex items-center ${filterOption === 'online' ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                          {filterOption === 'online' && <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>}
                          Online only
                        </span>
                      </div>
                      <div 
                        className="p-2 hover:bg-red-50 cursor-pointer"
                        onClick={() => handleFilterChange('offline')}
                      >
                        <span className={`flex items-center ${filterOption === 'offline' ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                          {filterOption === 'offline' && <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>}
                          Offline only
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`p-4 border-b border-gray-100 hover:bg-red-50 cursor-pointer transition-all duration-200 relative 
                      ${selectedUser?._id === user._id ? "bg-red-50" : ""}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    {selectedUser?._id === user._id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 to-red-500 rounded-r-full"></div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-red-200 shadow-md"
                        />
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold text-green-800 truncate">
                            {user.name}
                          </h3>
                          <span className="text-xs text-gray-500 font-medium">
                            {user.lastMessageTime || "New"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          Patient
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {user.lastMessage || "Start a conversation"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <Search size={24} className="mb-2 text-gray-400" />
                  <p>No matching patients found</p>
                  <button 
                    onClick={() => {setSearchQuery(''); setFilterOption('all');}}
                    className="mt-2 text-red-600 hover:underline text-sm"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
            <button className="m-4 p-3.5 text-gray-600 rounded-lg border border-gray-300 hover:bg-red-50 flex items-center justify-center space-x-2 transition-colors duration-200 hover:text-red-600 hover:border-red-400 shadow-sm">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedUser ? (
              <>
                <div className="bg-gradient-to-r from-red-600 to-red-500 p-4 flex items-center shadow-lg h-24">
                  <div className="relative">
                    <img
                      src={selectedUser.image}
                      alt={selectedUser.name}
                      className="w-14 h-14 rounded-full object-cover border-3 border-white bg-green-100 shadow-lg"
                    />
                    {selectedUser.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                    )}
                  </div>
                  <div className="text-white ml-4">
                    <h2 className="font-bold text-xl">{selectedUser.name}</h2>
                    <p className="text-sm opacity-90 flex items-center mt-0.5">
                      <span className="w-2 h-2 bg-white rounded-full mr-1.5 opacity-75"></span>
                      Patient
                    </p>
                  </div>
                  <div className="ml-auto flex items-center space-x-3">
                    <button
                      onClick={() => toast.info("Audio call feature coming soon!")}
                      className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      title="Audio Call"
                    >
                      <Phone size={18} />
                    </button>
                    <button
                      onClick={() => toast.info("Video call feature coming soon!")}
                      className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      title="Video Call"
                    >
                      <Video size={18} />
                    </button>
                    <div className={`px-3 py-1.5 ${selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-500'} text-white text-xs rounded-full font-medium shadow-md flex items-center`}>
                      <span className={`w-2 h-2 ${selectedUser.isOnline ? 'bg-green-200' : 'bg-gray-300'} rounded-full mr-1.5 animate-pulse`}></span>
                      {selectedUser.isOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-green-50 to-green-100 custom-scrollbar">
                  {currentMessages.length > 0 ? (
                    currentMessages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender === "doctor" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                            message.sender === "doctor"
                              ? "bg-gradient-to-r from-green-600 to-green-500 text-white rounded-tr-none"
                              : "bg-white text-green-800 rounded-tl-none border border-gray-200"
                          }`}
                        >
                          {message.type === "img" ? (
                            <img
                              src={message.message}
                              alt="Chat image"
                              className="max-w-full rounded-lg border-2 border-white shadow-sm"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-image.jpg";
                              }}
                            />
                          ) : (
                            <p className="text-base">{message.message}</p>
                          )}
                          <div
                            className={`text-xs mt-2 flex justify-end items-center ${
                              message.sender === "doctor"
                                ? "text-green-100"
                                : "text-gray-500"
                            }`}
                          >
                            <Clock size={12} className="mr-1" />
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <div className="bg-red-100 rounded-full p-8 mb-4">
                        <MessageSquare size={40} className="text-red-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-600">Start a conversation</p>
                      <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">
                        Your conversation with {selectedUser.name} will appear here
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {selectedFiles.length > 0 && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Selected file ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-lg border-2 border-green-200 shadow-md transition-transform transform group-hover:scale-105"
                        />
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform hover:scale-110"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-5 border-t border-gray-200 bg-white shadow-inner">
                  <div className="flex items-center space-x-3">
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
                      className="p-3.5 hover:bg-gray-100 text-gray-500 hover:text-green-600 rounded-full transition-all duration-200 transform hover:scale-110"
                      title="Attach images"
                    >
                      <Paperclip size={22} />
                    </button>
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 p-4 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-200"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatId}
                      className={`p-4 rounded-full transition-all duration-200 shadow-lg transform hover:scale-105 ${
                        chatId
                          ? "bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-xl"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                      title="Send message"
                    >
                      <Send size={22} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white to-green-50 p-8">
                <div className="text-center max-w-md">
                  <div className="flex justify-center mb-8">
                    <div className="h-36 w-36 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-xl">
                      <MessageSquare size={64} className="text-white" />
                    </div>
                  </div>
                  <h1 className="text-green-800 text-3xl font-bold mb-4">
                    Doctor's Portal
                  </h1>
                  <p className="text-gray-600 mb-8 text-lg">
                    Select a patient conversation from the left to start chatting. All medical conversations are secure, encrypted, and HIPAA compliant.
                  </p>
                  <div className="text-left bg-white p-6 rounded-xl shadow-xl border border-green-100">
                    <div className="flex items-center mb-4">
                      <Shield size={20} className="text-red-600 mr-2" />
                      <h3 className="font-semibold text-green-700 text-lg">
                        Professional Guidelines:
                      </h3>
                    </div>
                    <ul className="text-gray-600 space-y-3 text-md">
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Maintain professional boundaries at all times
                      </li>
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Verify patient identity before sharing sensitive information
                      </li>
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Document all medical advice provided in the chat
                      </li>
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Use secure file transfer for medical documents
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