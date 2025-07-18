import { CloudinaryConfig } from "../config/cloudinaryConfig";
import {Express} from "express";


export class CloudinaryFileUpload {
  constructor(private cloudinaryConfig: CloudinaryConfig) {}

  async uploadCertificates(doctorId: string, certificates: Express.Multer.File[]): Promise<string[]> {
    const uploadedCertificates: string[] = [];
    for (const certificate of certificates) {
      const certKey = `doctor/certificates/${doctorId}`;
      const uploadedUrl = await this.cloudinaryConfig.uploadFile(certKey, certificate);
      uploadedCertificates.push(uploadedUrl);
    }
    return uploadedCertificates;
  }

  async uploadPrescriptionSignature(doctorId: string, signature: Express.Multer.File) {
    const signatureKey = `doctor/signature/${doctorId}`;
    const uploadedUrl = await this.cloudinaryConfig.uploadFile(signatureKey, signature);
    return uploadedUrl;
  }

  async uploadDoctorProfileImage(doctorId: string, profilePicture: Express.Multer.File) {
    const profileKey = `doctor/profile/${doctorId}`;
    const uploadedUrl = await this.cloudinaryConfig.uploadFile(profileKey, profilePicture);
    return uploadedUrl;
  }

  async uploadUserProfileImage(userId: string, profilePicture: Express.Multer.File) {
    const profileKey = `user/profile/${userId}`;
    const uploadedUrl = await this.cloudinaryConfig.uploadFile(profileKey, profilePicture);
    return uploadedUrl;
  }

  async uploadChatImage(chatId: string, image: Express.Multer.File): Promise<string> {
    const chatImageKey = `chat/${chatId}/images`;
    const uploadedUrl = await this.cloudinaryConfig.uploadFile(chatImageKey, image);
    return uploadedUrl;
  }
}
