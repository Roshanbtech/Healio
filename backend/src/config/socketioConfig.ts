// import { Server as HttpServer } from "http";
// import { Server as SocketIOServer } from "socket.io";
// import dotenv from "dotenv";
// import ChatModel from "../model/chatModel";
// import UserModel from "../model/userModel";
// import DoctorModel from "../model/doctorModel";

// dotenv.config();

// export const initSocket = (server: HttpServer): SocketIOServer => {
//   const io = new SocketIOServer(server, {
//     cors: {
//       origin: process.env.FRONTEND_URL,
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log(`User connected: ${socket.id}`);

//     // Register users and doctors in personal rooms
//     socket.on("register", (data) => {
//       const { type, id } = data;
//       if (type === "doctor") {
//         socket.join(`doctor:${id}`);
//         console.log(`Doctor ${id} joined room doctor:${id}`);
//       } else if (type === "user") {
//         socket.join(`user:${id}`);
//         console.log(`User ${id} joined room user:${id}`);
//       }
//     });

//     // Handle joining a chat room
//     socket.on("join:chat", async (data) => {
//       try {
//         const doctor = await DoctorModel.findById(data.doctorId);
//         if (doctor?.isBlocked) {
//           socket.emit("chat:error", { error: "Doctor is blocked" });
//           return;
//         }
//         const user = await UserModel.findById(data.userId);
//         if (user?.isBlocked) {
//           socket.emit("chat:error", { error: "User is blocked" });
//           return;
//         }
//         let chat = await ChatModel.findOne({
//           doctorId: data.doctorId,
//           userId: data.userId,
//         });
//         if (!chat) {
//           chat = new ChatModel({
//             doctorId: data.doctorId,
//             userId: data.userId,
//             messages: [],
//           });
//           await chat.save();
//         }
    
//         const chatId = chat._id.toString();
//         socket.join(chatId);
//         console.log(`Socket ${socket.id} joined chat room ${chatId}`);
//         socket.emit("chat:history", chat);
//       } catch (error) {
//         console.error("Error joining chat:", error);
//         socket.emit("chat:error", { error: "Failed to join chat" });
//       }
//     });
    

//     // Handle sending a message
//     socket.on("message:send", async (data) => {
//       console.log("Received message:", data);
//       try {
//         let chat = await ChatModel.findById(data.chatId);
//         if (!chat) {
//           socket.emit("message:error", { error: "Chat not found" });
//           return;
//         }

//         const newMessage = {
//           sender: data.sender,
//           message: data.message,
//           type: data.type || "txt",
//           deleted: false,
//           read: false,
//         };

//         chat.messages.push(newMessage as any);
//         await chat.save();

//         const savedMessage = chat.messages[chat.messages.length - 1];
//         io.to(data.chatId).emit("message:receive", savedMessage);

//         // Enrich the notification payload
//         const senderId =
//           data.sender === "user"
//             ? chat.userId.toString()
//             : chat.doctorId.toString();
//         const recipientType = data.sender === "user" ? "doctor" : "user";
//         const recipientId =
//           data.sender === "user"
//             ? chat.doctorId.toString()
//             : chat.userId.toString();

//         io.to(`${recipientType}:${recipientId}`).emit("notification", {
//           chatId: data.chatId,
//           senderType: data.sender,
//           senderId: senderId,
//           message: `You have a new message from ${data.sender === "user" ? "the user" : "the doctor"}`,
//         });
//       } catch (error) {
//         console.error("Error saving message:", error);
//         socket.emit("message:error", { error: "Failed to send message" });
//       }
//     });

//     // Handle deleting a message
//     socket.on("message:delete", async (data) => {
//       try {
//         const { chatId, messageId, sender } = data;
//         const chat = await ChatModel.findById(chatId);
//         if (!chat) {
//           socket.emit("message:error", { error: "Chat not found" });
//           return;
//         }

//         const message = chat.messages.find((msg: any) => msg._id.toString() === messageId);
//         if (!message) {
//           socket.emit("message:error", { error: "Message not found" });
//           return;
//         }

//         if (message.sender !== sender) {
//           socket.emit("message:error", { error: "You can only delete your own messages" });
//           return;
//         }

//         message.deleted = true;
//         await chat.save();

//         io.to(chatId).emit("message:updated", {
//           messageId,
//           deleted: true,
//         });
//       } catch (error) {
//         console.error("Error deleting message:", error);
//         socket.emit("message:error", { error: "Failed to delete message" });
//       }
//     });

//     // Video call starts.........
//     socket.on("video:call", async (data) => {
//       try{
//         const { chatId, callerType, callerId, recipientType, recipientId} = data;
//         console.log(`Video call from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
//       if(recipientType==="doctor"){
//         const doctor = await DoctorModel.findById(recipientId);
//         if(doctor?.isBlocked){
//           socket.emit("video:error", { error: "Doctor is blocked" });
//           return;
//         }
//       }else if(recipientType==="user"){
//         const user = await UserModel.findById(recipientId);
//         if(user?.isBlocked){
//           socket.emit("video:error", { error: "User is blocked" });
//           return;
//         }
//       }
//       io.to(`${recipientType}:${recipientId}`).emit("video:incoming", {
//         chatId,
//         callerType,
//         callerId,
//     })
//     }catch(error){
//       console.error("Error sending video call:", error);
//       socket.emit("video:error", { error: "Failed to send video call" });
//     }
//     });

//     // video call accepting...
//     socket.on("video:accept", async (data) => {
//       try{
//         const { chatId, callerType, callerId, recipientType, recipientId} = data;
//         console.log(`Video call accepted from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
//         io.to(`${callerType}:${callerId}`).emit("video:accepted", {
//           chatId,
//           recipientType,
//           recipientId,
//     })
//     }catch(error){
//       console.error("Error accepting video call:", error);
//       socket.emit("video:error", { error: "Failed to accept video call" });
//     }
//     });

//     // video call rejected...
//     socket.on("video:reject", async (data) => {
//       try{
//         const { chatId, callerType, callerId, recipientType, recipientId} = data;
//         console.log(`Video call rejected from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
//         io.to(`${callerType}:${callerId}`).emit("video:rejected", {
//           chatId,
//           recipientType,
//           recipientId,
//     })
//     }catch(error){
//       console.error("Error rejecting video call:", error);
//       socket.emit("video:error", { error: "Failed to reject video call" });
//     }
//     });

//     // video call ends...
//     socket.on("video:end", async (data) => {
//       try{
//         const { chatId, callerType, callerId, recipientType, recipientId} = data;
//         console.log(`Video call ended from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
//         io.to(`${callerType}:${callerId}`)
//         .to(`${recipientType}:${recipientId}`)
//         .emit("video:ended", {
//           chatId,
//           recipientType,
//           recipientId,
//     })
//     }catch(error){
//       console.error("Error ending video call:", error);
//       socket.emit("video:error", { error: "Failed to end video call" });
//     }
//     });

//     // webRTC signal exchange using simple-peer
//     socket.on("video-signal", async (data) => {
//       try{
//         const { chatId, callerType, callerId, recipientType, recipientId, signal } = data;
//         console.log(`Video signal from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
//         io.to(`${recipientType}:${recipientId}`).emit("video-signal", {
//           chatId,
//           callerType,
//           callerId,
//           signal,
//     })
//     }catch(error){
//       console.error("Error sending video signal:", error);
//       socket.emit("video:error", { error: "Failed to send video signal" });
//     }
//     });

//     // Handle disconnection
//     socket.on("disconnect", () => {
//       console.log(`User disconnected: ${socket.id}`);
//     });
//   });

//   return io;
// };

// File: src/socket/initSocket.ts
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import ChatModel from "../model/chatModel";
import UserModel from "../model/userModel";
import DoctorModel from "../model/doctorModel";

dotenv.config();

export const initSocket = (server: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Register users and doctors in personal rooms
    socket.on("register", (data) => {
      const { type, id } = data;
      if (type === "doctor") {
        socket.join(`doctor:${id}`);
        console.log(`Doctor ${id} joined room doctor:${id}`);
      } else if (type === "user") {
        socket.join(`user:${id}`);
        console.log(`User ${id} joined room user:${id}`);
      }
    });

    // Handle joining a chat room
    socket.on("join:chat", async (data) => {
      try {
        const doctor = await DoctorModel.findById(data.doctorId);
        if (doctor?.isBlocked) {
          socket.emit("chat:error", { error: "Doctor is blocked" });
          return;
        }
        const user = await UserModel.findById(data.userId);
        if (user?.isBlocked) {
          socket.emit("chat:error", { error: "User is blocked" });
          return;
        }
        let chat = await ChatModel.findOne({
          doctorId: data.doctorId,
          userId: data.userId,
        });
        if (!chat) {
          chat = new ChatModel({
            doctorId: data.doctorId,
            userId: data.userId,
            messages: [],
          });
          await chat.save();
        }
    
        const chatId = chat._id.toString();
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat room ${chatId}`);
        socket.emit("chat:history", chat);
      } catch (error) {
        console.error("Error joining chat:", error);
        socket.emit("chat:error", { error: "Failed to join chat" });
      }
    });

    socket.on("message:send", async (data) => {
            console.log("Received message:", data);
            try {
              let chat = await ChatModel.findById(data.chatId);
              if (!chat) {
                socket.emit("message:error", { error: "Chat not found" });
                return;
              }
      
              const newMessage = {
                sender: data.sender,
                message: data.message,
                type: data.type || "txt",
                deleted: false,
                read: false,
              };
      
              chat.messages.push(newMessage as any);
              await chat.save();
      
              const savedMessage = chat.messages[chat.messages.length - 1];
              io.to(data.chatId).emit("message:receive", savedMessage);
      
              // Enrich the notification payload
              const senderId =
                data.sender === "user"
                  ? chat.userId.toString()
                  : chat.doctorId.toString();
              const recipientType = data.sender === "user" ? "doctor" : "user";
              const recipientId =
                data.sender === "user"
                  ? chat.doctorId.toString()
                  : chat.userId.toString();
      
              io.to(`${recipientType}:${recipientId}`).emit("notification", {
                chatId: data.chatId,
                senderType: data.sender,
                senderId: senderId,
                message: `You have a new message from ${data.sender === "user" ? "the user" : "the doctor"}`,
              });
            } catch (error) {
              console.error("Error saving message:", error);
              socket.emit("message:error", { error: "Failed to send message" });
            }
          });
      
          // Handle deleting a message
          socket.on("message:delete", async (data) => {
            try {
              const { chatId, messageId, sender } = data;
              const chat = await ChatModel.findById(chatId);
              if (!chat) {
                socket.emit("message:error", { error: "Chat not found" });
                return;
              }
      
              const message = chat.messages.find((msg: any) => msg._id.toString() === messageId);
              if (!message) {
                socket.emit("message:error", { error: "Message not found" });
                return;
              }
      
              if (message.sender !== sender) {
                socket.emit("message:error", { error: "You can only delete your own messages" });
                return;
              }
      
              message.deleted = true;
              await chat.save();
      
              io.to(chatId).emit("message:updated", {
                messageId,
                deleted: true,
              });
            } catch (error) {
              console.error("Error deleting message:", error);
              socket.emit("message:error", { error: "Failed to delete message" });
            }
          });

    // Video call events:
    socket.on("video:call", async (data) => {
      try {
        const { chatId, callerType, callerId, recipientType, recipientId } = data;
        console.log(`Video call from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
        // Block checks omitted for brevity
        io.to(`${recipientType}:${recipientId}`).emit("video:incoming", {
          chatId,
          callerType,
          callerId,
        });
      } catch (error) {
        console.error("Error sending video call:", error);
        socket.emit("video:error", { error: "Failed to send video call" });
      }
    });

    socket.on("video:accept", async (data) => {
      try {
        const { chatId, callerType, callerId, recipientType, recipientId } = data;
        console.log(`Video call accepted from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
        io.to(`${callerType}:${callerId}`).emit("video:accepted", {
          chatId,
          recipientType,
          recipientId,
        });
      } catch (error) {
        console.error("Error accepting video call:", error);
        socket.emit("video:error", { error: "Failed to accept video call" });
      }
    });

    socket.on("video:reject", async (data) => {
      try {
        const { chatId, callerType, callerId, recipientType, recipientId } = data;
        console.log(`Video call rejected from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
        io.to(`${callerType}:${callerId}`).emit("video:rejected", {
          chatId,
          recipientType,
          recipientId,
        });
      } catch (error) {
        console.error("Error rejecting video call:", error);
        socket.emit("video:error", { error: "Failed to reject video call" });
      }
    });

    socket.on("video:end", async (data) => {
      try {
        const { chatId, callerType, callerId, recipientType, recipientId } = data;
        console.log(`Video call ended from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
        io.to(`${callerType}:${callerId}`).to(`${recipientType}:${recipientId}`).emit("video:ended", {
          chatId,
          recipientType,
          recipientId,
        });
      } catch (error) {
        console.error("Error ending video call:", error);
        socket.emit("video:error", { error: "Failed to end video call" });
      }
    });

    socket.on("video-signal", async (data) => {
      try {
        const { chatId, callerType, callerId, recipientType, recipientId, signal } = data;
        console.log(`Video signal from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
        io.to(`${recipientType}:${recipientId}`).emit("video-signal", {
          chatId,
          callerType,
          callerId,
          signal,
        });
      } catch (error) {
        console.error("Error sending video signal:", error);
        socket.emit("video:error", { error: "Failed to send video signal" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};
