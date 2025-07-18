"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryConfig = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class CloudinaryConfig {
    async uploadFile(folderPath, file) {
        let resourceType = "auto";
        if (file.mimetype.startsWith("image/")) {
            resourceType = "image";
        }
        else if (file.mimetype === "application/pdf" ||
            file.mimetype === "application/msword" ||
            file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            resourceType = "raw";
        }
        const originalName = file.originalname;
        const fileExtension = originalName.split(".").pop();
        const baseName = originalName
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9-_]/g, "_");
        const uploadOptions = {
            folder: folderPath,
            resource_type: resourceType,
            public_id: baseName,
            type: "upload",
        };
        if (resourceType === "raw") {
            uploadOptions.format = fileExtension;
            uploadOptions.access_mode = "public";
        }
        return new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result?.secure_url);
            }).end(file.buffer);
        });
    }
}
exports.CloudinaryConfig = CloudinaryConfig;
