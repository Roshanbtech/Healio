import { AwsConfig } from "../config/s3Config";
export class awsFileUpload {
  constructor(private awsConfig: AwsConfig) {}
  async uploadCertificates(
    doctorId: string,
    certificates: Express.Multer.File[]
  ): Promise<string[]> {
    const uploadedCertificates: string[] = [];
    for (const certificate of certificates) {
      const certKey = `doctor/certificates/${doctorId}/`;
      const uploadedKey = await this.awsConfig.uploadFileToS3(
        certKey,
        certificate
      );
      const certUrl = await this.awsConfig.getfile(
        uploadedKey.split("/").pop()!,
        certKey
      );
      console.log(certUrl);
      uploadedCertificates.push(certUrl.split("?")[0]);
    }
    console.log(uploadedCertificates);
    return uploadedCertificates;
  }

  async uploadDoctorProfileImage(
    doctorId: string,
    profilePicture: Express.Multer.File
  ) {
    console.log("Helper - Doctor ID:", doctorId);
    const profileKey = `doctor/profile/${doctorId}/`;
    console.log("Helper - Profile Key:", profileKey);

    const uploadedKey = await this.awsConfig.uploadFileToS3(
      profileKey,
      profilePicture
    );
    console.log("Helper - Uploaded Key:", uploadedKey);

    const profileUrl = await this.awsConfig.getfile(
      uploadedKey.split("/").pop()!,
      profileKey
    );
    console.log("Helper - Profile URL:", profileUrl);

    return profileUrl.split("?")[0];
  }

  async uploadUserProfileImage(
    userId: string,
    profilePicture: Express.Multer.File
  ) {
    console.log("Helper - User ID:", userId);
    const profileKey = `user/profile/${userId}/`;
    console.log("Helper - Profile Key:", profileKey);

    const uploadedKey = await this.awsConfig.uploadFileToS3(
      profileKey,
      profilePicture
    );
    console.log("Helper - Uploaded Key:", uploadedKey);

    const profileUrl = await this.awsConfig.getfile(
      uploadedKey.split("/").pop()!,
      profileKey
    );
    console.log("Helper - Profile URL:", profileUrl);

    return profileUrl.split("?")[0];
  }

  async uploadChatImage(
    chatId: string,
    image: Express.Multer.File
  ): Promise<string> {
    try {
      console.log("Helper - Chat ID:", chatId);
      const chatImageKey = `chat/${chatId}/images/`;
      console.log("Helper - Chat Image Key:", chatImageKey);

      const uploadedKey = await this.awsConfig.uploadFileToS3(
        chatImageKey,
        image
      );
      console.log("Helper - Uploaded Key:", uploadedKey);

      const imageUrl = await this.awsConfig.getfile(
        uploadedKey.split("/").pop()!,
        chatImageKey
      );
      console.log("Helper - Image URL:", imageUrl);

      return imageUrl.split("?")[0];
    } catch (error) {
      console.error("Error uploading chat image:", error);
      throw error;
    }
  }
}
