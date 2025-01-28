import { Document, model, Schema } from "mongoose";

interface IImage {
    url: string;
    type: string;
}

interface Iuser extends Document {
    userId: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    DOB: Date;
    address: string;
    image: IImage;
    lastLogin: Date;
    isBlocked: boolean;
}

const userSchema = new Schema<Iuser>({
    userId: { 
        type: String, 
        required: true,
        unique: true 
    },
    name: { 
        type: String,
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    password: {
        type: String, 
        required: true 
    },
    lastLogin: {
        type: Date 
    },
    DOB: {
        type: Date,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    image: {
        
            url: { type: String, default: "" }, 
            type: { type: String, default: "" },
    },
    isBlocked: {
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

const userModel = model<Iuser>("User", userSchema);

export default userModel;