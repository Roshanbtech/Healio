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
  Search,
  Trash2,
  Clock,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/userCommon/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { BASE_URL } from "../../utils/configSetup";
import UserVideoCall from "./Video"; // <-- Our new video call component
import { useSocket } from "../../context/SocketContext";
import { signedUrltoNormalUrl } from "../../utils/getUrl";

interface Message {
  _id: string;
  message: string;
  sender: "user" | "doctor";
  createdAt: string;
  type: "img" | "txt";
  deleted?: boolean;
}

interface Doctor {
  _id: string;
  name: string;
  speciality: string | { name: string };
  image: string;
  lastMessage?: string;
  lastMessageTime?: string;
  hasNewMessage?: boolean;
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
  const socket = useSocket(); // Use the global socket instance
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete confirmation
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Video call modal
  const [showVideoCall, setShowVideoCall] = useState(false);

  // Incoming call notification state
  const [incomingCall, setIncomingCall] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // 1. Set up global socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Global socket connected:", socket.id);
    });

    socket.on("chat:history", (chat: any) => {
      if (chat && chat._id && selectedDoctor && chat.doctorId === selectedDoctor._id) {
        setChatId(chat._id);
        setCurrentMessages(chat.messages || []);
        if (chat.messages && chat.messages.length > 0) {
          const lastMsg = chat.messages[chat.messages.length - 1];
          setDoctors((prevDoctors) =>
            prevDoctors.map((doc) =>
              doc._id === selectedDoctor._id
                ? { ...doc, lastMessage: lastMsg.message, lastMessageTime: lastMsg.createdAt }
                : doc
            )
          );
        }
      }
    });

    socket.on("message:receive", (message: Message) => {
      setCurrentMessages((prev) => {
        if (prev.some((msg) => msg._id === message._id)) return prev;
        return [...prev, message];
      });
      if (selectedDoctor) {
        setDoctors((prevDoctors) =>
          prevDoctors.map((doc) =>
            doc._id === selectedDoctor._id
              ? { ...doc, lastMessage: message.message, lastMessageTime: message.createdAt }
              : doc
          )
        );
      }
    });

    socket.on("message:updated", (data: { messageId: string; deleted: boolean }) => {
      if (data.deleted) {
        setCurrentMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, deleted: true, message: "This message was deleted" }
              : msg
          )
        );
      }
    });

    socket.on(
      "notification",
      (notification: {
        chatId: string;
        senderType: "user" | "doctor";
        senderId: string;
        message: string;
      }) => {
        if (notification.senderType === "doctor") {
          setDoctors((prevDoctors) =>
            prevDoctors.map((doc) =>
              doc._id === notification.senderId ? { ...doc, hasNewMessage: true } : doc
            )
          );
        }
        toast.info(notification.message);
      }
    );

    socket.on("video:incoming", (data) => {
      setIncomingCall(data);
    });

    // Cleanup listeners (do not disconnect global socket)
    return () => {
      socket.off("connect");
      socket.off("chat:history");
      socket.off("message:receive");
      socket.off("message:updated");
      socket.off("notification");
      socket.off("video:incoming");
    };
  }, [socket, selectedDoctor]);

  // 2. Register user for notifications
  useEffect(() => {
    if (socket && currentUser) {
      socket.emit("register", { type: "user", id: currentUser.id });
    }
  }, [socket, currentUser]);

  // 3. Fetch user & doctors on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId") || "";
    setCurrentUser({ id: storedUserId, name: "Current User", image: "" });
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get(`/appointment-doctors/${storedUserId}`);
        const doctorsData = data.getAcceptedDoctors.map((doc: Doctor) => ({
          ...doc,
          hasNewMessage: false,
        }));
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // 4. Join chat when a doctor is selected
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
      setDoctors((prevDoctors) =>
        prevDoctors.map((doc) =>
          doc._id === selectedDoctor._id ? { ...doc, hasNewMessage: false } : doc
        )
      );
    }
  }, [selectedDoctor, socket, currentUser]);

  // 5. Handlers for file selection, sending messages, etc.
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
              prevFile.name === file.name && prevFile.lastModified === file.lastModified
          )
      );
      return [...prevFiles, ...newFiles];
    });
    if (event.target) event.target.value = "";
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
    ) {
      return;
    }

    try {
      // Send images if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("image", file);
          const response = await axiosInstance.post(`/chatImgUploads/${chatId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
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

      // Send text message if available
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

  const showDeleteModal = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteMessage = () => {
    if (!chatId || !socket || !currentUser || !messageToDelete) return;
    socket.emit("message:delete", {
      chatId,
      messageId: messageToDelete,
      sender: "user",
    });
    setShowDeleteConfirm(false);
    setMessageToDelete(null);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const specName =
      typeof doctor.speciality === "object"
        ? doctor.speciality?.name || ""
        : doctor.speciality || "";
    return (
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const canSendMessage =
    (inputMessage.trim().length > 0 || selectedFiles.length > 0) && !!chatId;

  // Handlers for incoming video call
  const handleAcceptCall = (callData: any) => {
    socket?.emit("video:accept", {
      chatId: callData.chatId,
      callerType: callData.callerType,
      callerId: callData.callerId,
      recipientType: "user",
      recipientId: currentUser?.id,
    });
    setIncomingCall(null);
    setShowVideoCall(true);
  };

  const handleRejectCall = (callData: any) => {
    socket?.emit("video:reject", {
      chatId: callData.chatId,
      callerType: callData.callerType,
      callerId: callData.callerId,
      recipientType: "user",
      recipientId: currentUser?.id,
    });
    setIncomingCall(null);
  };

  return (
    <div className="flex h-screen">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <ToastContainer position="top-right" autoClose={3000} />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full animate-fadeIn transform transition-all">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Message</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setMessageToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMessage}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <p className="mb-4">
              Incoming video call from Dr. {incomingCall.callerName || "Doctor"}
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => handleAcceptCall(incomingCall)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleRejectCall(incomingCall)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="flex flex-col md:flex-row w-full max-w-7xl h-[94vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 m-4 mx-auto">
          {/* Left Sidebar: Doctor List */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white">
            <div className="bg-gradient-to-r from-red-700 to-red-600 p-6 shadow-lg h-24 flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-white text-2xl font-bold">Healio Doctors</h2>
              </div>
            </div>
            <div className="p-4 bg-white shadow-sm">
              <div className="flex items-center bg-white rounded-full shadow-md px-3 py-1 w-full border border-gray-100">
                <input
                  type="text"
                  placeholder="Search specialists..."
                  className="flex-grow bg-transparent outline-none text-gray-700 py-2 px-2 focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center ml-2 shadow-md hover:bg-red-700 transition-all"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className={`p-4 hover:bg-red-50 cursor-pointer transition-all duration-200 relative group ${
                      selectedDoctor?._id === doctor._id ? "bg-red-50" : ""
                    }`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    {selectedDoctor?._id === doctor._id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 to-red-500 rounded-r-full"></div>
                    )}
                    <div className="flex items-center space-x-4 relative">
                      <div className="relative">
                        <img
                          src={signedUrltoNormalUrl(doctor.image) || doctor.image || "https://via.placeholder.com/100"}
                          alt={doctor.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-red-100 shadow-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold text-green-800 truncate">
                            {doctor.name}
                          </h3>
                          <span className="text-xs text-gray-500 font-medium">
                            {doctor.lastMessageTime ? formatTime(doctor.lastMessageTime) : "New"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {typeof doctor.speciality === "object"
                            ? doctor.speciality?.name
                            : doctor.speciality}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {doctor.lastMessage || "Start a conversation"}
                        </p>
                      </div>
                    </div>
                    {doctor.hasNewMessage && (
                      <div className="absolute right-4 top-4 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 p-6">
                  <Search size={24} className="mb-2 text-gray-400" />
                  <p className="text-center">No matching doctors found</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-red-600 hover:underline text-sm font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
            <button className="m-4 p-3.5 text-gray-600 rounded-lg border border-gray-300 hover:bg-red-50 flex items-center justify-center space-x-2 transition-colors duration-200 hover:text-red-600 hover:border-red-400 shadow-sm">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedDoctor ? (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-500 p-5 flex items-center shadow-lg h-24">
                  <div className="relative">
                    <img
                      src={selectedDoctor.image || "https://via.placeholder.com/100"}
                      alt={selectedDoctor.name}
                      className="w-16 h-16 rounded-full object-cover border-3 border-white bg-green-100 shadow-lg"
                    />
                  </div>
                  <div className="text-white ml-4">
                    <h2 className="font-bold text-xl">{selectedDoctor.name}</h2>
                    {typeof selectedDoctor.speciality === "object" ? (
                      <p className="text-sm opacity-90 flex items-center mt-0.5">
                        <span className="w-2 h-2 bg-white rounded-full mr-1.5 opacity-75"></span>
                        {selectedDoctor.speciality?.name}
                      </p>
                    ) : (
                      <p className="text-sm opacity-90 flex items-center mt-0.5">
                        <span className="w-2 h-2 bg-white rounded-full mr-1.5 opacity-75"></span>
                        {selectedDoctor.speciality}
                      </p>
                    )}
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
                      onClick={() =>
                        toast.info("Video calls are initiated by your doctor. Please wait for an incoming call.")
                      }
                      className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      title="Video Call"
                    >
                      <Video size={18} />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 bg-gradient-to-b from-green-50 to-green-100 custom-scrollbar"
                >
                  {currentMessages.length > 0 ? (
                    currentMessages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} group`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-4 shadow-md relative ${
                            message.sender === "user"
                              ? message.deleted
                                ? "bg-gray-200 text-gray-500 rounded-tr-none"
                                : "bg-gradient-to-r from-green-600 to-green-500 text-white rounded-tr-none hover:shadow-lg transition-shadow"
                              : message.deleted
                              ? "bg-gray-200 text-gray-500 rounded-tl-none"
                              : "bg-white text-green-800 rounded-tl-none border border-gray-200"
                          }`}
                        >
                          {!message.deleted && message.sender === "user" && (
                            <div
                              className="absolute right-2 top-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={() => showDeleteModal(message._id)}
                            >
                              <button className="p-1.5 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}

                          {message.deleted ? (
                            <p className="text-base italic text-gray-500 break-words">
                              This message was deleted
                            </p>
                          ) : message.type === "img" ? (
                            <img
                              src={message.message}
                              alt="Chat image"
                              className="max-w-full rounded-lg border-2 border-white shadow-sm"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-image.jpg";
                              }}
                            />
                          ) : (
                            <p className="text-base break-words">{message.message}</p>
                          )}

                          <div
                            className={`text-xs mt-2 flex justify-end items-center ${
                              message.deleted
                                ? "text-gray-400"
                                : message.sender === "user"
                                ? "text-green-100"
                                : "text-gray-500"
                            }`}
                          >
                            <Clock size={12} className="mr-1" />
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-full p-8 mb-4 shadow-lg">
                        <MessageSquare size={40} className="text-red-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-600">Start a conversation</p>
                      <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">
                        Your conversation with Dr. {selectedDoctor.name} will appear here
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
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full p-4 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-200 pl-5 pr-12"
                        onKeyDown={(e) =>
                          e.key === "Enter" && canSendMessage && handleSendMessage()
                        }
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!canSendMessage}
                      className={`p-4 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        canSendMessage
                          ? "bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-xl"
                          : "bg-gray-300 text-gray-100 cursor-not-allowed"
                      }`}
                      title="Send message"
                    >
                      <Send size={22} />
                    </button>
                  </div>
                </div>

                {showVideoCall && chatId && currentUser && selectedDoctor && (
                  <UserVideoCall
                    chatId={chatId}
                    userId={currentUser.id}
                    doctorId={selectedDoctor._id}
                    onClose={() => setShowVideoCall(false)}
                  />
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white to-green-50 p-8">
                <div className="text-center max-w-md">
                  <div className="flex justify-center mb-8">
                    <div className="h-36 w-36 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-xl">
                      <MessageSquare size={64} className="text-white" />
                    </div>
                  </div>
                  <h1 className="text-green-800 text-3xl font-bold mb-4">Welcome to Healio</h1>
                  <p className="text-gray-600 mb-8 text-lg">
                    Select a conversation from the left to start chatting with your healthcare
                    specialist. All your medical conversations are secure and encrypted.
                  </p>
                  <div className="text-left bg-white p-6 rounded-xl shadow-xl border border-green-100">
                    <div className="flex items-center mb-4">
                      <h3 className="font-semibold text-green-700 text-lg">Premium Features:</h3>
                    </div>
                    <ul className="text-gray-600 space-y-3 text-md">
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Upload photos to help your doctor better understand your condition
                      </li>
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        All conversations are stored securely for future reference
                      </li>
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Schedule video consultations through chat
                      </li>
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Receive prescription updates directly in your conversations
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
