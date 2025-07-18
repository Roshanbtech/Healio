"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const appointmentModel_1 = __importDefault(require("../../model/appointmentModel"));
// import { awsFileUpload } from "../../helper/uploadFiles";
// import { AwsConfig } from "../../config/s3Config";
const uploadFile_1 = require("../../helper/uploadFile");
const cloudinaryConfig_1 = require("../../config/cloudinaryConfig");
class PrescriptionService {
    constructor(prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
        // this.aws = new awsFileUpload(new AwsConfig());
        this.fileUploadService = new uploadFile_1.CloudinaryFileUpload(new cloudinaryConfig_1.CloudinaryConfig());
    }
    async addPrescription(data) {
        try {
            // If the signature field is a file (not a URL string), upload it.
            if (data.signature && typeof data.signature !== "string") {
                const file = data.signature;
                const uploadedUrl = await this.fileUploadService.uploadPrescriptionSignature(data.doctorId, data.signature);
                data.signature = uploadedUrl;
            }
            const prescription = await this.prescriptionRepository.addPrescription(data);
            await appointmentModel_1.default.findOneAndUpdate({ _id: data.appointmentId }, { prescription: prescription._id }, { new: true });
            return prescription;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to add prescription: ${error.message}`);
            }
            else {
                throw new Error("An unexpected error occurred while adding prescription.");
            }
        }
    }
}
exports.PrescriptionService = PrescriptionService;
