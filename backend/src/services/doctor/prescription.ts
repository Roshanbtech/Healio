import { IPrescription } from "../../model/prescriptionModel";
import { IPrescriptionRepository } from "../../interface/doctor/Prescription.repository.interface";
import { IPrescriptionService } from "../../interface/doctor/Prescription.service.interface";
import AppointmentModel from "../../model/appointmentModel"; 
// import { awsFileUpload } from "../../helper/uploadFiles";
// import { AwsConfig } from "../../config/s3Config";
import { CloudinaryFileUpload } from "../../helper/uploadFile"; 
import { CloudinaryConfig } from "../../config/cloudinaryConfig";
import mongoose from "mongoose";

export class PrescriptionService implements IPrescriptionService {
  private prescriptionRepository: IPrescriptionRepository;
  // private aws: awsFileUpload;
  private fileUploadService: CloudinaryFileUpload;

  constructor(prescriptionRepository: IPrescriptionRepository,) {
    this.prescriptionRepository = prescriptionRepository;
    // this.aws = new awsFileUpload(new AwsConfig());
    this.fileUploadService = new CloudinaryFileUpload(new CloudinaryConfig());
  }

  async addPrescription(data: Partial<IPrescription>): Promise<IPrescription> {
    try {
      // If the signature field is a file (not a URL string), upload it.
      if (data.signature && typeof data.signature !== "string") {
        const file = data.signature as unknown as Express.Multer.File;
        const uploadedUrl = await this.fileUploadService.uploadPrescriptionSignature(
          data.doctorId as unknown as string,
          data.signature as unknown as Express.Multer.File
        );
        data.signature = uploadedUrl;
      }

      const prescription = await this.prescriptionRepository.addPrescription(data);

      await AppointmentModel.findOneAndUpdate(
        { _id: data.appointmentId },
        { prescription: prescription._id },
        { new: true }
      );

      return prescription;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to add prescription: ${error.message}`);
      } else {
        throw new Error("An unexpected error occurred while adding prescription.");
      }
    }
    
  }
}


