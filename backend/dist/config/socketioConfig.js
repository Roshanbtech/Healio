"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const chatModel_1 = __importDefault(require("../model/chatModel"));
const userModel_1 = __importDefault(require("../model/userModel"));
const doctorModel_1 = __importDefault(require("../model/doctorModel"));
dotenv_1.default.config();
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
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
            }
            else if (type === "user") {
                socket.join(`user:${id}`);
                console.log(`User ${id} joined room user:${id}`);
            }
        });
        // Handle joining a chat room
        socket.on("join:chat", async (data) => {
            try {
                const doctor = await doctorModel_1.default.findById(data.doctorId);
                if (doctor?.isBlocked) {
                    socket.emit("chat:error", { error: "Doctor is blocked" });
                    return;
                }
                const user = await userModel_1.default.findById(data.userId);
                if (user?.isBlocked) {
                    socket.emit("chat:error", { error: "User is blocked" });
                    return;
                }
                let chat = await chatModel_1.default.findOne({
                    doctorId: data.doctorId,
                    userId: data.userId,
                });
                if (!chat) {
                    chat = new chatModel_1.default({
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
            }
            catch (error) {
                console.error("Error joining chat:", error);
                socket.emit("chat:error", { error: "Failed to join chat" });
            }
        });
        socket.on("message:send", async (data) => {
            console.log("Received message:", data);
            try {
                let chat = await chatModel_1.default.findById(data.chatId);
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
                chat.messages.push(newMessage);
                await chat.save();
                const savedMessage = chat.messages[chat.messages.length - 1];
                io.to(data.chatId).emit("message:receive", savedMessage);
                // Enrich the notification payload
                const senderId = data.sender === "user"
                    ? chat.userId.toString()
                    : chat.doctorId.toString();
                const recipientType = data.sender === "user" ? "doctor" : "user";
                const recipientId = data.sender === "user"
                    ? chat.doctorId.toString()
                    : chat.userId.toString();
                io.to(`${recipientType}:${recipientId}`).emit("notification", {
                    chatId: data.chatId,
                    senderType: data.sender,
                    senderId: senderId,
                    message: `You have a new message from ${data.sender === "user" ? "the user" : "the doctor"}`,
                });
            }
            catch (error) {
                console.error("Error saving message:", error);
                socket.emit("message:error", { error: "Failed to send message" });
            }
        });
        // Handle deleting a message
        socket.on("message:delete", async (data) => {
            try {
                const { chatId, messageId, sender } = data;
                const chat = await chatModel_1.default.findById(chatId);
                if (!chat) {
                    socket.emit("message:error", { error: "Chat not found" });
                    return;
                }
                const message = chat.messages.find((msg) => msg._id.toString() === messageId);
                if (!message) {
                    socket.emit("message:error", { error: "Message not found" });
                    return;
                }
                if (message.sender !== sender) {
                    socket.emit("message:error", {
                        error: "You can only delete your own messages",
                    });
                    return;
                }
                message.deleted = true;
                await chat.save();
                io.to(chatId).emit("message:updated", {
                    messageId,
                    deleted: true,
                });
            }
            catch (error) {
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
            }
            catch (error) {
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
            }
            catch (error) {
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
            }
            catch (error) {
                console.error("Error rejecting video call:", error);
                socket.emit("video:error", { error: "Failed to reject video call" });
            }
        });
        socket.on("video:end", async (data) => {
            try {
                const { chatId, callerType, callerId, recipientType, recipientId } = data;
                console.log(`Video call ended from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
                io.to(`${callerType}:${callerId}`)
                    .to(`${recipientType}:${recipientId}`)
                    .emit("video:ended", {
                    chatId,
                    recipientType,
                    recipientId,
                });
            }
            catch (error) {
                console.error("Error ending video call:", error);
                socket.emit("video:error", { error: "Failed to end video call" });
            }
        });
        // socket.on("video-signal", async (data) => {
        //   try {
        //     const { chatId, callerType, callerId, recipientType, recipientId, signal } = data;
        //     console.log(`Video signal from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`);
        //     io.to(`${recipientType}:${recipientId}`).emit("video-signal", {
        //       chatId,
        //       callerType,
        //       callerId,
        //       signal,
        //     });
        //   } catch (error) {
        //     console.error("Error sending video signal:", error);
        //     socket.emit("video:error", { error: "Failed to send video signal" });
        //   }
        // });
        socket.on("video-signal", async (data) => {
            try {
                const { chatId, callerType, callerId, recipientType, recipientId, signal, } = data;
                console.log(`Video signal from ${callerType}:${callerId} to ${recipientType}:${recipientId} in chat ${chatId}`, signal);
                io.to(`${recipientType}:${recipientId}`).emit("video-signal", {
                    chatId,
                    callerType,
                    callerId,
                    signal,
                });
            }
            catch (error) {
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
exports.initSocket = initSocket;
