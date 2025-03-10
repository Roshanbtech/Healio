// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import {
//   Paperclip,
//   Send,
//   ArrowLeft,
//   X,
//   MessageSquare,
//   Phone,
//   Video,
//   Search,
//   Shield,
//   Clock,
//   Trash2,
// } from "lucide-react";
// import io, { Socket } from "socket.io-client";
// import axiosInstance from "../../utils/axiosInterceptors";
// import { Sidebar } from "../common/doctorCommon/Sidebar";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { format } from "date-fns";
// import { BASE_URL } from "../../utils/configSetup";

// interface Message {
//   _id: string;
//   message: string;
//   sender: "user" | "doctor";
//   createdAt: string;
//   type: "img" | "txt";
//   deleted?: boolean;
// }

// interface User {
//   _id: string;
//   name: string;
//   image: string;
//   lastMessage?: string;
//   lastMessageTime?: string;
//   hasNewMessage?: boolean;
// }

// interface Doctor {
//   id: string;
//   name: string;
//   image: string;
//   speciality: string;
// }

// export default function DoctorChat() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [inputMessage, setInputMessage] = useState("");
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
//   const [chatId, setChatId] = useState<string | null>(null);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterOption, setFilterOption] = useState("all");

//   // State for delete confirmation modal
//   const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Format timestamp using date-fns
//   const formatTime = (dateString: string): string => {
//     const date = new Date(dateString);
//     return format(date, "hh:mm a");
//   };

//   // Scroll to bottom when messages update
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [currentMessages]);

//   // Initialize socket connection (runs once)
//   useEffect(() => {
//     const s: Socket = io(BASE_URL, {
//       transports: ["websocket"],
//       query: { token: localStorage.getItem("token") || "" },
//     });
//     setSocket(s);

//     s.on("connect", () => {
//       console.log("Socket connected:", s.id);
//     });

//     s.on("chat:history", (chat: any) => {
//       if (
//         chat &&
//         chat._id &&
//         selectedUser &&
//         String(chat.userId) === selectedUser._id
//       ) {
//         setChatId(chat._id);
//         setCurrentMessages(chat.messages || []);
//         // Update the user's last message/time in the listing
//         if (chat.messages && chat.messages.length > 0) {
//           const lastMsg = chat.messages[chat.messages.length - 1];
//           setUsers((prevUsers) =>
//             prevUsers.map((user) =>
//               user._id === selectedUser._id
//                 ? { ...user, lastMessage: lastMsg.message, lastMessageTime: lastMsg.createdAt }
//                 : user
//             )
//           );
//         }
//       }
//     });

//     s.on("message:receive", (message: Message) => {
//       setCurrentMessages((prev) => {
//         if (prev.some((msg) => msg._id === message._id)) return prev;
//         return [...prev, message];
//       });
//       // Update last message for the selected user
//       if (selectedUser) {
//         setUsers((prevUsers) =>
//           prevUsers.map((user) =>
//             user._id === selectedUser._id
//               ? { ...user, lastMessage: message.message, lastMessageTime: message.createdAt }
//               : user
//           )
//         );
//       }
//     });

//     // Listen for message updates (e.g., deletion)
//     s.on("message:updated", (data: { messageId: string; deleted: boolean }) => {
//       if (data.deleted) {
//         setCurrentMessages((prevMessages) =>
//           prevMessages.map((msg) =>
//             msg._id === data.messageId
//               ? { ...msg, deleted: true, message: "This message was deleted" }
//               : msg
//           )
//         );
//       }
//     });

//     // Listen for error events (e.g., if a patient is blocked)
//     s.on("chat:error", (data: { error: string }) => {
//       toast.error(data.error);
//     });

//     // Listen for notifications from patients
//     s.on(
//       "notification",
//       (notification: {
//         chatId: string;
//         senderType: "user" | "doctor";
//         senderId: string;
//         message: string;
//       }) => {
//         if (notification.senderType === "user") {
//           setUsers((prevUsers) =>
//             prevUsers.map((user) =>
//               user._id === notification.senderId ? { ...user, hasNewMessage: true } : user
//             )
//           );
//         }
//         toast.info(notification.message);
//       }
//     );

//     return () => {
//       s.disconnect();
//     };
//   }, [selectedUser]);

//   // Register the current doctor for notifications
//   useEffect(() => {
//     if (socket && currentDoctor) {
//       socket.emit("register", { type: "doctor", id: currentDoctor.id });
//     }
//   }, [socket, currentDoctor]);

//   // Fetch current doctor and patient list on mount
//   useEffect(() => {
//     const storedDoctorId = sessionStorage.getItem("doctorId") || "";
//     setCurrentDoctor({
//       id: storedDoctorId,
//       name: "Dr. Current Doctor",
//       image: "",
//       speciality: "General Physician",
//     });

//     const fetchData = async () => {
//       try {
//         const { data } = await axiosInstance.get(`/doctor/appointment-users/${storedDoctorId}`);
//         const usersWithMessages = data.data.users.map((user: User) => ({
//           ...user,
//           hasNewMessage: false,
//         }));
//         setUsers(usersWithMessages);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };
//     fetchData();
//   }, []);

//   // Join a chat room when a patient is selected and mark conversation as read
//   useEffect(() => {
//     if (socket && selectedUser && currentDoctor) {
//       if (chatId) {
//         socket.emit("leave", chatId);
//       }
//       setChatId(null);
//       setCurrentMessages([]);
//       socket.emit("join:chat", {
//         userId: selectedUser._id,
//         doctorId: currentDoctor.id,
//       });
//       // Mark the selected conversation as read
//       setUsers((prevUsers) =>
//         prevUsers.map((user) =>
//           user._id === selectedUser._id ? { ...user, hasNewMessage: false } : user
//         )
//       );
//     }
//   }, [selectedUser, socket, currentDoctor]);

//   const handleUserSelect = (user: User) => {
//     setSelectedUser(user);
//   };

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(event.target.files || []);
//     setSelectedFiles((prevFiles) => {
//       const newFiles = files.filter(
//         (file) =>
//           !prevFiles.some(
//             (prevFile) =>
//               prevFile.name === file.name &&
//               prevFile.lastModified === file.lastModified
//           )
//       );
//       return [...prevFiles, ...newFiles];
//     });
//     event.target.value = "";
//   };

//   const handleRemoveFile = (index: number) => {
//     setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSendMessage = async () => {
//     if (
//       (!inputMessage.trim() && selectedFiles.length === 0) ||
//       !selectedUser ||
//       !chatId ||
//       !currentDoctor ||
//       !socket
//     )
//       return;

//     try {
//       // Send image attachments if any
//       if (selectedFiles.length > 0) {
//         for (const file of selectedFiles) {
//           const formData = new FormData();
//           formData.append("image", file);
//           const response = await axiosInstance.post(
//             `doctor/chatImgUploads/${chatId}`,
//             formData,
//             {
//               headers: { "Content-Type": "multipart/form-data" },
//             }
//           );
//           const { imageUrl, messageId, createdAt } = response.data.result;
//           socket.emit("message:send", {
//             chatId,
//             userId: selectedUser._id,
//             doctorId: currentDoctor.id,
//             sender: "doctor",
//             message: imageUrl,
//             type: "img",
//             _id: messageId,
//             createdAt,
//           });
//         }
//       }

//       // Send text message if provided
//       if (inputMessage.trim()) {
//         socket.emit("message:send", {
//           chatId,
//           userId: selectedUser._id,
//           doctorId: currentDoctor.id,
//           sender: "doctor",
//           message: inputMessage,
//           type: "txt",
//         });
//       }

//       setInputMessage("");
//       setSelectedFiles([]);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (error) {
//       console.error("Error sending message:", error);
//       toast.error("Failed to send message");
//     }
//   };

//   // Show delete confirmation modal
//   const showDeleteModal = (messageId: string) => {
//     setMessageToDelete(messageId);
//     setShowDeleteConfirm(true);
//   };

//   // Confirm deletion of message
//   const handleDeleteConfirm = () => {
//     if (!chatId || !socket || !currentDoctor || !messageToDelete) return;
//     socket.emit("message:delete", {
//       chatId,
//       messageId: messageToDelete,
//       sender: "doctor",
//     });
//     setShowDeleteConfirm(false);
//     setMessageToDelete(null);
//   };

//   const filteredUsers = users.filter((user) => {
//     return user.name.toLowerCase().includes(searchQuery.toLowerCase());
//   });

//   return (
//     <div className="flex h-screen">
//       <Sidebar onCollapse={setSidebarCollapsed} />
//       <ToastContainer position="top-right" autoClose={3000} />
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full animate-fadeIn transform transition-all">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Message</h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to delete this message? This action cannot be undone.
//             </p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => {
//                   setShowDeleteConfirm(false);
//                   setMessageToDelete(null);
//                 }}
//                 className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteConfirm}
//                 className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
//               >
//                 <Trash2 size={16} className="mr-2" />
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
//         <div className="flex flex-col md:flex-row w-full max-w-7xl h-[94vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 m-4 mx-auto">
//           {/* Left Sidebar: Patient List */}
//           <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white">
//             <div className="bg-gradient-to-r from-red-700 to-red-600 p-6 shadow-lg h-24 flex items-center justify-between">
//               <div className="flex items-center">
//                 <h2 className="text-white text-2xl font-bold">Healio Patients</h2>
//               </div>
//             </div>
//             {/* Search */}
//             <div className="p-4 bg-white shadow-sm">
//               <div className="flex items-center bg-white rounded-full shadow-md px-3 py-1 w-full border border-gray-100">
//                 <input
//                   type="text"
//                   placeholder="Search patients..."
//                   className="flex-grow bg-transparent outline-none text-gray-700 py-2 px-2 focus:ring-0"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   className="bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center ml-2 shadow-md hover:bg-red-700 transition-all"
//                 >
//                   <Search size={16} />
//                 </button>
//               </div>
//             </div>
//             <div className="flex-1 overflow-y-auto custom-scrollbar">
//               {filteredUsers.length > 0 ? (
//                 filteredUsers.map((user) => (
//                   <div
//                     key={user._id}
//                     className={`p-4 hover:bg-red-50 cursor-pointer transition-all duration-200 relative group ${
//                       selectedUser?._id === user._id ? "bg-red-50" : ""
//                     }`}
//                     onClick={() => handleUserSelect(user)}
//                   >
//                     {selectedUser?._id === user._id && (
//                       <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 rounded-r-full"></div>
//                     )}
//                     <div className="flex items-center space-x-4">
//                       <div className="relative">
//                         <img
//                           src={user.image || "https://via.placeholder.com/100"}
//                           alt={user.name}
//                           className="w-14 h-14 rounded-full object-cover border-2 border-red-100 shadow-md"
//                         />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex justify-between items-baseline">
//                           <h3 className="font-semibold text-green-800 truncate">{user.name}</h3>
//                           <span className="text-xs text-gray-500 font-medium">
//                             {user.lastMessageTime ? formatTime(user.lastMessageTime) : "New"}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-500 truncate mt-0.5">
//                           {user.lastMessage || "Start a conversation"}
//                         </p>
//                       </div>
//                       {user.hasNewMessage && (
//                         <div className="absolute right-4 top-4 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
//                           <span className="text-white text-xs font-bold">!</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="flex flex-col items-center justify-center h-40 text-gray-500 p-6">
//                   <Search size={24} className="mb-2 text-gray-400" />
//                   <p className="text-center">No matching patients found</p>
//                   <button
//                     onClick={() => {
//                       setSearchQuery("");
//                     }}
//                     className="mt-3 text-red-600 hover:underline text-sm font-medium"
//                   >
//                     Clear search
//                   </button>
//                 </div>
//               )}
//             </div>
//             <button className="m-4 p-3.5 text-gray-600 rounded-lg border border-gray-300 hover:bg-red-50 flex items-center justify-center space-x-2 transition-colors duration-200 hover:text-red-600 hover:border-red-400 shadow-sm">
//               <ArrowLeft size={20} />
//               <span className="font-medium">Back to Home</span>
//             </button>
//           </div>

//           {/* Right Chat Area */}
//           <div className="flex-1 flex flex-col bg-white">
//             {selectedUser ? (
//               <>
//                 {/* Chat Header */}
//                 <div className="bg-gradient-to-r from-red-600 to-red-500 p-5 flex items-center shadow-lg h-24">
//                   <div className="relative">
//                     <img
//                       src={selectedUser.image || "https://via.placeholder.com/100"}
//                       alt={selectedUser.name}
//                       className="w-16 h-16 rounded-full object-cover border-2 border-white bg-green-100 shadow-lg"
//                     />
//                   </div>
//                   <div className="ml-4">
//                     <h2 className="font-bold text-xl text-white">{selectedUser.name}</h2>
//                   </div>
//                   <div className="ml-auto flex items-center space-x-3">
//                     <button
//                       onClick={() => toast.info("Audio call feature coming soon!")}
//                       className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
//                       title="Audio Call"
//                     >
//                       <Phone size={18} />
//                     </button>
//                     <button
//                       onClick={() => toast.info("Video call feature coming soon!")}
//                       className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
//                       title="Video Call"
//                     >
//                       <Video size={18} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Chat Messages */}
//                 <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 bg-gradient-to-b from-green-50 to-green-100 custom-scrollbar">
//                   {currentMessages.length > 0 ? (
//                     currentMessages.map((message) => (
//                       <div
//                         key={message._id}
//                         className={`flex ${message.sender === "doctor" ? "justify-end" : "justify-start"} group`}
//                       >
//                         <div
//                           className={`max-w-[75%] rounded-2xl p-4 shadow-md relative ${
//                             message.sender === "doctor"
//                               ? message.deleted
//                                 ? "bg-gray-200 text-gray-500 rounded-tr-none"
//                                 : "bg-gradient-to-r from-green-600 to-green-500 text-white rounded-tr-none hover:shadow-lg transition-shadow"
//                               : message.deleted
//                               ? "bg-gray-200 text-gray-500 rounded-tl-none"
//                               : "bg-white text-green-800 rounded-tl-none border border-gray-200"
//                           }`}
//                         >
//                           {message.type === "img" ? (
//                             message.deleted ? (
//                               <p className="text-base italic text-gray-500">
//                                 This message was deleted
//                               </p>
//                             ) : (
//                               <img
//                                 src={message.message}
//                                 alt="Chat image"
//                                 className="max-w-full rounded-lg border-2 border-white shadow-sm"
//                                 onError={(e) => {
//                                   e.currentTarget.src = "/placeholder-image.jpg";
//                                 }}
//                               />
//                             )
//                           ) : (
//                             <p className="text-base break-words">
//                               {message.deleted ? "This message was deleted" : message.message}
//                             </p>
//                           )}
//                           <div
//                             className={`text-xs mt-2 flex justify-end items-center ${
//                               message.deleted
//                                 ? "text-gray-400"
//                                 : message.sender === "doctor"
//                                 ? "text-green-100"
//                                 : "text-gray-500"
//                             }`}
//                           >
//                             <Clock size={12} className="mr-1" />
//                             {formatTime(message.createdAt)}
//                           </div>
//                           {message.sender === "doctor" && !message.deleted && (
//                             <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
//                               <button
//                                 onClick={() => showDeleteModal(message._id)}
//                                 className="p-1.5 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
//                                 title="Delete message"
//                               >
//                                 <Trash2 size={14} />
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="flex flex-col items-center justify-center h-full text-gray-500">
//                       <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-full p-8 mb-4 shadow-lg">
//                         <MessageSquare size={40} className="text-red-600" />
//                       </div>
//                       <p className="text-lg font-medium text-gray-600">Start a conversation</p>
//                       <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">
//                         Your conversation will appear here
//                       </p>
//                     </div>
//                   )}
//                   <div ref={messagesEndRef} />
//                 </div>

//                 {/* Image Attachments Preview */}
//                 {selectedFiles.length > 0 && (
//                   <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
//                     {selectedFiles.map((file, index) => (
//                       <div key={index} className="relative group">
//                         <img
//                           src={URL.createObjectURL(file)}
//                           alt={`Selected file ${index + 1}`}
//                           className="h-20 w-20 object-cover rounded-lg border-2 border-green-200 shadow-md transition-transform transform group-hover:scale-105"
//                         />
//                         <button
//                           onClick={() => handleRemoveFile(index)}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform hover:scale-110"
//                         >
//                           <X size={14} />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Chat Input */}
//                 <div className="p-5 border-t border-gray-200 bg-white shadow-inner">
//                   <div className="flex items-center space-x-3">
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
//                       className="p-3.5 hover:bg-gray-100 text-gray-500 hover:text-green-600 rounded-full transition-all duration-200 transform hover:scale-110"
//                       title="Attach images"
//                     >
//                       <Paperclip size={22} />
//                     </button>
//                     <div className="flex-1 relative">
//                       <input
//                         type="text"
//                         value={inputMessage}
//                         onChange={(e) => setInputMessage(e.target.value)}
//                         placeholder="Type your message here..."
//                         className="w-full p-4 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-200 pl-5 pr-12"
//                         onKeyDown={(e) =>
//                           e.key === "Enter" &&
//                           (inputMessage.trim() || selectedFiles.length > 0) &&
//                           handleSendMessage()
//                         }
//                       />
//                     </div>
//                     <button
//                       onClick={handleSendMessage}
//                       disabled={!chatId || (!inputMessage.trim() && selectedFiles.length === 0)}
//                       className={`p-4 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 ${
//                         chatId && (inputMessage.trim() || selectedFiles.length > 0)
//                           ? "bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-xl"
//                           : "bg-gray-300 text-gray-100 cursor-not-allowed"
//                       }`}
//                       title="Send message"
//                     >
//                       <Send size={22} />
//                     </button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white to-green-50 p-8">
//                 <div className="text-center max-w-md">
//                   <div className="flex justify-center mb-8">
//                     <div className="h-36 w-36 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-xl">
//                       <MessageSquare size={64} className="text-white" />
//                     </div>
//                   </div>
//                   <h1 className="text-green-800 text-3xl font-bold mb-4">Welcome to Healio</h1>
//                   <p className="text-gray-600 mb-8 text-lg">
//                     Select a conversation from the left to start chatting with your patients. All medical conversations are secure and encrypted.
//                   </p>
//                   <div className="text-left bg-white p-6 rounded-xl shadow-xl border border-green-100">
//                     <div className="flex items-center mb-4">
//                       <Shield size={20} className="text-red-600 mr-2" />
//                       <h3 className="font-semibold text-green-700 text-lg">Premium Features:</h3>
//                     </div>
//                     <ul className="text-gray-600 space-y-3 text-md">
//                       <li className="flex items-center">
//                         <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
//                         Review patient-submitted photos to better assess conditions.
//                       </li>
//                       <li className="flex items-center">
//                         <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
//                         Access securely stored conversation history for efficient follow-up.
//                       </li>
//                       <li className="flex items-center">
//                         <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
//                         Schedule video consultations with patients directly through chat.
//                       </li>
//                       <li className="flex items-center">
//                         <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
//                         Receive and manage prescription updates seamlessly.
//                       </li>
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
  Shield,
  Clock,
  Trash2,
} from "lucide-react";
import io, { Socket } from "socket.io-client";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/doctorCommon/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import { BASE_URL } from "../../utils/configSetup";
import DoctorVideoCall from "./Video"; // <-- Your video call component

interface Message {
  _id: string;
  message: string;
  sender: "user" | "doctor";
  createdAt: string;
  type: "img" | "txt";
  deleted?: boolean;
}

interface User {
  _id: string;
  name: string;
  image: string;
  lastMessage?: string;
  lastMessageTime?: string;
  hasNewMessage?: boolean;
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
  const [filterOption, setFilterOption] = useState("all");

  // For video call modal
  const [showVideoCall, setShowVideoCall] = useState(false);

  // For delete confirmation modal
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ===== Utility function to format time =====
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "hh:mm a");
  };

  // ===== Auto-scroll to bottom on new messages =====
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // ===== Socket connection (runs once) =====
  useEffect(() => {
    const s: Socket = io(BASE_URL, {
      transports: ["websocket"],
      query: { token: localStorage.getItem("token") || "" },
    });
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("chat:history", (chat: any) => {
      if (chat && chat._id && selectedUser && String(chat.userId) === selectedUser._id) {
        setChatId(chat._id);
        setCurrentMessages(chat.messages || []);

        // Update last message/time in user list
        if (chat.messages && chat.messages.length > 0) {
          const lastMsg = chat.messages[chat.messages.length - 1];
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u._id === selectedUser._id
                ? { ...u, lastMessage: lastMsg.message, lastMessageTime: lastMsg.createdAt }
                : u
            )
          );
        }
      }
    });

    s.on("message:receive", (message: Message) => {
      setCurrentMessages((prev) => {
        // Avoid duplicate if the message already exists
        if (prev.some((msg) => msg._id === message._id)) return prev;
        return [...prev, message];
      });

      // Update last message/time for the selected user
      if (selectedUser) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === selectedUser._id
              ? { ...u, lastMessage: message.message, lastMessageTime: message.createdAt }
              : u
          )
        );
      }
    });

    // Handle message updates (e.g., deletion)
    s.on("message:updated", (data: { messageId: string; deleted: boolean }) => {
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

    // Handle chat errors
    s.on("chat:error", (data: { error: string }) => {
      toast.error(data.error);
    });

    // Notifications from patients
    s.on(
      "notification",
      (notification: {
        chatId: string;
        senderType: "user" | "doctor";
        senderId: string;
        message: string;
      }) => {
        if (notification.senderType === "user") {
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u._id === notification.senderId ? { ...u, hasNewMessage: true } : u
            )
          );
        }
        toast.info(notification.message);
      }
    );

    return () => {
      s.disconnect();
    };
  }, [selectedUser]);

  // ===== Register the current doctor for notifications =====
  useEffect(() => {
    if (socket && currentDoctor) {
      socket.emit("register", { type: "doctor", id: currentDoctor.id });
    }
  }, [socket, currentDoctor]);

  // ===== Fetch doctor & users on mount =====
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
        const { data } = await axiosInstance.get(`/doctor/appointment-users/${storedDoctorId}`);
        const usersWithMessages = data.data.users.map((user: User) => ({
          ...user,
          hasNewMessage: false,
        }));
        setUsers(usersWithMessages);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
  }, []);

  // ===== Join chat room when patient is selected =====
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

      // Mark conversation as read
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === selectedUser._id ? { ...u, hasNewMessage: false } : u
        )
      );
    }
  }, [selectedUser, socket, currentDoctor]);

  // ===== Handlers =====
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
      !selectedUser ||
      !chatId ||
      !currentDoctor ||
      !socket
    ) {
      return;
    }

    try {
      // Send image attachments if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("image", file);
          const response = await axiosInstance.post(`doctor/chatImgUploads/${chatId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
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

      // Send text message if provided
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

  // ===== Delete Confirmation Modal =====
  const showDeleteModal = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (!chatId || !socket || !currentDoctor || !messageToDelete) return;
    socket.emit("message:delete", {
      chatId,
      messageId: messageToDelete,
      sender: "doctor",
    });
    setShowDeleteConfirm(false);
    setMessageToDelete(null);
  };

  // ===== Filtered Users =====
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== Render =====
  return (
    <div className="flex h-screen">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Delete Confirmation Modal */}
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
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="flex flex-col md:flex-row w-full max-w-7xl h-[94vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 m-4 mx-auto">
          {/* Left Sidebar: Patient List */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white">
            <div className="bg-gradient-to-r from-red-700 to-red-600 p-6 shadow-lg h-24 flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-white text-2xl font-bold">Healio Patients</h2>
              </div>
            </div>
            {/* Search Bar */}
            <div className="p-4 bg-white shadow-sm">
              <div className="flex items-center bg-white rounded-full shadow-md px-3 py-1 w-full border border-gray-100">
                <input
                  type="text"
                  placeholder="Search patients..."
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
            {/* Patient List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`p-4 hover:bg-red-50 cursor-pointer transition-all duration-200 relative group ${
                      selectedUser?._id === user._id ? "bg-red-50" : ""
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    {selectedUser?._id === user._id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 rounded-r-full"></div>
                    )}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={user.image || "https://via.placeholder.com/100"}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-red-100 shadow-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold text-green-800 truncate">{user.name}</h3>
                          <span className="text-xs text-gray-500 font-medium">
                            {user.lastMessageTime ? formatTime(user.lastMessageTime) : "New"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {user.lastMessage || "Start a conversation"}
                        </p>
                      </div>
                      {user.hasNewMessage && (
                        <div className="absolute right-4 top-4 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 p-6">
                  <Search size={24} className="mb-2 text-gray-400" />
                  <p className="text-center">No matching patients found</p>
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

          {/* Right Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-500 p-5 flex items-center shadow-lg h-24">
                  <div className="relative">
                    <img
                      src={selectedUser.image || "https://via.placeholder.com/100"}
                      alt={selectedUser.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white bg-green-100 shadow-lg"
                    />
                  </div>
                  <div className="ml-4">
                    <h2 className="font-bold text-xl text-white">{selectedUser.name}</h2>
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
                      onClick={() => setShowVideoCall(true)}
                      className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      title="Video Call"
                    >
                      <Video size={18} />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 bg-gradient-to-b from-green-50 to-green-100 custom-scrollbar">
                  {currentMessages.length > 0 ? (
                    currentMessages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.sender === "doctor" ? "justify-end" : "justify-start"
                        } group`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-4 shadow-md relative ${
                            message.sender === "doctor"
                              ? message.deleted
                                ? "bg-gray-200 text-gray-500 rounded-tr-none"
                                : "bg-gradient-to-r from-green-600 to-green-500 text-white rounded-tr-none hover:shadow-lg transition-shadow"
                              : message.deleted
                              ? "bg-gray-200 text-gray-500 rounded-tl-none"
                              : "bg-white text-green-800 rounded-tl-none border border-gray-200"
                          }`}
                        >
                          {message.type === "img" ? (
                            message.deleted ? (
                              <p className="text-base italic text-gray-500">This message was deleted</p>
                            ) : (
                              <img
                                src={message.message}
                                alt="Chat image"
                                className="max-w-full rounded-lg border-2 border-white shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder-image.jpg";
                                }}
                              />
                            )
                          ) : (
                            <p className="text-base break-words">
                              {message.deleted ? "This message was deleted" : message.message}
                            </p>
                          )}
                          <div
                            className={`text-xs mt-2 flex justify-end items-center ${
                              message.deleted
                                ? "text-gray-400"
                                : message.sender === "doctor"
                                ? "text-green-100"
                                : "text-gray-500"
                            }`}
                          >
                            <Clock size={12} className="mr-1" />
                            {formatTime(message.createdAt)}
                          </div>
                          {message.sender === "doctor" && !message.deleted && (
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button
                                onClick={() => showDeleteModal(message._id)}
                                className="p-1.5 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
                                title="Delete message"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
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
                        Your conversation will appear here
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image Attachments Preview */}
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

                {/* Chat Input */}
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (inputMessage.trim() || selectedFiles.length > 0)) {
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatId || (!inputMessage.trim() && selectedFiles.length === 0)}
                      className={`p-4 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        chatId && (inputMessage.trim() || selectedFiles.length > 0)
                          ? "bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-xl"
                          : "bg-gray-300 text-gray-100 cursor-not-allowed"
                      }`}
                      title="Send message"
                    >
                      <Send size={22} />
                    </button>
                  </div>
                </div>

                {/* === VIDEO CALL MODAL === */}
                {showVideoCall && chatId && currentDoctor && (
                  <DoctorVideoCall
                    chatId={chatId}
                    doctorId={currentDoctor.id}
                    userId={selectedUser._id}
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
                    Select a conversation from the left to start chatting with your patients. All
                    medical conversations are secure and encrypted.
                  </p>
                  <div className="text-left bg-white p-6 rounded-xl shadow-xl border border-green-100">
                    <div className="flex items-center mb-4">
                      <Shield size={20} className="text-red-600 mr-2" />
                      <h3 className="font-semibold text-green-700 text-lg">Premium Features:</h3>
                    </div>
                    <ul className="text-gray-600 space-y-3 text-md">
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Review patient-submitted photos to better assess conditions.
                      </li>
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Access securely stored conversation history for efficient follow-up.
                      </li>
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Schedule video consultations with patients directly through chat.
                      </li>
                      <li className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                        Receive and manage prescription updates seamlessly.
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
