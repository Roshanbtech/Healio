import { Request, Response, NextFunction } from "express";
import HTTP_statusCode from "../../enums/httpStatusCode";
import { IPrescriptionService } from "../../interface/doctor/Prescription.service.interface";

export class PrescriptionController {
  private prescriptionService: IPrescriptionService;
  constructor(prescriptionServiceInstance: IPrescriptionService) {
    this.prescriptionService = prescriptionServiceInstance;
  }

  async addPrescription(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const appointmentId = req.params.appointmentId;
      const {
        patientId,
        doctorId,
        diagnosis,
        advice,
        followUpDate,
        doctorNotes,
      } = req.body;

      // Parse JSON strings if necessary
      let medicines = req.body.medicines;
      let labTests = req.body.labTests;

      if (typeof medicines === "string") {
        try {
          medicines = JSON.parse(medicines);
        } catch (err) {
          return res.status(HTTP_statusCode.BadRequest).json({
            status: false,
            data: null,
            message: "Invalid medicines format",
          });
        }
      }

      if (typeof labTests === "string") {
        try {
          labTests = JSON.parse(labTests);
        } catch (err) {
          return res.status(HTTP_statusCode.BadRequest).json({
            status: false,
            data: null,
            message: "Invalid labTests format",
          });
        }
      }

      if (!req.file) {
        return res.status(HTTP_statusCode.BadRequest).json({
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
        signature: signatureFile as unknown as File,
      };

      const prescription = await this.prescriptionService.addPrescription(prescriptionData);
      return res.status(HTTP_statusCode.OK).json({
        status: true,
        data: { prescription },
        message: "Prescription added successfully",
      });
    } catch (error: any) {
      next(error);
    }
  }
}
