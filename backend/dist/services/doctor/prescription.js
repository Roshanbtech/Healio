"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const appointmentModel_1 = __importDefault(require("../../model/appointmentModel"));
const uploadFiles_1 = require("../../helper/uploadFiles");
const s3Config_1 = require("../../config/s3Config");
class PrescriptionService {
    constructor(prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.aws = new uploadFiles_1.awsFileUpload(new s3Config_1.AwsConfig());
    }
    async addPrescription(data) {
        try {
            // If the signature field is a file (not a URL string), upload it.
            if (data.signature && typeof data.signature !== "string") {
                const file = data.signature;
                const uploadedUrl = await this.aws.uploadPrescriptionSignature(data.doctorId, data.signature);
                data.signature = uploadedUrl;
            }
            const prescription = await this.prescriptionRepository.addPrescription(data);
            await appointmentModel_1.default.findOneAndUpdate({ _id: data.appointmentId }, { prescription: prescription._id }, { new: true });
            return prescription;
        }
        catch (error) {
            throw new Error(error);
        }
    }
}
exports.PrescriptionService = PrescriptionService;
