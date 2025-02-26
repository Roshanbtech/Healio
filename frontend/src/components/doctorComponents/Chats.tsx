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
      setCurrentMessages((prev) => [...prev, message]);
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
    setSelectedFiles((prev) => [...prev, ...files]);
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
          {/* Left Sidebar */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
            <div className="bg-red-600 p-4 shadow-md h-20 flex items-center">
              <h2 className="text-white text-lg font-bold">Patients</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 relative 
                    ${selectedUser?._id === user._id ? "bg-gray-100" : ""}`}
                  onClick={() => handleUserSelect(user)}
                >
                  {selectedUser?._id === user._id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-200"
                      />
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-gray-800 truncate">
                          {user.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {user.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {user.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="m-4 p-3 text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors duration-200 hover:text-red-600 hover:border-red-300">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                <div className="bg-red-600 p-4 flex items-center shadow-md h-20">
                  <div className="relative">
                    <img
                      src={selectedUser.image}
                      alt={selectedUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white bg-gray-100"
                    />
                    {selectedUser.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="text-white ml-3">
                    <h2 className="font-bold text-lg">{selectedUser.name}</h2>
                    <p className="text-sm opacity-90">Patient</p>
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
                      {selectedUser.isOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-100">
                  {currentMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender === "doctor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                          message.sender === "doctor"
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
                            message.sender === "doctor"
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
                      className="p-3 hover:bg-gray-100 text-gray-500 hover:text-red-600 rounded-full transition-colors duration-200"
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
                    Doctor's Portal
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Select a patient conversation from the left to start
                    chatting. All medical conversations are secure, encrypted,
                    and HIPAA compliant.
                  </p>
                  <div className="text-left bg-white p-4 rounded-lg shadow-md border border-green-100">
                    <h3 className="font-medium text-green-700 mb-2">
                      Professional Guidelines:
                    </h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Maintain professional boundaries at all times</li>
                      <li>
                        • Verify patient identity before sharing sensitive
                        information
                      </li>
                      <li>
                        • Document all medical advice provided in the chat
                      </li>
                      <li>• Use secure file transfer for medical documents</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* End Chat Area */}
        </div>
      </div>
    </div>
  );
}

// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { Paperclip, Send, ArrowLeft, X, MessageSquare } from "lucide-react";
// import io, { Socket } from "socket.io-client";
// import axiosInstance from "../../utils/axiosInterceptors";
// import { Sidebar } from "../common/doctorCommon/Sidebar";

// interface Message {
//   _id: string;
//   message: string;
//   sender: "user" | "doctor";
//   timestamp?: string;
//   createdAt: string;
//   attachments?: string[];
//   type?: "img" | "txt";
// }

// interface Chat {
//   _id: string;
//   userId: string;
//   messages: Message[];
//   user?: User;
// }

// interface User {
//   _id: string;
//   name: string;
//   image: string;
// }

// export default function DoctorChat() {
//   const [patients, setPatients] = useState<User[]>([]);
//   const [chatHistories, setChatHistories] = useState<{ [userId: string]: Chat }>({});
//   const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
//   const [chatPartner, setChatPartner] = useState<User | null>(null);
//   const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [currentDoctor, setCurrentDoctor] = useState<string>("");

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     const s = io("http://localhost:5000", {
//       transports: ["websocket"],
//       query: { token: localStorage.getItem("token") || "" },
//     });
//     setSocket(s);
//     s.on("connect", () => {
//       console.log("Socket connected:", s.id);
//     });
//     s.on("chat:history", (chat: Chat) => {
//       console.log("Chat history received:", chat);
//       setChatHistories((prev) => ({ ...prev, [chat.userId]: chat }));
//       if (selectedChat && chat.userId === selectedChat.userId) {
//         setSelectedChat(chat);
//         setCurrentMessages(chat.messages || []);
//       }
//     });
//     s.on("message:receive", (message: Message) => {
//       console.log("New message received:", message);
//       setCurrentMessages((prev) => [...prev, message]);
//       setChatHistories((prev) => {
//         const chat =
//           prev[message.sender === "user" && selectedChat ? selectedChat.userId : ""] || {
//             _id: "",
//             userId: selectedChat ? selectedChat.userId : "",
//             messages: [],
//           };
//         const updatedChat = { ...chat, messages: [...chat.messages, message] };
//         return { ...prev, [updatedChat.userId]: updatedChat };
//       });
//     });
//     return () => {
//       s.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     const doctorId = sessionStorage.getItem("doctorId") || "defaultDoctorId";
//     setCurrentDoctor(doctorId);
//     const fetchPatients = async () => {
//       try {
//         const { data } = await axiosInstance.get(`/doctor/users`);
//         setPatients(data?.data?.users);
//       } catch (error) {
//         console.error("Error fetching patients:", error);
//       }
//     };
//     fetchPatients();
//   }, []);

//   useEffect(() => {
//     if (socket && selectedChat && currentDoctor) {
//       socket.emit("join:chat", {
//         doctorId: currentDoctor,
//         userId: selectedChat.userId,
//       });
//       setCurrentMessages(selectedChat.messages || []);
//     }
//   }, [selectedChat, socket, currentDoctor]);

//   useEffect(() => {
//     if (selectedChat && selectedChat.user) {
//       setChatPartner(selectedChat.user);
//     } else if (selectedChat) {
//       const found = patients.find((p) => p._id === selectedChat.userId);
//       if (found) setChatPartner(found);
//     }
//   }, [selectedChat, patients]);

//   const handleSelectPatient = (patient: User) => {
//     const chat = chatHistories[patient._id] || { _id: "", userId: patient._id, messages: [], user: patient };
//     setSelectedChat(chat);
//     setCurrentMessages(chat.messages || []);
//   };

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(event.target.files || []);
//     setSelectedFiles((prev) => [...prev, ...files]);
//   };

//   const handleRemoveFile = (index: number) => {
//     setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSendMessage = async () => {
//     if ((!inputMessage.trim() && selectedFiles.length === 0) || !selectedChat || !socket) return;
//     let attachments: string[] = [];
//     if (selectedFiles.length > 0) {
//       for (const file of selectedFiles) {
//         const formData = new FormData();
//         formData.append("file", file);
//         try {
//           const response = await axiosInstance.post("/upload", formData);
//           attachments.push(response.data.fileId);
//         } catch (error) {
//           console.error("Error uploading file:", error);
//           return;
//         }
//       }
//     }
//     socket.emit("message:send", {
//       chatId: selectedChat._id,
//       doctorId: currentDoctor,
//       userId: selectedChat.userId,
//       sender: "doctor",
//       message: inputMessage,
//       attachments,
//       type: "txt",
//     });
//     setInputMessage("");
//     setSelectedFiles([]);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   return (
//     <div className="flex h-screen">
//       <Sidebar onCollapse={setSidebarCollapsed} />
//       <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
//         <div className="flex flex-col md:flex-row w-full max-w-6xl h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 m-4">
//           <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
//             <div className="bg-red-600 p-4 shadow-md h-20 flex items-center">
//               <h2 className="text-white text-lg font-bold">Messages</h2>
//             </div>
//             <div className="flex-1 overflow-y-auto">
//               {patients.map((patient) => {
//                 const chat = chatHistories[patient._id];
//                 const lastMessage =
//                   chat && chat.messages && chat.messages.length > 0
//                     ? chat.messages[chat.messages.length - 1]
//                     : null;
//                 return (
//                   <div
//                     key={patient._id}
//                     className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
//                       selectedChat && selectedChat.userId === patient._id ? "bg-gray-100" : ""
//                     }`}
//                     onClick={() => handleSelectPatient(patient)}
//                   >
//                     <div className="flex items-center space-x-3">
//                       <img
//                         src={patient.image || "/default-avatar.png"}
//                         alt={patient.name}
//                         className="w-12 h-12 rounded-full object-cover border-2 border-red-200"
//                       />
//                       <div className="flex-1 min-w-0">
//                         <div className="flex justify-between items-baseline">
//                           <h3 className="font-medium text-green-800 truncate">{patient.name}</h3>
//                           <span className="text-xs text-gray-500">
//                             {lastMessage &&
//                               new Date(lastMessage.createdAt).toLocaleTimeString([], {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                               })}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-500 truncate">
//                           {lastMessage ? lastMessage.message : "No messages yet"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//             <button className="m-4 p-3 text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors duration-200 hover:text-red-600 hover:border-red-300">
//               <ArrowLeft size={20} />
//               <span className="font-medium">Back to Home</span>
//             </button>
//           </div>
//           <div className="flex-1 flex flex-col">
//             {selectedChat && chatPartner ? (
//               <>
//                 <div className="bg-red-600 p-4 flex items-center shadow-md h-20">
//                   <img
//                     src={chatPartner.image || "/default-avatar.png"}
//                     alt={chatPartner.name}
//                     className="w-12 h-12 rounded-full object-cover border-2 border-white"
//                   />
//                   <div className="text-white ml-3">
//                     <h2 className="font-bold text-lg">{chatPartner.name}</h2>
//                     <p className="text-sm opacity-90">Active now</p>
//                   </div>
//                 </div>
//                 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-100">
//   {currentMessages.map((message) => (
//     <div
//       key={message._id}
//       className={`flex ${message.sender === "doctor" ? "justify-end" : "justify-start"}`}
//     >
//       <div
//         className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
//           message.sender === "doctor"
//             ? "bg-green-600 text-white rounded-tr-none"
//             : "bg-white text-green-800 rounded-tl-none border border-gray-200"
//         }`}
//       >
//         {/* Added this conditional rendering */}
//         {message.type === "img" ? (
//           <img
//             src={message.message}
//             alt="Chat image"
//             className="max-w-[250px] rounded-lg border-2 border-white"
//             onError={(e) => {
//               e.currentTarget.src = "/placeholder-image.jpg"; // Fallback image
//             }}
//           />
//         ) : (
//           <p className="text-base">{message.message}</p>
//         )}
//         <div className={`text-xs mt-2 ${message.sender === "doctor" ? "text-green-100" : "text-gray-500"}`}>
//           {new Date(message.createdAt).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           })}
//         </div>
//       </div>
//     </div>
//   ))}
//   {/* Added this ref for scrolling */}
//   <div ref={messagesEndRef} />

//                 </div>
//                 {selectedFiles.length > 0 && (
//                   <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2">
//                     {selectedFiles.map((file, index) => (
//                       <div key={index} className="relative group">
//                         <img
//                           src={URL.createObjectURL(file)}
//                           alt={`Selected file ${index + 1}`}
//                           className="h-20 w-20 object-cover rounded-lg border-2 border-green-200"
//                         />
//                         <button
//                           onClick={() => handleRemoveFile(index)}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
//                         >
//                           <X size={16} />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 <div className="p-4 border-t border-gray-200 bg-white">
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       onChange={handleFileSelect}
//                       className="hidden"
//                       multiple
//                       accept="image/*"
//                     />
//                     <button
//                       onClick={() => fileInputRef.current?.click()}
//                       className="p-3 hover:bg-gray-100 text-gray-500 hover:text-green-600 rounded-full transition-colors duration-200"
//                     >
//                       <Paperclip size={22} />
//                     </button>
//                     <input
//                       type="text"
//                       value={inputMessage}
//                       onChange={(e) => setInputMessage(e.target.value)}
//                       placeholder="Type your reply..."
//                       className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
//                       onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//                     />
//                     <button
//                       onClick={handleSendMessage}
//                       className={`p-3 rounded-full transition-colors duration-200 shadow-md ${
//                         selectedChat
//                           ? "bg-green-600 text-white hover:bg-green-700"
//                           : "bg-gray-400 text-gray-200 cursor-not-allowed"
//                       }`}
//                     >
//                       <Send size={22} />
//                     </button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 flex flex-col items-center justify-center bg-green-50 p-8">
//                 <div className="text-center max-w-md">
//                   <div className="flex justify-center mb-6">
//                     <div className="h-32 w-32 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
//                       <MessageSquare size={64} className="text-white" />
//                     </div>
//                   </div>
//                   <h1 className="text-green-800 text-2xl font-bold mb-4">Welcome to Healio</h1>
//                   <p className="text-gray-600 mb-6">
//                     Select a conversation from the left to start chatting with your patients.
//                   </p>
//                   <div className="text-left bg-white p-4 rounded-lg shadow-md border border-green-100">
//                     <h3 className="font-medium text-green-700 mb-2">Quick Tips:</h3>
//                     <ul className="text-gray-600 space-y-2 text-sm">
//                       <li>• Ensure you respond promptly to patient queries</li>
//                       <li>• Use clear and concise language</li>
//                       <li>• Review patient history before replying</li>
//                       <li>• Attach files if necessary to support your response</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
