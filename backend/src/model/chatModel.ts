import mongoose, { Document, Schema, model } from "mongoose";

interface IMessage extends Document {
  sender: "user" | "doctor";
  message: string;
  type: "img" | "txt";
  deleted: boolean;
  read: boolean;
}

interface IChat extends Document {
  _id: string;
  doctorId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  messages: IMessage[];
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: String,
      enum: ["user", "doctor"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["img", "txt"],
      default: "txt",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ChatSchema = new Schema<IChat>(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

ChatSchema.index({ doctorId: 1, userId: 1 });

const ChatModel = model<IChat>("Chat", ChatSchema);

export default ChatModel;
