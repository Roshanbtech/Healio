import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryConfig {
  async uploadFile(folderPath: string, file: Express.Multer.File): Promise<string> {
    let resourceType: "image" | "raw" | "video" | "auto" = "auto";
    if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      resourceType = "raw";
    }

    const originalName = file.originalname;
    const fileExtension = originalName.split(".").pop();
    const baseName = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    const uploadOptions: any = {
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
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result?.secure_url!);
        }
      ).end(file.buffer);
    });
  }
}
