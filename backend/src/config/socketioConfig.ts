import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import ChatModel from "../model/chatModel";

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

    socket.on("join:chat", async (data) => {
      try {
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
          attachments: data.attachments || [], // Include attachments
          deleted: false,
          read: false,
        };

        chat.messages.push(newMessage as any);
        await chat.save();

        // Send the saved message, including _id and timestamp
        const savedMessage = chat.messages[chat.messages.length - 1];
        io.to(data.chatId).emit("message:receive", savedMessage);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("message:error", { error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};