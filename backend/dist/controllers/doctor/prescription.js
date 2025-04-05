"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const httpStatusCode_1 = __importDefault(require("../../enums/httpStatusCode"));
class PrescriptionController {
    constructor(prescriptionServiceInstance) {
        this.prescriptionService = prescriptionServiceInstance;
    }
    async addPrescription(req, res, next) {
        try {
            const appointmentId = req.params.appointmentId;
            const { patientId, doctorId, diagnosis, advice, followUpDate, doctorNotes, } = req.body;
            // Parse JSON strings if necessary
            let medicines = req.body.medicines;
            let labTests = req.body.labTests;
            if (typeof medicines === "string") {
                try {
                    medicines = JSON.parse(medicines);
                }
                catch (err) {
                    return res.status(httpStatusCode_1.default.BadRequest).json({
                        status: false,
                        data: null,
                        message: "Invalid medicines format",
                    });
                }
            }
            if (typeof labTests === "string") {
                try {
                    labTests = JSON.parse(labTests);
                }
                catch (err) {
                    return res.status(httpStatusCode_1.default.BadRequest).json({
                        status: false,
                        data: null,
                        message: "Invalid labTests format",
                    });
                }
            }
            if (!req.file) {
                return res.status(httpStatusCode_1.default.BadRequest).json({
                    status: false,
                    data: null,
                    message: "Prescription image is required",
                });
            }
            const signatureFile = req.file;
            const prescriptionData = {
                appointmentId,
                patientId,
                doctorId,
                diagnosis,
                medicines,
                labTests,
                advice,
                followUpDate,
                doctorNotes,
                signature: signatureFile,
            };
            const prescription = await this.prescriptionService.addPrescription(prescriptionData);
            return res.status(httpStatusCode_1.default.OK).json({
                status: true,
                data: { prescription },
                message: "Prescription added successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PrescriptionController = PrescriptionController;
