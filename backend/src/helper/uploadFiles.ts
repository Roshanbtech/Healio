import {AwsConfig} from "../config/s3Config";
export class awsFileUpload {
    constructor(private awsConfig: AwsConfig) {
    }
    async uploadCertificates(
        doctorId: string,
        certificates: Express.Multer.File[]
      ): Promise<string[]> {
        const uploadedCertificates: string[] = [];
        for (const certificate of certificates) {
          const certKey = `doctor/certificates/${doctorId}/`;
          const uploadedKey = await this.awsConfig.uploadFileToS3(certKey, certificate);
          const certUrl = await this.awsConfig.getfile(uploadedKey.split("/").pop()!, certKey);
          console.log(certUrl);
          uploadedCertificates.push(certUrl.split("?")[0]);
        }
        console.log(uploadedCertificates);
        return uploadedCertificates;
      }
}

