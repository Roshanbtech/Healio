import { doctorType } from "../../interface/doctorInterface/Interface";
import { IDoctorService } from "../../interface/doctor/Auth.service.interface";
import { IDoctorRepository } from "../../interface/doctor/Auth.repository.interface";
import { Service } from "../../interface/doctorInterface/Interface";
import { awsFileUpload } from "../../helper/uploadFiles";
import { AwsConfig } from "../../config/s3Config";

export class DoctorService implements IDoctorService {
  private DoctorRepository: IDoctorRepository;

  private doctorData: doctorType | null = null;
  private fileUploadService: awsFileUpload;

  constructor(DoctorRepository: IDoctorRepository) {
    this.DoctorRepository = DoctorRepository;
    this.fileUploadService = new awsFileUpload(new AwsConfig());
  }

  async getServices(): Promise<Service[]> {
    try {
      const services = await this.DoctorRepository.getServices();
      return services;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addQualification(
    data: any,
    files: Express.Multer.File[]
  ): Promise<any> {
    const {
      hospital,
      degree,
      speciality,
      experience,
      country,
      achievements,
      doctorId,
    } = data;
    console.log("1", data);

    console.log("2");
    // File Upload Handling
    let uploadedCertificates: string[] = [];
    if (files && files.length > 0) {
      uploadedCertificates = await this.fileUploadService.uploadCertificates(
        doctorId,
        files
      );
    }
    console.log("3");
    const qualificationData = {
      hospital,
      degree,
      speciality,
      experience,
      country,
      achievements,
      certificate: uploadedCertificates,
    };
    console.log("4");
    // Pass to repository for update
    const result = await this.DoctorRepository.addQualification(
      qualificationData,
      doctorId
    );
    console.log("5");
    return result;
  }

  async getQualifications(id: string): Promise<any> {
    try {
      const qualification = await this.DoctorRepository.getQualifications(id);
      return qualification;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
