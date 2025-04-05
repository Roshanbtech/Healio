"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awsFileUpload = void 0;
class awsFileUpload {
    constructor(awsConfig) {
        this.awsConfig = awsConfig;
    }
    async getPresignedUrl(filename, folder) {
        return this.awsConfig.getfile(filename, folder);
    }
    async uploadCertificates(doctorId, certificates) {
        const uploadedCertificates = [];
        for (const certificate of certificates) {
            const certKey = `doctor/certificates/${doctorId}/`;
            const uploadedKey = await this.awsConfig.uploadFileToS3(certKey, certificate);
            const certUrl = await this.awsConfig.getfile(uploadedKey.split("/").pop(), certKey);
            console.log(certUrl);
            uploadedCertificates.push(certUrl.split("?")[0]);
        }
        console.log(uploadedCertificates);
        return uploadedCertificates;
    }
    async uploadPrescriptionSignature(doctorId, signature) {
        console.log("Helper - Doctor ID:", doctorId);
        const signatureKey = `doctor/signature/${doctorId}/`;
        console.log("Helper - Signature Key:", signatureKey);
        const uploadedKey = await this.awsConfig.uploadFileToS3(signatureKey, signature);
        console.log("Helper - Uploaded Key:", uploadedKey);
        // const signatureUrl = await this.awsConfig.getfile(
        //   uploadedKey.split("/").pop()!,
        //   signatureKey
        // );
        // return signatureUrl.split("?")[0];
        return uploadedKey;
    }
    async uploadDoctorProfileImage(doctorId, profilePicture) {
        console.log("Helper - Doctor ID:", doctorId);
        const profileKey = `doctor/profile/${doctorId}/`;
        console.log("Helper - Profile Key:", profileKey);
        const uploadedKey = await this.awsConfig.uploadFileToS3(profileKey, profilePicture);
        console.log("Helper - Uploaded Key:", uploadedKey);
        // const profileUrl = await this.awsConfig.getfile(
        //   uploadedKey.split("/").pop()!,
        //   profileKey
        // );
        // console.log("Helper - Profile URL:", profileUrl);
        // return profileUrl.split("?")[0];
        return uploadedKey;
    }
    async uploadUserProfileImage(userId, profilePicture) {
        console.log("Helper - User ID:", userId);
        const profileKey = `user/profile/${userId}/`;
        console.log("Helper - Profile Key:", profileKey);
        const uploadedKey = await this.awsConfig.uploadFileToS3(profileKey, profilePicture);
        console.log("Helper - Uploaded Key:", uploadedKey);
        // const profileUrl = await this.awsConfig.getfile(
        //   uploadedKey.split("/").pop()!,
        //   profileKey
        // );
        // console.log("Helper - Profile URL:", profileUrl);
        // return profileUrl.split("?")[0];
        return uploadedKey;
    }
    async uploadChatImage(chatId, image) {
        try {
            console.log("Helper - Chat ID:", chatId);
            const chatImageKey = `chat/${chatId}/images/`;
            console.log("Helper - Chat Image Key:", chatImageKey);
            const uploadedKey = await this.awsConfig.uploadFileToS3(chatImageKey, image);
            console.log("Helper - Uploaded Key:", uploadedKey);
            // const imageUrl = await this.awsConfig.getfile(
            //   uploadedKey.split("/").pop()!,
            //   chatImageKey
            // );
            // console.log("Helper - Image URL:", imageUrl);
            // return imageUrl.split("?")[0];
            return uploadedKey;
        }
        catch (error) {
            console.error("Error uploading chat image:", error);
            throw error;
        }
    }
}
exports.awsFileUpload = awsFileUpload;
