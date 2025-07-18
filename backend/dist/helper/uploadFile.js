"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryFileUpload = void 0;
class CloudinaryFileUpload {
    constructor(cloudinaryConfig) {
        this.cloudinaryConfig = cloudinaryConfig;
    }
    async uploadCertificates(doctorId, certificates) {
        const uploadedCertificates = [];
        for (const certificate of certificates) {
            const certKey = `doctor/certificates/${doctorId}`;
            const uploadedUrl = await this.cloudinaryConfig.uploadFile(certKey, certificate);
            uploadedCertificates.push(uploadedUrl);
        }
        return uploadedCertificates;
    }
    async uploadPrescriptionSignature(doctorId, signature) {
        const signatureKey = `doctor/signature/${doctorId}`;
        const uploadedUrl = await this.cloudinaryConfig.uploadFile(signatureKey, signature);
        return uploadedUrl;
    }
    async uploadDoctorProfileImage(doctorId, profilePicture) {
        const profileKey = `doctor/profile/${doctorId}`;
        const uploadedUrl = await this.cloudinaryConfig.uploadFile(profileKey, profilePicture);
        return uploadedUrl;
    }
    async uploadUserProfileImage(userId, profilePicture) {
        const profileKey = `user/profile/${userId}`;
        const uploadedUrl = await this.cloudinaryConfig.uploadFile(profileKey, profilePicture);
        return uploadedUrl;
    }
    async uploadChatImage(chatId, image) {
        const chatImageKey = `chat/${chatId}/images`;
        const uploadedUrl = await this.cloudinaryConfig.uploadFile(chatImageKey, image);
        return uploadedUrl;
    }
}
exports.CloudinaryFileUpload = CloudinaryFileUpload;
